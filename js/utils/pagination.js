export function renderPagination(container, { currentPage, totalPages, onPageChange }) {
  container.innerHTML = "";

  if (!totalPages || totalPages <= 1) {
    return;
  }

  const prevButton = document.createElement("button");
  prevButton.type = "button";
  prevButton.className = "pagination-arrow";
  prevButton.textContent = "‹";
  prevButton.title = "Página anterior";
  prevButton.disabled = currentPage === 1;
  prevButton.addEventListener("click", () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  });
  container.appendChild(prevButton);

  for (let page = 1; page <= totalPages; page++) {
    const pageButton = document.createElement("button");
    pageButton.type = "button";
    pageButton.textContent = page;

    if (page === currentPage) {
      pageButton.classList.add("active");
    }

    pageButton.addEventListener("click", () => onPageChange(page));
    container.appendChild(pageButton);
  }

  const nextButton = document.createElement("button");
  nextButton.type = "button";
  nextButton.className = "pagination-arrow";
  nextButton.textContent = "›";
  nextButton.title = "Próxima página";
  nextButton.disabled = currentPage === totalPages;
  nextButton.addEventListener("click", () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  });
  container.appendChild(nextButton);
}