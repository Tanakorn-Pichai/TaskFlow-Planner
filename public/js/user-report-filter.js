// ===============================
// User Performance - Filter My Data
// ===============================

document.addEventListener("DOMContentLoaded", function () {

  const myBtn = document.getElementById("myReportBtn");
  const resetBtn = document.getElementById("resetReportBtn");
  const table = document.querySelector(".data-table");
  if (!table) return;

  const rows = table.querySelectorAll("tbody tr");

  if (myBtn) {
    myBtn.addEventListener("click", function () {

      rows.forEach(row => {
        const userId = row.getAttribute("data-user-id");

        if (parseInt(userId) === currentUserId) {
          row.style.display = "";
        } else {
          row.style.display = "none";
        }
      });

    });
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", function () {
      rows.forEach(row => row.style.display = "");
    });
  }

});