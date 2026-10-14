/* =====================================================================
   CẤU HÌNH QUỐC CHIẾN THIÊN HẠ ĐỒ (sáu nước tranh 19 châu, mỗi tuần một trận, lãnh thổ giữ qua tuần)
   - Mỗi châu gắn với một bản đồ thật: kinh đô (thành của nước), 12 châu biên giới (thôn, bãi, động), Trung Nguyên (Tô Châu).
   - Lương Thực: dân làm Nông Vụ mỗi ngày (giết quái) rồi nộp cho Quốc Sứ; châu đang giữ tự sinh lương mỗi ngày.
     20h ngày trước trận trừ lương nuôi châu, thiếu thì châu xa kinh đô nhất tự về trung lập. Chiếm châu trong trận tốn lương.
   - Chiến Bị: nộp bạc ở Quốc Sứ (Lò Rèn); cứ đủ một mức thì tướng trấn thủ mọi châu mạnh thêm.
   - Trận thứ sáu 20h: sáu nước vào cùng bản đồ, hạ Trấn Thủ Tướng Quân là chiếm châu. Nước ít châu đánh nước nhiều châu được cộng sát thương.
   - Sửa xong lưu lại là có tác dụng. File lỗi cú pháp thì game dùng mặc định. Giờ theo giờ máy chủ (Việt Nam).
   ===================================================================== */
window.QUOCCHIEN_CFG={
  capToiThieu:60,              /* cấp tối thiểu để làm Nông Vụ, rèn Chiến Bị, bỏ phiếu và ra trận (tránh tài khoản phụ cấp thấp cày lương) */
  bat:true,                    /* công tắc: false = tắt (Quốc Chiến quay về lịch ghép cặp cũ) */
  thu:5, gio:20, phut:0,       /* trận: thứ sáu 20h (kết toán lương, nuôi châu lúc 20h ngày hôm trước) */
  chuanBi:10, thoiGian:45,     /* phút vào doanh trước giờ, phút đánh */
  nongVu:{ soQuai:10, luong:10, quocCong:20, kinhNghiemPhanTram:3, ngayTuan:5, xuTuan:5, chenhCap:20 }, /* mỗi ngày: giết đủ quái (cấp không chênh quá chenhCap) rồi nộp; đủ ngayTuan ngày trong tuần thưởng xu */
  loRen:{ vanMoiChienBi:10, quocCongMoiVan:1 }, /* 10 vạn lượng = 1 Chiến Bị */
  luong:{ moiChauNgay:20, trungNguyenNgay:40, nuoiChau:100, nuoiTu:5, nuoiCao:200, kinhDoDich:200, chiemGiap:80, chiemSau:160, khoCoBan:300, khoMoiChau:100 },
  chienBi:{ moiMuc:100, phanTramMoiMuc:5, toiDa:50 }, /* mỗi 100 Chiến Bị trong kho: tướng mọi châu +5% máu và công, tối đa +50% */
  tuong:{ mauCoBan:60000, congCoBan:900, capTuong:110, kinhDo:1.6, trungNguyen:1.8, hoQuoc:2, hoiSinhPhut:2 }, /* máu tướng châu thường; kinh đô, Trung Nguyên nhân thêm; Hộ Quốc: kinh đô bị chiếm thì tuần sau tướng để đánh lại mạnh gấp đôi */
  canBang:{ moiChauChenh:5, toiDa:30 }, /* nước ít châu đánh tướng nước nhiều châu: +% sát thương mỗi châu chênh */
  thuNhap:{ moiChauTuan:50, kinhNghiemPhanTram:10 }, /* vạn lượng vào quốc khố mỗi châu mỗi tuần; dân nước chủ luyện ở châu mình +% kinh nghiệm */
  diem:{ tuong:1, giet:10, chiem:200, mucTieu:2 }, /* điểm cá nhân: mỗi 1000 sát thương lên tướng, mỗi mạng, mỗi châu chiếm (chia cho người góp), nhân khi đánh đúng mục tiêu vua cắm */
  hoiSinh:{ giay:8 },
  ai:{ moiNuoc:30, cap:100, capChenh:10 }, /* người chơi AI mỗi nước trong trận (tối đa 60) */
  tapKet:300,
  thuong:{ deNhat:{xu:20,danhVong:200}, thamGia:{xu:8,danhVong:60} }, /* thêm vào thưởng Quốc Chiến thường (theo điểm) */
  /* 19 châu: ban = bản đồ thật; loai: kd = kinh đô, bg = biên giới, tn = Trung Nguyên; nuoc = nước khởi đầu (kinh đô) */
  chau:[
    {id:'kd_tong',ten:'Biện Kinh',ban:3,loai:'kd',nuoc:'tong'},{id:'kd_kim',ten:'Trung Đô',ban:4,loai:'kd',nuoc:'kim'},{id:'kd_ly',ten:'Dương Thư Mi',ban:7,loai:'kd',nuoc:'ly'},
    {id:'kd_ha',ten:'Hưng Khánh',ban:5,loai:'kd',nuoc:'ha'},{id:'kd_phon',ten:'La Ta',ban:6,loai:'kd',nuoc:'phon'},{id:'kd_lieu',ten:'Thượng Kinh',ban:8,loai:'kd',nuoc:'lieu'},
    {id:'bg_bichthuy',ten:'Bích Thủy',ban:10,loai:'bg'},{id:'bg_hanhhoa',ten:'Hạnh Hoa',ban:11,loai:'bg'},{id:'bg_lacnhan',ten:'Lạc Nhạn',ban:12,loai:'bg'},{id:'bg_daonguyen',ten:'Đào Nguyên',ban:13,loai:'bg'},
    {id:'bg_samac',ten:'Sa Mạc',ban:60,loai:'bg'},{id:'bg_tuyetlinh',ten:'Tuyết Lĩnh',ban:61,loai:'bg'},{id:'bg_hoadiem',ten:'Hỏa Diệm',ban:62,loai:'bg'},{id:'bg_hoason',ten:'Hoa Sơn',ban:63,loai:'bg'},
    {id:'bg_thachlam',ten:'Thạch Lâm',ban:40,loai:'bg'},{id:'bg_uminh',ten:'U Minh',ban:41,loai:'bg'},{id:'bg_hanbang',ten:'Hàn Băng',ban:42,loai:'bg'},{id:'bg_dungnham',ten:'Dung Nham',ban:43,loai:'bg'},
    {id:'tn',ten:'Trung Nguyên',ban:9,loai:'tn'}],
};
