/* =====================================================================
   CẤU HÌNH TRANG BỊ HOÀNG KIM MÔN PHÁI (mảnh phổ → mảnh hoàng kim → trang bị)
   Danh sách 140 món lấy từ goldequip.txt (28 bộ hoàng kim của 10 phái JX).
   - Quái thường KHÔNG còn rơi trang bị hoàng kim; thay vào đó rơi MẢNH PHỔ (tên trùng món hoàng kim).
   - Mảnh Phổ: nhấp phải (điện thoại: bấm Dùng) để xem vật phẩm cần, ép thành MẢNH HOÀNG KIM cùng tên.
   - Mảnh Phổ và Mảnh Hoàng Kim đánh số: ép mảnh phổ số k ra mảnh hoàng kim số k.
   - Rèn trang bị: đủ Mảnh Hoàng Kim số 1 → 6 (vũ khí 1 → 9), mỗi số một mảnh + thủy tinh mỗi loại + nguyên liệu công thức.
   Mã vật phẩm (ma) xem trong game: ltt = Lam Thủy Tinh, ttt = Tử Thủy Tinh, lctt = Lục Thủy Tinh, thb = Tinh Hồng Bảo Thạch…
   Sửa xong lưu lại; chơi qua máy chủ thì người chơi tải lại trang là áp dụng.
   ===================================================================== */
window.HK_CFG={
  roi:{
    baiThap:0.1,    // % mỗi con quái thường ở bãi dưới capCao rơi 1 mảnh phổ (hiếm)
    baiCao:0.5,     // % mỗi con quái ở bãi từ capCao trở lên (bãi cao)
    capCao:80,      // cấp quái tính là bãi cao
    ruongThap:30,   // % rương mỗi 10 tầng Thiên Tầng Tháp có thêm 1 mảnh phổ, nhân theo may mắn: may mắn 0 còn 1/5 (6%), may mắn 100 đủ 30%
    // Món KHÔNG có công thức (atlas để trống) không có Mảnh Phổ; Mảnh Hoàng Kim của chúng rơi thẳng:
    manhBoss:0,     // % mỗi boss rơi 1 Mảnh Hoàng Kim (món không công thức, số ngẫu nhiên) — TẠM TẮT (0)
    manhThap:0      // % rương Thiên Tầng Tháp có thêm 1 Mảnh Hoàng Kim như trên — TẠM TẮT (0)
    // mảnh phổ rơi ngẫu nhiên mọi môn phái, mọi số mảnh (1–6, vũ khí 1–9)
  },
  // GIẢI THẠCH ĐÀI (nhấp phải Nguyên Thạch / Hộ Thạch Phù / Thạch Phấn để mở):
  //   Nguyên Thạch (thường) · Cự Nguyên Thạch · Thiên Ngoại Vẫn Thạch: phamGoc = phẩm khởi điểm của từng loại.
  //   Mỗi nhát cắt: thanhCong[phẩm hiện tại - 1] % lên 1 phẩm; trong đó linhQuang % lên 2 phẩm.
  //   Thất bại thì nứt; nứt đủ nutToiDa lần thì vỡ, còn lại phanVo túi Thạch Phấn (theo loại đá). phanDoi túi Thạch Phấn đổi 1 Nguyên Thạch.
  //   Hộ Thạch Phù dán trước nhát cắt: thất bại thì phù vỡ thay, đá không nứt.
  //   roiTieu % quái thường từ cấp roiTuCap rơi Nguyên Thạch; boss: bossDai % Cự Nguyên Thạch, bossVan % Thiên Ngoại Vẫn Thạch.
  //   baoToan: thu được Linh Thạch từ phẩm này trở lên thì báo toàn server.
  giaiThach:{ phamGoc:[1,3,5], thanhCong:[95,90,84,77,69,60,51,42,33], linhQuang:8, nutToiDa:3, phanVo:[2,5,12], phanDoi:20,
    roiTieu:1.2, roiTuCap:30, bossDai:40, bossVan:4, baoToan:9 },
  // RÈN HOÀNG KIM: mỗi phẩm Linh Thạch vượt công thức nâng sàn chỉ số các dòng moiCap % (tối đa toiDa %);
  //   cucPham % ra Cực Phẩm (mọi dòng tối đa), cộng cucPhamMoiCap % mỗi phẩm vượt.
  ren:{ moiCap:8, toiDa:80, cucPham:3, cucPhamMoiCap:1 },
  // HÚT THUỘC TÍNH (Giải Thạch Đài → thẻ Hút Thuộc Tính): Linh Thạch trơn + 1 đồ xanh, chọn một dòng → Linh Thạch mang thuộc tính
  //   đó và ghi số dòng. Công thức rèn đòi thuộc tính X ở dòng k thì đá phải hút từ đồ xanh có X ở đúng dòng k.
  //   Chỉ số trên đá càng cao thì dòng đó trên trang bị hoàng kim càng cao. Thuộc tính đồ xanh không có thì dùng đá trơn.
  // CÔNG THỨC ÉP theo atlas_compound.txt (Võ Lâm 1): mỗi món cần Linh Thạch đúng cấp (5–8, một loại duy nhất), Võ Lâm Mật Tịch / Tẩy Tủy Kinh và 1 bí kíp 9x bất kỳ của phái.
  //   buoc:'do'  → công thức tính ở bước ép trang bị (một lần cho mỗi món) — mặc định
  //   buoc:'pho' → tính ở bước ép mảnh phổ thành mảnh hoàng kim (mỗi mảnh một lần, rất tốn)
  //   buoc:'tat' → bỏ công thức
  congThuc:{ buoc:'do' },
  epManh:{          // ép 1 Mảnh Phổ → 1 Mảnh Hoàng Kim cùng tên
    vatPham:[],     // vật phẩm cần thêm, ví dụ: [{ma:'thb', sl:1}, {ma:'ltt', sl:2}]
    luong:0         // ngân lượng cần thêm
  },
  epDo:{            // ép Mảnh Hoàng Kim → trang bị hoàng kim
    manhVuKhi:9,    // số mảnh cho vũ khí
    manhKhac:6,     // số mảnh cho các món khác
    thuyTinh:10,    // mỗi loại thủy tinh (Lam, Tử, Lục) cần bấy nhiêu viên
    vatPham:[],     // vật phẩm cần thêm (giống epManh)
    luong:0
  }
};