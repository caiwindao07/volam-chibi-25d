/* =====================================================================
   CẤU HÌNH CÂN BẰNG 12 PHÁI (áp dụng toàn game)
   Hệ số nhân sát thương mọi đòn đánh, mọi chiêu của nhân vật thuộc phái đó (cả người chơi AI).
     pve : khi đánh quái, boss, công trình sa trường
     pvp : khi đánh người (PK, sa trường, tỷ võ), ghi theo MỐC CẤP của người ra đòn (cấp ở giữa hai mốc thì tính dần),
           vì mỗi phái mạnh yếu khác nhau theo từng tầng chiêu. Có thể ghi một số duy nhất (ví dụ pvp:1.2) nếu muốn dùng chung mọi cấp.
           Đo bằng mô phỏng PK 1-1 ở từng mốc cấp (trận dài khoảng 90 giây, có khắc hệ, bơm máu): mỗi phái thắng khoảng 40–60%.
           Dò lại toàn bộ sau khi đổi cây kỹ năng theo JX (Ngũ Độc dùng đao, Côn Lôn, Thiếu Lâm, Thiên Vương, Thúy Yên, Thiên Nhẫn, Nga My, Võ Đang).
     bu  : (tùy chọn, mặc định 1) hệ số bù riêng cho NGƯỜI CHƠI, nhân thêm cả khi đánh quái lẫn PK. Dùng khi chỉ số võ công
           theo JX của phái đó rất lớn (Thiếu Lâm: bị động Quyền/Côn/Đao +25%→+200% sát thương, Như Lai Thiên Diệp +65%…)
           mà người chơi AI không có, để giữ thời gian qua tầng tháp và sức PK như cũ.
   1 = giữ nguyên. Nhỏ hơn 1 là giảm (Đường Môn, Ngũ Độc Giáo khi PK).
   Số liệu đo bằng mô phỏng: 10 phái cùng cấp (90 và 150), cùng bộ đồ hoàng kim, đủ võ công 9x, tự động đánh.
   Phái đánh lan nhanh (Đường Môn, Cái Bang, Thiết Thương Bảo) giữ 1; phái đánh chậm được nâng
   để thời gian dọn một bãi quái của các phái gần như nhau.
   - Chơi qua máy chủ (VPS): sửa xong lưu lại là có tác dụng, người chơi tải lại trang để thấy.
   - Nếu file này lỗi cú pháp hoặc bị xóa, game dùng cấu hình mặc định (như dưới đây).
   ===================================================================== */
window.FACTION_CFG={
  satThuong:{
    quyen:{pve:2.4, bu:{cap5:0.352, cap15:0.471, cap30:0.426, cap50:0.34, cap60:0.12, cap90:0.075, cap120:0.032, cap150:0.02}, pvp:{cap10:1.88, cap20:2.1, cap30:1.65, cap40:2.99, cap50:1.83, cap60:1.6, cap75:1.67, cap90:1.93, cap95:1.92, cap100:1.74, cap105:1.75, cap110:1.89, cap115:1.7, cap120:1.83, cap150:1.92, cap180:1.97}},   // Thiếu Lâm: rất trâu nhưng đánh chậm
    thuong:{pve:1, bu:{cap5:1.051, cap15:0.359, cap30:0.116, cap50:0.243, cap60:0.238, cap90:0.224, cap120:0.107, cap150:0.032}, pvp:{cap10:1.86, cap20:2.01, cap30:2.55, cap40:2, cap50:2.14, cap60:1.87, cap75:1.86, cap90:1.76, cap95:1.79, cap100:1.64, cap105:1.62, cap110:1.66, cap115:1.56, cap120:1.68, cap150:1.92, cap180:1.99}},       // Thiết Thương Bảo
    xa:{pve:1, bu:{cap5:0.535, cap15:0.687, cap30:0.678, cap50:0.854, cap60:0.754, cap90:0.456, cap120:0.612, cap150:0.114}, pvp:{cap10:1.41, cap20:1.55, cap30:1.36, cap40:0.97, cap50:1.07, cap60:1.27, cap75:0.96, cap90:1.1, cap95:1.08, cap100:1.18, cap105:1.13, cap110:1.12, cap115:1.08, cap120:1.07, cap150:0.94, cap180:0.79}},           // Đường Môn
    tien:{pve:1.13, bu:{cap5:1.352, cap15:2.769, cap30:1.386, cap50:3.738, cap60:3.304, cap90:2.0, cap120:1.571, cap150:1.494}, pvp:{cap10:1.48, cap20:1.53, cap30:1.04, cap40:0.72, cap50:1.12, cap60:1.34, cap75:1.05, cap90:1.1, cap95:1.09, cap100:1.15, cap105:1.13, cap110:1.15, cap115:1.07, cap120:1.08, cap150:1.04, cap180:0.92}},   // Ngũ Độc Giáo (dùng đao, dò lại bằng mô phỏng)
    nguyet:{pve:2, bu:{cap5:0.753, cap15:0.849, cap30:0.844, cap50:2.639, cap60:2.274, cap90:1.18, cap120:1.069, cap150:1.0}, pvp:{cap10:2.04, cap20:2.15, cap30:2.39, cap40:2.6, cap50:2.87, cap60:2.46, cap75:2.51, cap90:2.13, cap95:2.2, cap100:1.99, cap105:1.91, cap110:2.13, cap115:1.89, cap120:2.04, cap150:2.1, cap180:2.11}},  // Nga Mi
    thuy:{pve:1.85, bu:{cap5:1.026, cap15:0.803, cap30:0.855, cap50:0.52, cap60:0.462, cap90:0.287, cap120:0.295, cap150:0.134}, pvp:{cap10:1.94, cap20:2.09, cap30:2.73, cap40:2.9, cap50:2.87, cap60:2.54, cap75:2.41, cap90:2.11, cap95:2.09, cap100:1.9, cap105:1.89, cap110:2.03, cap115:1.87, cap120:2, cap150:1.98, cap180:2.18}},     // Thiên Sơn   // Thúy Yên (bộ võ công trước đây của Thiên Sơn)
    dao:{pve:1, pvp:1},   // Thiên Sơn: võ công mới (Lục Dương Chưởng, Chiết Mai Thủ), chưa đo lại
    tieu:{pve:1, pvp:1},   // Tiêu Dao: phái mới, chưa đo lại
    truc:{pve:1, bu:{cap5:1.049, cap15:1.377, cap30:0.733, cap50:2.333, cap60:2.194, cap90:1.775, cap120:1.998, cap150:1.653}, pvp:{cap10:1.34, cap20:1.25, cap30:1.25, cap40:1.3, cap50:1.47, cap60:1.66, cap75:1.27, cap90:1.26, cap95:1.24, cap100:1.33, cap105:1.29, cap110:1.26, cap115:1.24, cap120:1.23, cap150:1.6, cap180:1.24}},         // Cái Bang
    hoa:{pve:2.8, bu:{cap5:1.542, cap15:1.165, cap30:1.095, cap50:0.74, cap60:0.607, cap90:0.209, cap120:0.085, cap150:0.06}, pvp:{cap10:1.39, cap20:1.78, cap30:1.05, cap40:1.79, cap50:0.93, cap60:1.29, cap75:1.04, cap90:1.19, cap95:1.17, cap100:1.25, cap105:1.23, cap110:1.21, cap115:1.16, cap120:1.2, cap150:1.22, cap180:1.07}},      // Hỏa Vân Cốc: chậm nhất, được nâng nhiều nhất
    kiem:{pve:1.9, bu:{cap5:1.146, cap15:1.748, cap30:0.976, cap50:0.999, cap60:0.808, cap90:0.235, cap120:0.142, cap150:0.067}, pvp:{cap10:1.9, cap20:2.16, cap30:2.21, cap40:2.27, cap50:2.55, cap60:2.36, cap75:2.45, cap90:1.94, cap95:2, cap100:1.74, cap105:1.72, cap110:1.87, cap115:1.73, cap120:1.82, cap150:1.97, cap180:2.18}},     // Võ Đang
    bang:{pve:1.4, bu:{cap5:0.762, cap15:1.144, cap30:0.927, cap50:1.112, cap60:1.01, cap90:0.704, cap120:0.897, cap150:0.299}, pvp:{cap10:1.27, cap20:1.58, cap30:1.14, cap40:0.87, cap50:1.17, cap60:1.46, cap75:1.12, cap90:1.14, cap95:1.13, cap100:1.22, cap105:1.19, cap110:1.19, cap115:1.13, cap120:1.12, cap150:1.06, cap180:0.99}},     // Côn Lôn
  },

  // KHẮC HỆ KHI PK (theo phần trăm): Kim khắc Mộc, Mộc khắc Thổ, Thổ khắc Thủy, Thủy khắc Hỏa, Hỏa khắc Kim
  //   tang : phái khắc đánh phái bị khắc mạnh thêm bấy nhiêu %
  //   giam : phái bị khắc đánh ngược lại yếu đi bấy nhiêu %
  // 10 / 5 → hai phái ngang sức thì bên khắc thắng khoảng 3/4 số trận (trận PK dài khoảng 90 giây nên chênh lệch nhỏ
  // cũng tích lũy thành thắng thua; 20 / 10 gần như bên khắc luôn thắng). Đánh quái vẫn giữ +30% / -20%.
  // Bản 389: khắc hệ rõ rệt (ví dụ Thiết Thương Bảo hệ Kim đánh phái hệ Mộc nhanh chết, bơm máu không kịp).
  khacHe:{tang:80, giam:30},

  // KÉO DÀI TRẬN PK: mọi sát thương người đánh người nhân thêm hệ số này (không ảnh hưởng đánh quái, boss, tháp).
  //   Số nhỏ hơn → trận dài hơn; 1 = như cũ. Ghi theo mốc cấp của người ra đòn, cấp ở giữa hai mốc thì tính dần.
  //   Đo bằng mô phỏng (2 người cùng cấp, bơm máu đều tay, đánh hit and run): chọn mức sát thương thấp nhất mà 90% số trận
  //   vẫn phân thắng thua trong khoảng 3 phút (thuốc giữ nguyên sức). Cấp 1–120 đã đo kỹ: trận trung bình 40–95 giây.
  //   Hệ số không đều theo cấp vì sức mạnh nhảy theo từng tầng chiêu (6x, 9x, 12x, 15x) và trang bị;
  //   mốc nào thấp là lúc sát thương dồn rất nhanh so với lượng máu.
  // BÌNH MÁU MANG THEO (mọi loại thuốc hồi sinh lực, kể cả Thừa Tiên Mật Lộ; thuốc quân dụng sa trường không tính)
  //   toiDa : tổng số bình máu tối đa trong hành trang (mua, nhặt, lấy từ rương đều không vượt quá)
  //   moiO  : số bình tối đa xếp chồng trong một ô (hành trang và rương)
  binhMau:{toiDa:100, moiO:100},

  heSoPK:{cap10:0.951, cap20:0.482, cap30:0.759, cap40:0.52, cap50:0.323, cap60:0.404, cap70:0.339, cap80:0.458, cap90:0.339, cap95:0.315, cap100:0.547, cap105:0.507, cap110:0.494, cap115:0.447, cap120:0.414, cap135:0.27, cap150:0.23, cap165:0.2, cap180:0.175, cap200:0.155}
};
