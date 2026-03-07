// ======================================
// Advanced Table: Search + Sort + Pagination
// ======================================

document.addEventListener("DOMContentLoaded", function () {

  const table = document.querySelector(".data-table");
  if (!table) return;

  const tbody = table.querySelector("tbody");
  const headers = table.querySelectorAll("th[data-column]");
  const rows = Array.from(tbody.querySelectorAll("tr"));

  let currentPage = 1;
  let rowsPerPage = 20;
  let filteredRows = [...rows];

  // ================= SEARCH =================
  const searchInput = document.querySelector(".table-search");

  if (searchInput) {
    searchInput.addEventListener("keyup", function () {
      const filter = this.value.toLowerCase();

      filteredRows = rows.filter(row =>
        row.innerText.toLowerCase().includes(filter)
      );

      currentPage = 1;
      renderTable();
    });
  }

  // ================= SORT =================
  headers.forEach(header => {
    header.addEventListener("click", () => {

      const columnIndex = header.getAttribute("data-column");
      const asc = header.classList.toggle("asc");

      // reset header อื่น
      headers.forEach(h => {
        if (h !== header) {
          h.classList.remove("asc", "desc");
        }
      });

      header.classList.toggle("desc", !asc);

      filteredRows.sort((a, b) => {
        const aText = a.children[columnIndex].innerText.trim().toLowerCase();
        const bText = b.children[columnIndex].innerText.trim().toLowerCase();

        return asc
          ? aText.localeCompare(bText, undefined, { numeric: true })
          : bText.localeCompare(aText, undefined, { numeric: true });
      });

      renderTable();
    });
  });

  // ================= PAGINATION =================
  const paginationDiv = document.createElement("div");
  paginationDiv.classList.add("pagination");
  table.after(paginationDiv);

  function renderTable() {
    tbody.innerHTML = "";

    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const pageRows = filteredRows.slice(start, end);

    pageRows.forEach(row => tbody.appendChild(row));

    renderPagination();
  }

  function renderPagination() {
    paginationDiv.innerHTML = "";

    const pageCount = Math.ceil(filteredRows.length / rowsPerPage);

    for (let i = 1; i <= pageCount; i++) {
      const btn = document.createElement("button");
      btn.innerText = i;

      if (i === currentPage) {
        btn.classList.add("active");
      }

      btn.addEventListener("click", () => {
        currentPage = i;
        renderTable();
      });

      paginationDiv.appendChild(btn);
    }
  }

  // ================= ROW SELECTOR =================
  const selector = document.createElement("select");
  [5, 10, 20, 50].forEach(num => {
    const option = document.createElement("option");
    option.value = num;
    option.text = num + " rows";
    selector.appendChild(option);
  });

  selector.value = 20;

  selector.addEventListener("change", function () {
    rowsPerPage = parseInt(this.value);
    currentPage = 1;
    renderTable();
  });

  table.before(selector);

  // Initial render
  renderTable();
});