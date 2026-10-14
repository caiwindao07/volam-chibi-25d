/**
 * Hệ thống Bảo Vệ & Chống Gian Lận (Anti-DevTools & Anti-F12)
 * Võ Lâm Chibi
 */
(function() {
  "use strict";

  // Kiểm tra cờ debug: Nếu thêm ?debug=1 trên URL thì cho phép mở F12 để nhà phát triển kiểm tra lỗi
  const isDebug = new URLSearchParams(window.location.search).get("debug") === "1";
  if (isDebug) {
    console.warn("🛡️ [Anti-Cheat]: Chế độ Debug đang BẬT. DevTools được phép hoạt động.");
    return;
  }

  // 1. Chặn phím tắt mở DevTools & Xem mã nguồn
  window.addEventListener("keydown", function(e) {
    // F12
    if (e.key === "F12" || e.keyCode === 123) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
    // Ctrl + Shift + I (Inspect), Ctrl + Shift + J (Console), Ctrl + Shift + C (Element Inspector)
    if (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "i" || e.key === "J" || e.key === "j" || e.key === "C" || e.key === "c")) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
    // Ctrl + U (View Source)
    if (e.ctrlKey && (e.key === "U" || e.key === "u")) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
    // Ctrl + S (Save Page)
    if (e.ctrlKey && (e.key === "S" || e.key === "s")) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  }, true);

  // 2. Chặn menu chuột phải (Inspect Element)
  window.addEventListener("contextmenu", function(e) {
    e.preventDefault();
    e.stopPropagation();
    return false;
  }, true);

  // 3. Vô hiệu hóa Console methods để tránh đọc dữ liệu
  const noop = function() {};
  const _clear = console.clear || noop;
  try {
    console.log = noop;
    console.info = noop;
    console.warn = noop;
    console.debug = noop;
    console.table = noop;
  } catch (err) {}

  // 4. Bẫy Debugger Loop (Làm đóng băng Console khi mở F12)
  let devtoolsDetected = false;
  function triggerDebugger() {
    const start = performance.now();
    try {
      (function() {}["constructor"]("debugger")());
    } catch (e) {}
    const duration = performance.now() - start;
    // Nếu duration > 100ms nghĩa là trình duyệt vừa dừng lại ở breakpoint của DevTools
    if (duration > 100) {
      if (!devtoolsDetected) {
        devtoolsDetected = true;
        alert("Cảnh báo: Phát hiện công cụ can thiệp nhà phát triển (DevTools)! Vui lòng đóng F12 để tiếp tục chơi.");
        location.reload();
      }
    }
  }

  setInterval(triggerDebugger, 600);

  // 5. Phát hiện DevTools mở bằng cách đo chênh lệch kích thước cửa sổ
  window.addEventListener("resize", function() {
    const widthThreshold = window.outerWidth - window.innerWidth > 160;
    const heightThreshold = window.outerHeight - window.innerHeight > 160;
    if (widthThreshold || heightThreshold) {
      triggerDebugger();
    }
  });

  // 6. Xóa Console định kỳ
  setInterval(function() {
    try {
      _clear();
    } catch (e) {}
  }, 1500);

})();
