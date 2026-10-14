/* =====================================================================
   CẤU HÌNH SỰ KIỆN: MỪNG NGÀY PHỤ NỮ VIỆT NAM 20-10
   Đánh quái nhặt nguyên liệu → mang đến NPC Hoa Nương (ở các thôn, thành) ghép thành phẩm
   → dùng thành phẩm nhận kinh nghiệm và quà.
   - Chơi qua máy chủ (VPS): sửa xong lưu lại là có tác dụng, người chơi tải lại trang để thấy.
   - Nếu file này lỗi cú pháp hoặc bị xóa, game dùng cấu hình mặc định.
   - Ngày giờ tính theo giờ máy chủ (hoặc giờ máy người chơi khi chơi một mình).
   ===================================================================== */
window.EVENT_CFG={
  phuNu2010:{
    batDau:'10-07',      // tháng-ngày bắt đầu (mỗi năm)
    ketThuc:'11-15',     // tháng-ngày kết thúc (hết ngày này thì không rơi nguyên liệu, không ghép được nữa)
    capToiThieu:10,      // cấp nhân vật tối thiểu để nhặt nguyên liệu
    quaiChenhCap:15,     // quái thấp hơn nhân vật quá số cấp này thì không rơi nguyên liệu
    heSoBoss:8,          // boss (kể cả Boss Hoàng Kim) rơi nguyên liệu với tỷ lệ nhân lên bấy nhiêu lần

    // NGUYÊN LIỆU RƠI KHI ĐÁNH QUÁI: mỗi con quái tung riêng từng dòng, tyLe tính theo phần trăm
    roiNguyenLieu:[
      {ma:'ev_hong',    tyLe:6},     // Cành Hoa Hồng
      {ma:'ev_cuc',     tyLe:6},     // Cành Hoa Cúc
      {ma:'ev_giay',    tyLe:4},     // Giấy Gói Hoa
      {ma:'ev_lan',     tyLe:2.5},   // Hoa Lan
      {ma:'ev_bachhop', tyLe:2.5},   // Bách Hợp
      {ma:'ev_lua',     tyLe:2},     // Dải Lụa Hồng
      {ma:'ev_son',     tyLe:0.8},   // Thỏi Son
      {ma:'ev_guong',   tyLe:0.8},   // Gương Đồng
      {ma:'ev_luoc',    tyLe:0.8},   // Lược Ngà
      {ma:'ev_kep',     tyLe:0.8},   // Kẹp Tóc
    ],

    // CÔNG THỨC GHÉP Ở NPC HOA NƯƠNG
    //   can       : nguyên liệu cần { mã: số lượng }
    //   nganLuong : tiền ngân lượng phải trả mỗi lần ghép (10000 = 1 vạn lượng)
    //   xu        : tiền xu phải trả mỗi lần ghép (trong hành trang)
    congThuc:[
      {ra:'ev_bohong',  can:{ev_hong:5, ev_giay:1},                 nganLuong:20000},
      {ra:'ev_bocuc',   can:{ev_cuc:5, ev_giay:1},                  nganLuong:20000},
      {ra:'ev_langhoa', can:{ev_lan:3, ev_bachhop:3, ev_lua:1},     nganLuong:100000},
      {ra:'ev_hopts',   can:{ev_son:1, ev_guong:1, ev_luoc:1, ev_kep:1, ev_lua:1}, xu:5},
      {ra:'ev_trian',   can:{ev_bohong:1, ev_bocuc:1, ev_langhoa:1, ev_lua:2},     xu:15},
    ],

    // DÙNG THÀNH PHẨM (ăn event)
    //   kinhNghiem : số điểm kinh nghiệm cố định nhận được mỗi lần dùng. Đủ lên cấp thì phần dư cộng sang cấp mới
    //                (có thể lên nhiều cấp một lần). Để tham khảo, điểm cần cho MỘT cấp trong game:
    //                cấp 50 ≈ 400.000 · cấp 60 ≈ 680.000 · cấp 80 ≈ 1,6 triệu · cấp 100 ≈ 3,1 triệu · cấp 120 ≈ 8 triệu · cấp 150 ≈ 33 triệu
    //   capDung    : cấp tối thiểu để dùng (điểm cố định rất lớn với nhân vật cấp thấp)
    //   gioiHan    : mỗi nhân vật dùng tối đa bao nhiêu cái trong một mùa sự kiện (0 = không giới hạn)
    //   qua        : quà kèm theo, cùng cách viết với bảng "roi" trong cau-hinh-boss.js
    //                ('trangbi' theo phẩm, 'bikip' theo cấp, 'vatpham' theo mã), tyLe theo phần trăm
    thanhPham:{
      ev_bohong:{kinhNghiem:2200, capDung:10, gioiHan:100, qua:[
        {loai:'vatpham', ma:'hp3', soLuong:2, tyLe:40},
        {loai:'vatpham', ma:'xp1', soLuong:1, tyLe:15},
        {loai:'vatpham', ma:'ttl', soLuong:1, tyLe:1},
      ]},
      ev_bocuc:{kinhNghiem:2200, capDung:10, gioiHan:100, qua:[
        {loai:'vatpham', ma:'mp3', soLuong:2, tyLe:40},
        {loai:'vatpham', ma:'xp1', soLuong:1, tyLe:15},
        {loai:'vatpham', ma:'pdl', soLuong:1, tyLe:1},
      ]},
      ev_langhoa:{kinhNghiem:5200, capDung:10, gioiHan:100, qua:[
        {loai:'vatpham', ma:'hp4', soLuong:3, tyLe:50},
        {loai:'vatpham', ma:'xp2', soLuong:1, tyLe:25},
        {loai:'vatpham', ma:'ltt', soLuong:1, tyLe:8},
        {loai:'trangbi', pham:'xanh', soLuong:1, tyLe:15},
      ]},
      ev_hopts:{kinhNghiem:13000, capDung:10, gioiHan:100, qua:[
        {loai:'trangbi', pham:'xanh',     soLuong:1, tyLe:60},
        {loai:'trangbi', pham:'hoangkim', soLuong:1, tyLe:3},
        {loai:'vatpham', ma:'ttl', soLuong:1, tyLe:20},
        {loai:'vatpham', ma:'pdl', soLuong:1, tyLe:20},
        {loai:'vatpham', ma:'thb', soLuong:1, tyLe:5},
      ]},
      ev_trian:{kinhNghiem:34800, capDung:10, gioiHan:100, qua:[
        {loai:'trangbi', pham:'hoangkim', soLuong:1, tyLe:12},
        {loai:'bikip',   cap:90, phaiMinh:true, tyLe:10},
        {loai:'vatpham', ma:'xp3', soLuong:1, tyLe:30},
        {loai:'vatpham', ma:'thb', soLuong:1, tyLe:15},
        {loai:'vatpham', ma:'hsd', soLuong:1, tyLe:20},
      ]},
    }
  }
};
/* Mã vật phẩm sự kiện:
   Nguyên liệu: ev_hong Cành Hoa Hồng · ev_cuc Cành Hoa Cúc · ev_lan Hoa Lan · ev_bachhop Bách Hợp · ev_giay Giấy Gói Hoa
                ev_lua Dải Lụa Hồng · ev_son Thỏi Son · ev_guong Gương Đồng · ev_luoc Lược Ngà · ev_kep Kẹp Tóc
   Thành phẩm : ev_bohong Bó Hoa Hồng · ev_bocuc Bó Hoa Cúc · ev_langhoa Lẵng Hoa Lan Bách Hợp
                ev_hopts Hộp Trang Sức · ev_trian Lễ Hoa Tri Ân 20-10
   Mã vật phẩm thường dùng làm quà: xem cuối file cau-hinh-boss.js */
