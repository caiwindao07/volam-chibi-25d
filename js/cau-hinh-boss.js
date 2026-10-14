/* =====================================================================
   CẤU HÌNH BOSS HOÀNG KIM MÔN PHÁI (19h30 mỗi ngày)
   Sửa file này để chỉnh sức mạnh boss, vật phẩm rơi và tỷ lệ rơi.
   - Chơi qua máy chủ (VPS): sửa xong lưu lại là có tác dụng, không cần khởi động lại máy chủ
     (người chơi tải lại trang để thấy boss mới).
   - Nếu file này bị lỗi cú pháp hoặc bị xóa, game dùng cấu hình mặc định.

   Mỗi dòng trong "roi" (đồ rơi) là một món, có các trường:
     loai     : 'trangbi'  → trang bị ngẫu nhiên đúng cấp boss
                'bikip'    → bí kíp võ công (cần thêm cap: 90, 120 hoặc 150)
                'vatpham'  → vật phẩm theo mã (xem bảng mã ở cuối file)
     pham     : (trang bị) 'trang', 'xanh' hoặc 'hoangkim'
     cap      : (bí kíp) 90, 120 hoặc 150
     phaiMinh : (bí kíp) true = bí kíp đúng phái của người hạ boss, false = phái bất kỳ
     ma       : (vật phẩm) mã vật phẩm, ví dụ 'hp5', 'xp3', 'thb'
     soLuong  : số món rơi ra nếu trúng tỷ lệ (mặc định 1)
     tyLe     : tỷ lệ rơi theo phần trăm, 100 = chắc chắn rơi, 0.5 = nửa phần trăm
   ===================================================================== */
window.BOSS_CFG={
  // Boss Hoàng Kim: 5 con ngoài thôn/thành
  hoangKim:{
    cap:95,             // cấp boss
    heSoMau:40,         // máu = máu quái thường cùng cấp × hệ số này
    heSoTanCong:2.2,    // lực đánh thường = quái thường cùng cấp × hệ số này
    heSoChieu:1.0,      // sát thương chiêu 9x = lực đánh × (1.5 đến 1.9 tùy chiêu) × hệ số này
    giayHoiChieu:[2.2,3.2], // mỗi chiêu cách nhau ngẫu nhiên trong khoảng (giây)
    heSoKinhNghiem:120, // kinh nghiệm = quái thường cùng cấp × hệ số này
    nganLuong:[2500,4500],
    danhVong:300,
    roi:[
      {loai:'trangbi', pham:'hoangkim', soLuong:1, tyLe:100},
      {loai:'trangbi', pham:'xanh',     soLuong:3, tyLe:100},
      {loai:'bikip',   cap:90,  phaiMinh:true,  tyLe:30},
      {loai:'bikip',   cap:120, phaiMinh:false, tyLe:5},
      {loai:'vatpham', ma:'hp5', soLuong:3, tyLe:60},
      {loai:'vatpham', ma:'xp3', soLuong:1, tyLe:25},
      {loai:'vatpham', ma:'thb', soLuong:1, tyLe:10},
    ]
  },
  // Boss Tiểu Hoàng Kim: 10 con ngoài sơn môn 10 phái (yếu hơn Boss Hoàng Kim)
  tieuHoangKim:{
    cap:88,
    heSoMau:15,
    heSoTanCong:1.3,
    heSoChieu:0.75,
    giayHoiChieu:[3,4.2],
    heSoKinhNghiem:45,
    nganLuong:[900,1600],
    danhVong:100,
    roi:[
      {loai:'trangbi', pham:'xanh',     soLuong:2, tyLe:100},
      {loai:'trangbi', pham:'hoangkim', soLuong:1, tyLe:25},
      {loai:'bikip',   cap:90, phaiMinh:true, tyLe:12},
      {loai:'vatpham', ma:'hp4', soLuong:3, tyLe:50},
      {loai:'vatpham', ma:'xp2', soLuong:1, tyLe:20},
    ]
  }
};
/* Bảng mã vật phẩm (dùng cho loai:'vatpham'):
   hp1..hp5  Kim Sang Tán (tiểu, trung, đại), Hồi Thiên Linh Đan, Cửu Chuyển Hồi Hồn Đan
   mp1..mp5  Ngưng Thần Hoàn (tiểu, trung, đại), Đại Bổ Linh Tán, Ô Đầu Hồi Thần Đan
   all       Thừa Tiên Mật Lộ            sta1, sta2  Tam Hoa Linh Tán, Toàn Quả Linh Hoàn
   gd        Hoắc Hương Giải Độc Hoàn     xp1, xp2, xp3  Tu Luyện Đan, Đại Tu Luyện Đan, Bồ Đề Quả
   thp       Truyền Tống Phù              htp   Quy Hồi Phù
   ttl       Tiên Thảo Lộ                 pdl   Quế Hoa Tửu
   thb       Tinh Hồng Bảo Thạch          ltt   Lam Thủy Tinh     ttt  Tử Thủy Tinh     lctt  Lục Thủy Tinh
   tyt       Túi Y Tế                     hsd   Phục Sinh Đan */
