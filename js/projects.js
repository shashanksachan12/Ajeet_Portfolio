export function initProjectFilters() {
  const filterButtons = Array.from(document.querySelectorAll(".filter-btn"));
  const projectCards = Array.from(document.querySelectorAll(".project-card"));
  const emptyState = document.getElementById("projectEmptyState");

  function styleFilterButtons() {
    filterButtons.forEach((button) => {
      const isActive = button.classList.contains("active");
      button.setAttribute("aria-pressed", String(isActive));
      button.classList.toggle("bg-acid", isActive);
      button.classList.toggle("text-obsidian", isActive);
      button.classList.toggle("border-acid", isActive);
      button.classList.toggle("border-white/20", !isActive);
      button.classList.toggle("text-silver", !isActive);
    });
  }

  function applyFilter(filter) {
    let visibleCount = 0;

    projectCards.forEach((card) => {
      const isMatch = filter === "all" || card.dataset.category === filter;
      if (isMatch) {
        visibleCount += 1;
        card.hidden = false;
        window.requestAnimationFrame(() => {
          card.classList.remove("opacity-0", "scale-95");
        });
      } else {
        card.classList.add("opacity-0", "scale-95");
        window.setTimeout(() => {
          if (filter !== "all" && card.dataset.category !== filter) {
            card.hidden = true;
          }
        }, 250);
      }
    });

    if (emptyState) emptyState.classList.toggle("hidden", visibleCount > 0);
  }

  styleFilterButtons();

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      filterButtons.forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      styleFilterButtons();
      applyFilter(button.dataset.filter);
    });
  });
}
