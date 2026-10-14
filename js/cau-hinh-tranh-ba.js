/* =====================================================================
   CẤU HÌNH TRANH BÁ CHIẾN (bang hội tranh ngôi Quốc Chủ)
   Mỗi tuần một trận, mọi bang mọi nước vào cùng một bản đồ. Chiếm và giữ Thiên Mệnh Đài ở giữa, ba Phong Hỏa Đài,
   cướp Thiên Thư mang về doanh trại. Bang nhiều điểm nhất là Bang Bá Chủ Thiên Hạ; bang xếp cao nhất của mỗi nước là
   Bang Quốc Chủ nước đó (Bang Chủ làm Quốc Vương) đến trận tuần sau.
   - Sửa xong lưu lại là có tác dụng; người chơi tải lại trang để thấy. File lỗi cú pháp thì game dùng mặc định.
   - Giờ theo giờ máy chủ (Việt Nam).
   ===================================================================== */
window.TRANHBA_CFG={
  bat:true,                 /* công tắc: false = tắt hẳn tính năng (không đăng ký, không mở trận) */
  thu:4,                    /* ngày trong tuần: 0 = chủ nhật, 1 = thứ hai … 6 = thứ bảy (4 = thứ năm) */
  gio:20, phut:0,           /* giờ khai chiến */
  chuanBi:10,               /* phút mở cổng vào doanh trại trước giờ khai chiến */
  thoiGian:40,              /* phút đánh */
  leVan:200,                /* lệ phí đăng ký (vạn lượng, trừ vào quỹ bang) */
  capBang:2,                /* cấp bang tối thiểu */
  soBang:6,                 /* số bang tối đa một trận (tối đa 6) */
  moiBang:30,               /* số người tối đa mỗi bang */
  ngayVaoBang:3,            /* thành viên phải vào bang trước giờ khai chiến ít nhất bấy nhiêu ngày (0 = không cần) */
  diem:{ thienMenh:3, phongHoa:1, giet:5, gietGiuDai:15, thienThu:300, phutCuoi:2 }, /* điểm mỗi giây giữ đài, mỗi mạng, Thiên Thư về doanh; phút cuối nhân điểm đài */
  chiemGiay:10,             /* giây đứng một mình trong vòng đài để đổi chủ */
  thienThuPhut:[15,30],     /* phút rơi Thiên Thư */
  thienThuCham:30,          /* người cầm Thiên Thư chạy chậm bấy nhiêu % */
  dotLua:{ congPhanTram:10, giay:60 }, /* giữ đủ 3 Phong Hỏa Đài: cả bang tăng sát thương, thấy địch trên bản đồ */
  hoiSinh:{ giay:8, tangTu:5, moiLan:3, toiDa:20 }, /* hồi sinh ở doanh: 8 giây, từ lần chết thứ 5 mỗi lần thêm 3 giây, tối đa 20 */
  tapKet:300,               /* Bang Chủ Tập Kết (kéo cả bang về cạnh mình): hồi bấy nhiêu giây */
  thuong:{ baChu:{xu:40,bac:500,danhVong:300}, quocChu:{xu:25,bac:300,danhVong:200}, thamGia:{xu:10,bac:100,danhVong:60}, quyBangBaChu:2000 }, /* mỗi người (bac = vạn lượng); quỹ bang Bá Chủ nhận thêm (vạn lượng) */
  quocChuTuan:1,            /* Bang Quốc Chủ giữ ngai bấy nhiêu tuần (đến trận tiếp theo) */
  chiaQuocKho:10,           /* Bang Quốc Chủ nhận % số quốc khố cướp được khi nước thắng Quốc Chiến, vào quỹ bang */
  ai:{ bat:true, moiBang:30, boSungBangThat:true, cap:100, capChenh:15 }, /* bang AI: mỗi nước chưa có bang thật đăng ký có một bang AI đủ moiBang người; bang thật được bổ sung AI cho đủ người (boSungBangThat); cấp AI = cap ± capChenh */
};
