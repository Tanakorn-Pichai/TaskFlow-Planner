
document.addEventListener("DOMContentLoaded", function () {
  const toast = document.querySelector(".toast");
  if (!toast) return;

  // Auto hide 3 วิ
  const autoHide = setTimeout(() => {
    hideToast();
  }, 3000);

  // ปุ่มปิด
  const closeBtn = toast.querySelector(".close-btn");
  closeBtn.addEventListener("click", () => {
    clearTimeout(autoHide);
    hideToast();
  });

  function hideToast() {
    toast.classList.remove("show");
    setTimeout(() => {
      toast.remove();
    }, 400);
  }
});
