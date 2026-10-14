/* =====================================================================
   CẤU HÌNH THIÊN TẦNG THÁP (leo tháp vô hạn, đánh một mình)
   - Vào tháp ở NPC Thủ Tháp Sứ (các thành, thôn). Mỗi tầng phải dọn sạch quái trong thời gian giới hạn.
   - Thắng thì leo tiếp, không mất lượt. Chết, hết giờ hoặc rời tháp giữa chừng thì mất 1 lượt thua.
   - Tầng cao nhất được lưu vĩnh viễn; mỗi ngày bấm Càn quét 1 lần nhận quà theo tầng cao nhất.
   - Chơi qua máy chủ (VPS): sửa xong lưu lại là có tác dụng, người chơi tải lại trang để thấy.
   - Nếu file này lỗi cú pháp hoặc bị xóa, game dùng cấu hình mặc định.
   ===================================================================== */
window.TOWER_CFG={
  capVao:60,          // cấp nhân vật tối thiểu để vào tháp (cấp thấp hơn nên đi luyện cấp ngoài bãi)
  luotThua:3,         // số lượt thua mỗi ngày (thắng không mất lượt)
  giayThuong:210,     // thời gian mỗi tầng thường (giây)
  giayBoss:300,       // thời gian tầng có boss (đuôi 5 và đuôi 0)

  // ĐỘ KHÓ: quái tầng N có cấp = capBatDau + (N − 1) + capCong (tối đa 200): tầng 1 là quái cấp 50. Từ tầng "nguongTang" trở đi,
  // máu và lực đánh quái tăng thêm theo cấp số nhân: máu × (1 + tangMoiTang)^(N − nguongTang),
  // lực đánh tăng chậm hơn máu (lũy thừa 0.6) để quái không giết người chơi chỉ trong một đòn.
  capBatDau:50,       // cấp quái ở tầng 1 (thấp hơn cấp vào tháp 60 một chút cho dễ làm quen)
  capCong:0,          // cộng thêm cấp cho mọi tầng
  nguongTang:150,
  tangMoiTang:0.025,  // 0.025 = mỗi tầng mạnh thêm 2,5% (tầng 250 ≈ gấp 12 lần, tầng 350 ≈ gấp 140 lần)
  heSoMau:{thuong:3, tieuBoss:10, daiBoss:18},      // nhân máu theo loại quái
  heSoDanh:{thuong:1, tieuBoss:1.5, daiBoss:1.8},   // nhân lực đánh theo loại quái
  // Quái xuất hiện rải quanh võ đài rồi chạy lại đánh người chơi; mỗi con giữ một chỗ riêng trên vòng tròn quanh nhân vật
  // (theo hướng nó xuất hiện) và đẩy nhau ra, nên quái vây quanh chứ không chụm thành một đống.
  // Tối đa 3 quái thường đánh cùng lúc, các con còn lại đứng vòng ngoài chờ tới lượt.

  // CƠ QUAN (bẫy) ở các tầng có số đuôi trong "duoi" (mặc định tầng 13, 17, 23, 27...). Tầng boss không có cơ quan.
  //   Mỗi tầng cơ quan có 1 loại bẫy, từ tầng 50 có 2 loại, từ tầng 100 có 3 loại (chọn cố định theo số tầng).
  //   themGiay : tầng có cơ quan được cộng thêm bấy nhiêu giây
  //   bat      : 1 = bật, 0 = tắt loại bẫy này      tu : bẫy bắt đầu xuất hiện từ tầng này
  coQuan:{
    duoi:[3,7],
    themGiay:15,
    diaThu:{bat:1, tu:10, satThuong:12, troi:1.5},  // Địa Thứ Trận: ô chông nháy đỏ 0,8 giây rồi phóng cọc · mất 12% máu · trói chân 1,5 giây
    hanBang:{bat:1, tu:10, cham:50},                // Hàn Băng Thạch Bàn: sàn băng chậm 50% · khinh công đáp xuống băng thì trượt dài theo đà
    docTri:{bat:1, tu:15, doc:2},                   // Hủ Cốt Độc Trì: vũng độc gây trúng độc 2% máu mỗi giây (Giải Độc Hoàn giải được)
    lacThach:{bat:1, tu:20, matMau:20},             // Lạc Thạch Hãm Tỉnh: đứng trên tấm đá 1 giây thì sập · rơi xuống mất 20% máu, văng ra mép
    batQuai:{bat:1, tu:30, phan:30},                // Bát Quái Phản Chấn Đàn: đứng trong trận đánh quái bị phản 30% sát thương (tối đa 10% máu mỗi đòn)
    // --- bẫy tường và không gian ---
    amTien:{bat:1, tu:30, satThuong:6, choang:0.6, doc:1.5}, // Ám Tiễn Cơ Quan: tường hai bên bắn loạt tên (vạch đỏ báo trước) · mất 6% máu, choáng 0,6 giây, trúng độc 1,5%/giây
    hoaDiem:{bat:1, tu:30, satThuong:3},             // Cửu Cung Hỏa Diệm: 4 tượng rồng ở 4 góc phun lửa quét · mỗi nửa giây trong lửa mất 3% máu
    daoTran:{bat:1, tu:40, satThuong:8, chayMau:1},  // Toàn Chuyển Đao Trận: 2 lưỡi cưa chạy dọc rãnh · mất 8% máu, bị hất văng, chảy máu 1%/giây trong 4 giây
    cuMoc:{bat:1, tu:50, satThuong:10},              // Hoàng Thạch Cự Mộc: cột gỗ gai lăn ngang võ đài (vệt bụi báo trước 1 giây) · mất 10% máu, bị đẩy theo
    loiDao:{bat:1, tu:60, satThuong:15},             // Đoạt Mệnh Lôi Đao: lưỡi đao con lắc đung đưa (từ tầng 100 có 2 cái) · mất 15% máu, bị hất ra
    // --- bẫy khống chế ---
    tuyetKhi:{bat:1, tu:60, khoa:3},                 // Tuyệt Khí Ma Trận: vòng tím nháy 1 giây rồi phong ấn · đứng trong vòng bị khóa chiêu môn phái 3 giây (vẫn đánh thường, chạy được)
    thienLoi:{bat:1, tu:70, satThuong:18},           // Thiên Lôi Dẫn Trận: vòng sét đánh dấu dưới chân, 2 giây sau sét giáng · trong vòng mất 18% máu (chạy ra là tránh được)
    hacDong:{bat:1, tu:70, satThuong:5},             // Hấp Tinh Hắc Động: lỗ đen hút người và quái về giữa (không xuất hiện cùng Địa Thứ, Lạc Thạch) · sát lõi mất 5% máu mỗi nửa giây
    meHon:{bat:1, tu:80},                            // Mê Hồn Độc Vụ: từng đợt sương tím 6 giây che màn hình, chỉ chừa vòng sáng quanh nhân vật
    triTre:{bat:1, tu:90, giam:40},                  // Trì Trệ Ma Trận: đứng trong vòng thì tốc độ ra chiêu giảm 40%
  },

  // CÀN QUÉT MỖI NGÀY (1 lần): quà tính theo TẦNG CAO NHẤT
  //   kinh nghiệm : mặc định (để trống) = nửa tổng kinh nghiệm quái của mọi tầng đã vượt (theo bảng quái cùng cấp, quái tháp 0,5 con, Hộ Tháp / Tháp Linh 2 con).
  //                 Muốn đặt số cố định theo mốc tầng cao nhất thì bỏ dấu // ở dòng kinhNghiem bên dưới (tangN = từ tầng N trở lên).
  //   ngân lượng = heSo × tầng^mu · đá ép đồ = tầng / moiTang (tối đa toiDa viên)
  canQuet:{
    // kinhNghiem:{tang1:150000, tang50:500000, tang100:2000000, tang150:6000000, tang200:15000000},
    nganLuong:{heSo:1500, mu:0.85},     // tầng 100 ≈ 7,5 vạn lượng
    da:{moiTang:20, toiDa:10, loai:['ltt','ttt','lctt','ltt','ttt','lctt','thb']},  // thb (Tinh Hồng Bảo Thạch) hiếm hơn
  },

  // RƯƠNG ĐẠI BOSS (tầng đuôi 0), chỉ nhận LẦN ĐẦU vượt tầng đó. Cùng cách viết với bảng "roi" trong cau-hinh-boss.js
  ruongBoss:[
    {loai:'vatpham', ma:'lbbx', soLuong:1, tyLe:100},   // Lệnh Bài Boss Xanh: mở ở bãi luyện công gọi boss rơi 4–6 trang bị xanh
    {loai:'vatpham', ma:'thb', soLuong:1, tyLe:40},
    {loai:'vatpham', ma:'xp2', soLuong:1, tyLe:50},
  ],
  nganLuongRuong:2000,  // rương còn kèm ngân lượng = số tầng × giá trị này (tầng 50 → 10 vạn)

  // CÂN BẰNG THEO PHÁI TRONG THÁP (bù thêm phần còn lệch sau khi đã cân sát thương 10 phái ở cau-hinh-phai.js)
  //   mau  : nhân máu quái khi phái này vào tháp (nhỏ hơn 1 = quái ít máu hơn), ghi theo mốc tầng (tầng ở giữa hai mốc thì tính dần)
  //          vì mỗi phái mạnh yếu khác nhau theo tầng chiêu: tang1 ≈ người chơi cấp 50, tang45 ≈ cấp 90, tang75 ≈ cấp 120, tang105 ≈ cấp 150
  //   danh : nhân lực đánh của quái (nhỏ hơn 1 = quái đánh nhẹ hơn, cho phái mỏng máu)
  // Số liệu đo bằng mô phỏng: 10 phái ở cấp 50, 90, 120, 150 (vào tầng tương ứng), cùng bộ đồ hoàng kim, cầm đúng vũ khí lộ chiêu chính, tự động đánh:
  // quái chạy lại vây quanh (tối đa 3 con đánh cùng lúc): tầng thường dọn hết trong khoảng 40–180 giây (giới hạn 210), tầng boss khoảng 70–285 giây (giới hạn 300).
  canBangPhai:{
    quyen:{mau:{tang1:1.07, tang45:0.74, tang75:0.62, tang105:0.6}, danh:1},    // Thiếu Lâm: chỉ số võ công theo JX (Dịch Cân Kinh không còn tăng phòng thủ) nên quái đánh nhẹ hơn trước
    thuong:{mau:{tang1:1.99, tang45:2.46, tang75:1.86, tang105:1.25}, danh:1.3},   // Thiết Thương Bảo: trâu, đánh lan nhanh
    xa:{mau:{tang1:2.39, tang45:0.74, tang75:0.98, tang105:0.63}, danh:0.65},      // Đường Môn: mỏng máu
    tien:{mau:{tang1:1.91, tang45:2.33, tang75:1.88, tang105:1.44}, danh:0.8},       // Ngũ Độc Giáo
    nguyet:{mau:{tang1:4, tang45:1.29, tang75:1.23, tang105:0.84}, danh:1.2},     // Nga Mi
    thuy:{mau:{tang1:3.61, tang45:1.58, tang75:1.63, tang105:1.17}, danh:0.8},       // Thúy Yên (bộ võ công trước đây của Thiên Sơn)
    dao:{mau:1, danh:1},        // Thiên Sơn: võ công mới, chưa đo lại
    tieu:{mau:1, danh:1},       // Tiêu Dao: phái mới, chưa đo lại
    truc:{mau:{tang1:0.48, tang45:1.91, tang75:1.68, tang105:1.39}, danh:1},         // Cái Bang
    hoa:{mau:{tang1:4, tang45:1.41, tang75:1.27, tang105:0.88}, danh:0.7},     // Hỏa Vân Cốc: rất mỏng máu, tầng thường hay sát giờ
    kiem:{mau:{tang1:3.12, tang45:1.4, tang75:1.04, tang105:0.89}, danh:1},      // Võ Đang: chiêu chính phải đứng vận kiếm, dọn đợt quái chậm hơn
    bang:{mau:{tang1:1.37, tang45:1.38, tang75:1.27, tang105:1.13}, danh:0.6},       // Côn Lôn: rất mỏng máu
  },
};