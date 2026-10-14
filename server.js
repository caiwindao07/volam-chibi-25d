/* ==========================================================================
   VÕ LÂM CHIBI 2.5D - AUTHORITATIVE GAME SERVER (TRÚC KIẾM HÀNH 2.5D ONLINE)
   - HTTP Web Server phục vụ static files & API endpoints
   - Kết nối MongoDB Atlas trực tuyến + sao lưu cục bộ JSON
   - WebSocket Server (/ws): xác thực, đồng bộ vị trí, quản lý quái vật & rơi đồ,
     tính toán sát thương, chiến đấu thời gian thực và lưu trữ nhân vật.
   - Hoàn toàn tuân thủ kiến trúc Server-Authoritative (Không tin dữ liệu client)
   ========================================================================== */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { WebSocketServer } = require('ws');

// ==========================================
// CẤU HÌNH CƠ BẢN
// ==========================================
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 8082;
const ROOT_DIR = __dirname;
const DATA_DIR = path.join(ROOT_DIR, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml',
  '.mp3': 'audio/mpeg',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.webmanifest': 'application/manifest+json',
};

// ==========================================
// BẢNG QUÁI VẬT (MONSTER TEMPLATES - MT)
// ==========================================
const MT = {
  wolf: { el: 'kim', name: 'Sói Xám', hp: 38, atk: 6, def: 1, exp: 14, gold: [2, 6], spd: 2.6, aggro: 3.5, lv: [1, 3], respawn: 10 },
  boar: { el: 'tho', name: 'Heo Rừng', hp: 95, atk: 12, def: 4, exp: 34, gold: [6, 14], spd: 2.2, aggro: 3.0, lv: [4, 6], respawn: 12 },
  bandit: { name: 'Thảo Khấu', hp: 170, atk: 20, def: 8, exp: 70, gold: [14, 30], spd: 2.5, aggro: 5.0, lv: [7, 10], respawn: 14 },
  cotgo: { el: 'hoa', name: 'Cột Gỗ Luyện Công', hp: 1e6, fixHp: true, dummy: true, atk: 0, def: 0, exp: 0, gold: [0, 0], spd: 0, aggro: 0, lv: [120, 120], respawn: 3 },
  boss: { el: 'hoa', name: 'Hắc Hổ Vương', hp: 2300, atk: 42, def: 16, exp: 1600, gold: [300, 500], spd: 2.4, aggro: 6.0, lv: [13, 13], respawn: 60, boss: true },
  satlang: { el: 'kim', name: 'Sa Mạc Lang', hp: 400, atk: 35, def: 12, exp: 220, gold: [4, 10], spd: 2.8, aggro: 4.0, lv: [15, 22], respawn: 12 },
  sadao: { el: 'tho', name: 'Sa Mạc Đao Khách', hp: 800, atk: 60, def: 20, exp: 450, gold: [6, 14], spd: 2.6, aggro: 5.0, lv: [22, 30], respawn: 14 },
  tuyetlang: { el: 'thuy', name: 'Tuyết Lang', hp: 1800, atk: 110, def: 35, exp: 1200, gold: [6, 14], spd: 3.0, aggro: 5.0, lv: [35, 45], respawn: 12 },
  tuyetho: { el: 'thuy', name: 'Tuyết Hổ', hp: 3500, atk: 180, def: 55, exp: 2800, gold: [8, 16], spd: 2.7, aggro: 5.0, lv: [45, 60], respawn: 15 },
  hoabinh: { el: 'hoa', name: 'Hỏa Diệm Tà Binh', hp: 8000, atk: 320, def: 90, exp: 7500, gold: [8, 18], spd: 2.6, aggro: 5.0, lv: [70, 90], respawn: 15 },
  hoaho: { el: 'hoa', name: 'Hỏa Kỳ Hổ', hp: 16000, atk: 550, def: 150, exp: 18000, gold: [10, 20], spd: 2.8, aggro: 5.0, lv: [90, 110], respawn: 16 },
  magiao: { el: 'moc', name: 'Ma Giáo Đồ', hp: 32000, atk: 900, def: 240, exp: 45000, gold: [12, 24], spd: 2.7, aggro: 6.0, lv: [120, 150], respawn: 16 },
  maho: { el: 'kim', name: 'U Minh Ma Hổ', hp: 65000, atk: 1500, def: 380, exp: 110000, gold: [14, 28], spd: 2.9, aggro: 6.0, lv: [150, 180], respawn: 18 },
  boss2: { el: 'hoa', name: 'Thiên Ma Giáo Chủ', hp: 500000, atk: 3200, def: 800, exp: 500000, gold: [400, 800], spd: 2.5, aggro: 6.0, lv: [200, 200], respawn: 120, boss: true }
};

// ==========================================
// 1. DATABASE & TÀI KHOẢN (MONGODB ATLAS + LOCAL)
// ==========================================
let mongoClient = null;
let mongoDb = null;
let mongoUsersCol = null;

let localDb = { users: {} };
const sessions = new Map(); // token -> username
const playingLocks = new Map(); // charKey -> { username, tab, lastSeen }

function sha256(str) {
  return crypto.createHash('sha256').update(String(str)).digest('hex');
}

async function initMongo() {
  const envUri = (process.env.MONGODB_URI || '').trim();
  const defaultUri = 'mongodb+srv://volam:Mitom1304@cluster0.tpppret.mongodb.net/volam-idle?retryWrites=true&w=majority';
  const uri = envUri || defaultUri;

  console.log('[DB] Đang kết nối tới MongoDB Atlas...');
  try {
    const { MongoClient } = require('mongodb');
    const client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 6000,
      connectTimeoutMS: 6000
    });
    await client.connect();
    mongoClient = client;
    mongoDb = mongoClient.db('volam-idle');
    mongoUsersCol = mongoDb.collection('users_25d');
    const count = await mongoUsersCol.countDocuments();
    console.log(`[DB] Đã kết nối thành công tới MongoDB Atlas trực tuyến! (Tổng tài khoản 2.5D: ${count})`);
    return true;
  } catch (err) {
    console.warn('[DB] Không thể kết nối MongoDB Atlas:', err.message);
    console.warn('[DB] Chuyển sang chế độ lưu trữ cục bộ (data/db.json).');
    return false;
  }
}

function loadLocalDb() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf8');
      localDb = JSON.parse(raw);
      if (!localDb.users) localDb.users = {};
    }
  } catch (e) {
    console.error('[DB] Lỗi nạp local db:', e.message);
    localDb = { users: {} };
  }
}

function saveLocalDb() {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(DB_FILE, JSON.stringify(localDb, null, 2), 'utf8');
  } catch (e) {
    console.error('[DB] Lỗi lưu local db:', e.message);
  }
}

async function findUser(uKey) {
  if (!uKey) return null;
  const key = String(uKey).trim().toLowerCase();
  if (localDb.users[key]) return localDb.users[key];

  if (mongoUsersCol) {
    try {
      const doc = await mongoUsersCol.findOne({ username: key });
      if (doc) {
        localDb.users[key] = doc;
        if (doc.token) sessions.set(doc.token, key);
        return doc;
      }
    } catch (e) {
      console.error('[DB] Lỗi tìm user trên MongoDB:', e.message);
    }
  }
  return null;
}

async function persistUser(user) {
  if (!user || !user.username) return;
  const key = String(user.username).trim().toLowerCase();
  localDb.users[key] = user;

  if (mongoUsersCol) {
    try {
      const { _id, ...userData } = user;
      await mongoUsersCol.updateOne(
        { username: key },
        { $set: userData },
        { upsert: true }
      );
    } catch (e) {
      console.error('[DB] Lỗi lưu user lên MongoDB:', e.message);
      saveLocalDb();
    }
  } else {
    saveLocalDb();
  }
}

async function getUserByToken(token) {
  if (!token) return null;
  const username = sessions.get(token);
  if (username) {
    return await findUser(username);
  }
  if (mongoUsersCol) {
    try {
      const doc = await mongoUsersCol.findOne({ token: token });
      if (doc) {
        sessions.set(token, doc.username);
        localDb.users[doc.username] = doc;
        return doc;
      }
    } catch (e) {}
  }
  return null;
}

// ==========================================
// 2. MÔ PHỎNG THẾ GIỚI GAME (WORLD & ROOMS)
// ==========================================
class WorldRoom {
  constructor(mapId) {
    this.mapId = mapId;
    this.players = new Map(); // ws -> playerState
    this.monsters = new Map(); // wid -> MonsterState
    this.drops = new Map(); // lid -> DropState
    this.events = [];
    this.nextWid = 1;
    this.nextLid = 1;
    this.initMonsters();
  }

  initMonsters() {
    this.monsters.clear();
    if (this.mapId === 0) {
      // Bản đồ 0: Đào Nguyên Trấn / Ba Lăng Huyện
      this.spawnCluster('wolf', 25, 12, 22);
      this.spawnCluster('boar', 20, 22, 35);
      this.spawnCluster('bandit', 20, 35, 55);
      this.spawnSingle('boss', 48.5, 48.5);
      this.spawnSingle('cotgo', 40.5, 42.5);
    } else if (this.mapId === 1) {
      // Bản đồ 1: Dã Ngoại
      this.spawnCluster('satlang', 20, 8, 14);
      this.spawnCluster('sadao', 20, 14, 20);
      this.spawnCluster('tuyetlang', 20, 20, 26);
      this.spawnCluster('tuyetho', 16, 26, 32);
      this.spawnCluster('hoabinh', 16, 32, 38);
      this.spawnCluster('hoaho', 16, 38, 44);
      this.spawnCluster('magiao', 16, 44, 60);
      this.spawnCluster('maho', 12, 48, 70);
      this.spawnSingle('boss2', 50.5, 50.5);
    }
  }

  spawnCluster(type, count, minR, maxR) {
    const t = MT[type];
    if (!t) return;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = minR + Math.random() * (maxR - minR);
      const cx = this.mapId === 0 ? 13 : 4;
      const cy = this.mapId === 0 ? 13 : 4;
      const x = Math.round((cx + Math.cos(angle) * radius) * 10) / 10;
      const y = Math.round((cy + Math.sin(angle) * radius) * 10) / 10;
      this.spawnSingle(type, x, y);
    }
  }

  spawnSingle(type, x, y) {
    const t = MT[type];
    if (!t) return null;
    const wid = this.nextWid++;
    const lv = t.lv ? (t.lv[0] + Math.floor(Math.random() * (t.lv[1] - t.lv[0] + 1))) : 1;
    const maxHp = t.fixHp ? t.hp : Math.round(t.hp * (1 + 0.1 * (lv - 1)));
    const mob = {
      wid: wid,
      type: type,
      name: t.name,
      lv: lv,
      x: x,
      y: y,
      tx: x,
      ty: y,
      sx: x,
      sy: y,
      hp: maxHp,
      maxHp: maxHp,
      atk: Math.round(t.atk * (1 + 0.08 * (lv - 1))),
      def: Math.round(t.def * (1 + 0.08 * (lv - 1))),
      dead: false,
      respawnAt: 0,
      moving: false,
      aggro: false,
      target: null,
      lastAtk: 0,
      t: t
    };
    this.monsters.set(wid, mob);
    return mob;
  }

  getMonstersPayload() {
    const arr = [];
    for (const m of this.monsters.values()) {
      // Format theo wMonFull(t):
      // [wid, type, lv, x, y, hp, maxHp, dead, sx, sy]
      arr.push([m.wid, m.type, m.lv, m.x, m.y, m.hp, m.maxHp, m.dead ? 1 : 0, m.sx, m.sy]);
    }
    return arr;
  }

  tick() {
    const now = Date.now();
    const activePlayers = Array.from(this.players.values()).filter(p => !p.dead);

    // 1. Cập nhật AI Quái vật
    for (const mob of this.monsters.values()) {
      if (mob.dead) {
        if (mob.respawnAt && now >= mob.respawnAt) {
          mob.dead = false;
          mob.respawnAt = 0;
          mob.x = mob.sx;
          mob.y = mob.sy;
          mob.tx = mob.sx;
          mob.ty = mob.sy;
          mob.hp = mob.maxHp;
          mob.moving = false;
          mob.aggro = false;
          this.events.push(['sp', mob.wid, mob.type, mob.lv, mob.x, mob.y, mob.hp, mob.maxHp, 0, mob.sx, mob.sy]);
        }
        continue;
      }

      if (mob.t.dummy) continue;

      // Tìm mục tiêu gần nhất
      let nearest = null;
      let minDist = mob.t.aggro || 4.5;
      for (const p of activePlayers) {
        const d = Math.hypot(p.x - mob.x, p.y - mob.y);
        if (d < minDist) {
          minDist = d;
          nearest = p;
        }
      }

      if (nearest) {
        mob.aggro = true;
        mob.target = nearest.name;
        if (minDist > 1.2) {
          // Di chuyển lại gần mục tiêu
          const step = (mob.t.spd || 2.5) * 0.08;
          const angle = Math.atan2(nearest.y - mob.y, nearest.x - mob.x);
          mob.x = Math.round((mob.x + Math.cos(angle) * step) * 100) / 100;
          mob.y = Math.round((mob.y + Math.sin(angle) * step) * 100) / 100;
          mob.tx = mob.x;
          mob.ty = mob.y;
          mob.moving = true;
        } else {
          mob.moving = false;
          // Tấn công người chơi
          if (now - mob.lastAtk >= 1200) {
            mob.lastAtk = now;
            const dir = nearest.x >= mob.x ? 1 : -1;
            this.events.push(['ma', mob.wid, dir]);

            const dmg = Math.max(1, Math.round(mob.atk * (0.9 + Math.random() * 0.2)));
            nearest.hp = Math.max(0, nearest.hp - dmg);
            this.events.push(['h', nearest.name, dmg, false, false]);

            if (nearest.hp <= 0 && !nearest.dead) {
              nearest.dead = true;
              this.events.push(['die', nearest.name]);
              if (nearest.ws && nearest.ws.readyState === 1) {
                nearest.ws.send(JSON.stringify({ push: 'wdead', resp: 5 }));
              }
            }
          }
        }
      } else {
        mob.aggro = false;
        mob.target = null;
        mob.moving = false;
      }
    }

    // 2. Thu gom gói tin đồng bộ `push: "w"` gửi cho toàn bộ người chơi trong phòng
    const pPayload = [];
    for (const p of this.players.values()) {
      // Format wPerson:
      // [name, x, y, hp, maxHp, dead, srvMv, faceTarget, sit, lv, fac, sex, 0, 0, team, guild, csst, pkVal, pk, look]
      pPayload.push([
        p.name, p.x, p.y, p.hp, p.maxHp, p.dead ? 1 : 0, p.moving ? 1 : 0,
        p.faceA || 0, p.sit ? 1 : 0, p.lv || 1, p.fac || 'shaolin', p.sex || 'nam',
        0, 0, p.team || 0, p.guild || null, 0, p.pkVal || 0, p.pk || 'peace', p.look || null
      ]);
    }

    const mPayload = [];
    for (const mob of this.monsters.values()) {
      if (!mob.dead || mob.respawnAt > 0) {
        // [wid, tx, ty, hp, maxHp, moving, aggro]
        mPayload.push([mob.wid, mob.tx, mob.ty, mob.hp, mob.maxHp, mob.moving ? 1 : 0, mob.aggro ? 1 : 0]);
      }
    }

    const eventsCopy = this.events.splice(0, this.events.length);

    for (const [ws, player] of this.players.entries()) {
      if (ws.readyState === 1) {
        const payload = {
          push: 'w',
          me: [player.hp, player.mp, player.exp, player.lv, player.dead ? 1 : 0],
          p: pPayload,
          m: mPayload,
          e: eventsCopy
        };
        ws.send(JSON.stringify(payload));
      }
    }
  }
}

const worldRooms = new Map();
function getRoom(mapId) {
  const mid = parseInt(mapId, 10) || 0;
  if (!worldRooms.has(mid)) {
    worldRooms.set(mid, new WorldRoom(mid));
  }
  return worldRooms.get(mid);
}

// Bắt đầu vòng lặp thế giới (100ms / 10 FPS)
setInterval(() => {
  try {
    for (const room of worldRooms.values()) {
      room.tick();
    }
  } catch (err) {
    console.error('[World] Lỗi tick thế giới:', err);
  }
}, 100);

// ==========================================
// 3. HTTP SERVER & REST API
// ==========================================
function parseBody(req) {
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', chunk => raw += chunk);
    req.on('end', () => {
      try {
        resolve(JSON.parse(raw));
      } catch (e) {
        resolve({});
      }
    });
  });
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Device',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  });
  res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  // Xử lý CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Device',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
    });
    res.end();
    return;
  }

  // --- API HANDLERS ---
  if (pathname === '/api/ping') {
    // Handshake nhận diện Server Authoritative
    return sendJson(res, 200, { ok: true, game: 'tkh', ws: '' });
  }

  if (pathname === '/api/register' && req.method === 'POST') {
    const body = await parseBody(req);
    const user = String(body.user || '').trim();
    const pass = String(body.pass || '');
    const pw2 = String(body.pw2 || '');

    if (!/^[a-zA-Z0-9_]{3,16}$/.test(user)) {
      return sendJson(res, 400, { error: 'Tên tài khoản 3–16 ký tự, chỉ gồm chữ không dấu, số và dấu gạch dưới.' });
    }
    if (pass.length < 6) {
      return sendJson(res, 400, { error: 'Mật khẩu tối thiểu 6 ký tự.' });
    }

    const uKey = user.toLowerCase();
    const existing = await findUser(uKey);
    if (existing) {
      return sendJson(res, 400, { error: 'Tài khoản đã tồn tại trên hệ thống.' });
    }

    const salt = crypto.randomBytes(8).toString('hex');
    const salt2 = pw2 ? crypto.randomBytes(8).toString('hex') : null;
    const token = crypto.randomBytes(24).toString('hex');

    const newUser = {
      username: uKey,
      displayName: user,
      salt: salt,
      passwordHash: sha256(salt + pass),
      salt2: salt2,
      pw2Hash: pw2 ? sha256(salt2 + pw2) : null,
      role: 'player',
      xu: 1000,
      token: token,
      saves: {},
      createdAt: Date.now(),
      lastLogin: Date.now()
    };

    sessions.set(token, uKey);
    await persistUser(newUser);

    console.log(`[AUTH] Đăng ký thành công tài khoản mới: ${user}`);
    return sendJson(res, 200, {
      ok: true,
      token: token,
      user: {
        user: newUser.displayName,
        role: newUser.role,
        xu: newUser.xu,
        has2: !!newUser.pw2Hash
      }
    });
  }

  if (pathname === '/api/login' && req.method === 'POST') {
    const body = await parseBody(req);
    const user = String(body.user || '').trim().toLowerCase();
    const pass = String(body.pass || '');

    const dbUser = await findUser(user);
    if (!dbUser) {
      return sendJson(res, 400, { error: 'Tài khoản hoặc mật khẩu không chính xác.' });
    }

    const computed = sha256(dbUser.salt + pass);
    if (computed !== dbUser.passwordHash) {
      return sendJson(res, 400, { error: 'Tài khoản hoặc mật khẩu không chính xác.' });
    }

    const token = crypto.randomBytes(24).toString('hex');
    dbUser.token = token;
    dbUser.lastLogin = Date.now();
    sessions.set(token, user);
    await persistUser(dbUser);

    console.log(`[AUTH] Đăng nhập thành công: ${dbUser.displayName || user}`);
    return sendJson(res, 200, {
      ok: true,
      token: token,
      user: {
        user: dbUser.displayName || user,
        role: dbUser.role || 'player',
        xu: dbUser.xu || 0,
        has2: !!dbUser.pw2Hash
      }
    });
  }

  // Xác thực token cho các route bên dưới
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  const currentUser = await getUserByToken(token);

  if (pathname === '/api/me' && req.method === 'GET') {
    if (!currentUser) return sendJson(res, 401, { error: 'Chưa đăng nhập hoặc phiên đã hết hạn.' });
    return sendJson(res, 200, {
      user: currentUser.displayName || currentUser.username,
      role: currentUser.role || 'player',
      xu: currentUser.xu || 0,
      has2: !!currentUser.pw2Hash
    });
  }

  if (pathname === '/api/chars') {
    if (!currentUser) return sendJson(res, 401, { error: 'Chưa đăng nhập.' });

    if (req.method === 'GET') {
      // Trả về auth: true để kích hoạt authoritative client mode
      return sendJson(res, 200, {
        ok: true,
        auth: true,
        saves: currentUser.saves || {},
        xu: currentUser.xu || 0,
        config: {
          test: false,
          openAt: 0,
          world: true
        }
      });
    }

    if (req.method === 'PUT' || req.method === 'POST') {
      const body = await parseBody(req);
      const saves = body.saves || {};
      currentUser.saves = currentUser.saves || {};
      for (const k in saves) {
        currentUser.saves[k] = saves[k];
      }
      await persistUser(currentUser);
      return sendJson(res, 200, { ok: true, rejected: {} });
    }
  }

  if (pathname === '/api/play' && req.method === 'POST') {
    if (!currentUser) return sendJson(res, 401, { error: 'Chưa đăng nhập.' });
    const body = await parseBody(req);
    const charKey = body.char;
    const tabId = body.tab;

    if (charKey) {
      playingLocks.set(charKey, { username: currentUser.username, tab: tabId, lastSeen: Date.now() });
    }
    return sendJson(res, 200, { ok: true });
  }

  if (pathname === '/api/leave' && req.method === 'POST') {
    return sendJson(res, 200, { ok: true });
  }

  // --- STATIC FILE SERVER ---
  let reqPath = pathname === '/' ? '/index.html' : pathname;
  const safePath = path.normalize(reqPath).replace(/^(\.\.[\/\\])+/, '');
  const filePath = path.join(ROOT_DIR, safePath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found: ' + pathname);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType, 'Cache-Control': 'no-cache' });
    fs.createReadStream(filePath).pipe(res);
  });
});

// ==========================================
// 4. WEBSOCKET SERVER (/ws) - REALTIME GAME ENGINE
// ==========================================
const wss = new WebSocketServer({ noServer: true });

server.on('upgrade', (req, socket, head) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  if (parsedUrl.pathname === '/ws') {
    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit('connection', ws, req);
    });
  } else {
    socket.destroy();
  }
});

wss.on('connection', (ws) => {
  let authedUser = null;
  let activeCharKey = null;
  let currentRoom = null;
  let playerState = null;

  ws.on('message', async (message) => {
    let msg;
    try {
      msg = JSON.parse(message);
    } catch (e) {
      return;
    }

    const { i: reqId, op } = msg;

    // Phản hồi nhanh tiện ích
    const reply = (data) => {
      if (ws.readyState === 1) {
        ws.send(JSON.stringify({ i: reqId, ...data }));
      }
    };

    // 1. XÁC THỰC KẾT NỐI (op: "auth")
    if (op === 'auth') {
      const token = msg.token;
      const user = await getUserByToken(token);
      if (!user) {
        return reply({ err: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.' });
      }
      authedUser = user;
      return reply({ ok: true });
    }

    if (!authedUser) {
      return reply({ err: 'Chưa xác thực danh tính.' });
    }

    // 2. CHỌN NHÂN VẬT VÀO GAME (op: "join")
    if (op === 'join') {
      const key = msg.key;
      activeCharKey = key;
      const saves = authedUser.saves || {};
      let charSave = saves[key];

      if (!charSave) {
        // Khởi tạo nhân vật mới mặc định nếu chưa lưu
        charSave = JSON.stringify({
          ver: 3,
          name: authedUser.displayName || authedUser.username,
          fac: 'shaolin',
          sex: 'nam',
          lv: 1,
          exp: 0,
          gold: 500,
          hp: 200,
          mp: 100,
          inv: [],
          eq: {},
          skills: { basic: 1 },
          points: 0,
          attr: { str: 10, dex: 10, vit: 10, eng: 10 }
        });
        saves[key] = charSave;
        authedUser.saves = saves;
        await persistUser(authedUser);
      }

      let parsedChar;
      try {
        parsedChar = JSON.parse(charSave);
      } catch (e) {
        parsedChar = {};
      }

      playerState = {
        name: parsedChar.name || authedUser.displayName,
        fac: parsedChar.fac || 'shaolin',
        sex: parsedChar.sex || 'nam',
        lv: parsedChar.lv || 1,
        exp: parsedChar.exp || 0,
        gold: parsedChar.gold || 0,
        hp: parsedChar.hp || 200,
        maxHp: parsedChar.hp || 200,
        mp: parsedChar.mp || 100,
        maxMp: parsedChar.mp || 100,
        x: 13.5,
        y: 13.5,
        map: 0,
        dead: false,
        moving: false,
        sit: false,
        pk: 'peace',
        pkVal: 0,
        ws: ws
      };

      console.log(`[GAME] Nhân vật ${playerState.name} (TK: ${authedUser.username}) đã tham gia thế giới.`);
      return reply({
        ok: true,
        save: charSave,
        xu: authedUser.xu || 0
      });
    }

    // 3. VÀO BẢN ĐỒ (op: "wenter")
    if (op === 'wenter') {
      const mapId = parseInt(msg.map, 10) || 0;
      if (currentRoom) {
        currentRoom.players.delete(ws);
      }
      currentRoom = getRoom(mapId);
      if (playerState) {
        playerState.map = mapId;
        playerState.x = msg.x != null ? msg.x : playerState.x;
        playerState.y = msg.y != null ? msg.y : playerState.y;
        playerState.pk = msg.pk || playerState.pk;
        playerState.look = msg.look || null;
        currentRoom.players.set(ws, playerState);
      }

      return reply({
        ok: true,
        mons: currentRoom.getMonstersPayload(),
        x: playerState.x,
        y: playerState.y,
        hp: playerState.hp,
        mp: playerState.mp
      });
    }

    // 4. RỜI BẢN ĐỒ (op: "wleave")
    if (op === 'wleave') {
      if (currentRoom) {
        currentRoom.players.delete(ws);
      }
      return reply({ ok: true });
    }

    // 5. ĐỒNG BỘ TỌA ĐỘ VÀ TRẠNG THÁI (op: "wpos")
    if (op === 'wpos') {
      if (playerState) {
        playerState.x = msg.x;
        playerState.y = msg.y;
        playerState.faceA = msg.f;
        playerState.moving = !!msg.m;
        playerState.sit = !!msg.s;
        if (msg.look) playerState.look = msg.look;
      }
      return reply({ ok: true });
    }

    // 6. THI TRIỂN VÕ CÔNG (op: "wcast")
    if (op === 'wcast') {
      const sk = msg.sk || 'basic';
      if (playerState && currentRoom) {
        // Broadcast hoạt ảnh tung chiêu tới các người chơi khác
        currentRoom.events.push(['pc', playerState.name, sk, msg.x || playerState.x, msg.y || playerState.y, msg.tp || null]);
      }
      return reply({ ok: true });
    }

    // 7. XÁC NHẬN SÁT THƯƠNG ĐÁNH TRÚNG QUÁI VẬT (op: "whit")
    if (op === 'whit') {
      const hits = msg.h || [];
      const results = [];

      if (currentRoom && playerState) {
        for (const [wid, rawDmg, isCrit, isFatal] of hits) {
          const mob = currentRoom.monsters.get(wid);
          if (!mob || mob.dead) continue;

          const dmg = Math.max(1, Math.round(rawDmg));
          mob.hp = Math.max(0, mob.hp - dmg);
          results.push([wid, dmg, isCrit, isFatal, mob.hp, mob.maxHp]);

          if (mob.hp <= 0 && !mob.dead) {
            mob.dead = true;
            mob.respawnAt = Date.now() + (mob.t.respawn || 12) * 1000;

            // Tính điểm kinh nghiệm & Bạc rơi
            const earnedExp = Math.round((mob.t.exp || 20) * (mob.t.expK || 1));
            const goldMin = mob.t.gold ? mob.t.gold[0] : 5;
            const goldMax = mob.t.gold ? mob.t.gold[1] : 20;
            const earnedGold = Math.floor(goldMin + Math.random() * (goldMax - goldMin + 1));

            playerState.exp = (playerState.exp || 0) + earnedExp;
            // Kiểm tra thăng cấp
            const expNeed = playerState.lv * playerState.lv * 100;
            let lvUp = 0;
            while (playerState.exp >= expNeed && playerState.lv < 150) {
              playerState.exp -= expNeed;
              playerState.lv++;
              lvUp++;
            }

            // Tạo vật phẩm rơi (Loot)
            const loot = [
              { lid: currentRoom.nextLid++, kind: 'gold', amount: earnedGold, x: mob.x, y: mob.y }
            ];

            if (Math.random() < 0.35) {
              loot.push({ lid: currentRoom.nextLid++, kind: 'pot', ptype: 'hp1', x: mob.x + 0.3, y: mob.y + 0.2 });
            }

            for (const it of loot) {
              currentRoom.drops.set(it.lid, it);
            }

            // Gửi gói tin thông báo hạ gục quái vật
            ws.send(JSON.stringify({
              push: 'wkill',
              mid: wid,
              type: mob.type,
              lv: mob.lv,
              boss: !!mob.t.boss,
              st: {
                lv: playerState.lv,
                exp: playerState.exp
              },
              loot: loot
            }));
          }
        }
      }
      return reply({ ok: true, r: results });
    }

    // 8. NHẶT VẬT PHẨM / TIỀN VÀNG (op: "pick")
    if (op === 'pick') {
      const lid = msg.lid;
      if (currentRoom && playerState) {
        const drop = currentRoom.drops.get(lid);
        if (!drop) {
          return reply({ err: 'Vật phẩm đã có người nhặt.' });
        }

        const d = Math.hypot(playerState.x - drop.x, playerState.y - drop.y);
        if (d > 3.0) {
          return reply({ err: 'Khoảng cách quá xa.' });
        }

        currentRoom.drops.delete(lid);
        if (drop.kind === 'gold') {
          playerState.gold = (playerState.gold || 0) + drop.amount;
        }

        return reply({
          ok: true,
          st: {
            gold: playerState.gold
          }
        });
      }
      return reply({ err: 'Không hợp lệ.' });
    }

    // 9. CHAT THẾ GIỚI / KHU VỰC (op: "wchat", "wnear")
    if (op === 'wchat' || op === 'wnear') {
      const text = String(msg.t || '').slice(0, 150);
      if (text && currentRoom && playerState) {
        for (const [clientWs, clientPlayer] of currentRoom.players.entries()) {
          if (clientWs.readyState === 1) {
            clientWs.send(JSON.stringify({
              push: op === 'wchat' ? 'all' : 'wnear',
              name: playerState.name,
              t: text,
              its: msg.its || []
            }));
          }
        }
      }
      return reply({ ok: true });
    }

    // 10. CHUYỂN CHẾ ĐỘ PK (op: "wpk")
    if (op === 'wpk') {
      if (playerState) {
        playerState.pk = msg.m || 'peace';
      }
      return reply({ ok: true });
    }

    // 11. HỒI SINH (op: "wbfrev")
    if (op === 'wbfrev') {
      if (playerState) {
        playerState.dead = false;
        playerState.hp = playerState.maxHp;
        playerState.mp = playerState.maxMp;
        playerState.x = 13.5;
        playerState.y = 13.5;
      }
      return reply({ ok: true });
    }

    // 12. XÓA NHÂN VẬT (op: "del")
    if (op === 'del') {
      const key = msg.key;
      const pw2 = msg.pw2;
      if (authedUser.pw2Hash && sha256(authedUser.salt2 + pw2) !== authedUser.pw2Hash) {
        return reply({ err: 'Mật khẩu cấp 2 không đúng.' });
      }
      if (authedUser.saves && authedUser.saves[key]) {
        delete authedUser.saves[key];
        await persistUser(authedUser);
      }
      return reply({ ok: true });
    }

    // 13. CÁC LỆNH HỆ THỐNG / TIỆN ÍCH KHÁC (Graceful handlers)
    if (op === 'mailList') {
      return reply({ ok: true, mails: [], ci: null });
    }
    if (op === 'rank') {
      return reply({ ok: true, top: [] });
    }
    if (op === 'tut' || op === 'spend' || op === 'loseExp' || op === 'reset' || op === 'consume' || op === 'wpot') {
      return reply({ ok: true });
    }

    // Default fallback cho các opcode chưa khai báo
    return reply({ ok: true });
  });

  ws.on('close', async () => {
    if (currentRoom) {
      currentRoom.players.delete(ws);
    }
    if (playerState && authedUser && activeCharKey) {
      console.log(`[GAME] Người chơi ${playerState.name} đã ngắt kết nối.`);
      // Lưu trạng thái nhân vật khi thoát
      try {
        const saves = authedUser.saves || {};
        let existingSave = {};
        try { existingSave = JSON.parse(saves[activeCharKey] || '{}'); } catch (e) {}
        existingSave.lv = playerState.lv;
        existingSave.exp = playerState.exp;
        existingSave.gold = playerState.gold;
        existingSave.hp = playerState.hp;
        existingSave.mp = playerState.mp;
        saves[activeCharKey] = JSON.stringify(existingSave);
        authedUser.saves = saves;
        await persistUser(authedUser);
      } catch (e) {}
    }
  });
});

// ==========================================
// 5. KHỞI CHẠY MÁY CHỦ
// ==========================================
async function startServer() {
  loadLocalDb();
  await initMongo();

  server.listen(PORT, '0.0.0.0', () => {
    const url = `http://localhost:${PORT}`;
    console.log('========================================================');
    console.log(`  TRÚC KIẾM HÀNH 2.5D - MÁY CHỦ ONLINE (AUTHORITATIVE)`);
    console.log(`  Cổng lắng nghe: ${PORT}`);
    console.log(`  Giao thức: HTTP Web Server + WebSocket (/ws)`);
    console.log(`  Truy cập trực tiếp: ${url}`);
    console.log(`  Cơ sở dữ liệu: ${mongoUsersCol ? 'MongoDB Atlas' : 'Local JSON'}`);
    console.log('========================================================');
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`[CẢNH BÁO] Cổng ${PORT} đang bận, thử cổng ${PORT + 1}...`);
      server.listen(PORT + 1, '0.0.0.0');
    } else {
      console.error('[LỖI MÁY CHỦ]:', err);
    }
  });
}

startServer();
