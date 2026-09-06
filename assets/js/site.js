(() => {
  const header = document.querySelector("[data-header]");
  const menuButton = document.querySelector(".menu-toggle");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const closeMenu = () => {
    header?.classList.remove("is-menu-open");
    menuButton?.setAttribute("aria-expanded", "false");
  };

  menuButton?.addEventListener("click", () => {
    const open = header?.classList.toggle("is-menu-open") || false;
    menuButton.setAttribute("aria-expanded", String(open));
  });
  document.querySelectorAll(".primary-nav a").forEach((link) => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });

  const setHeaderState = () => header?.classList.toggle("is-scrolled", window.scrollY > 12);
  addEventListener("scroll", setHeaderState, { passive: true });
  setHeaderState();

  const revealItems = [...document.querySelectorAll(".reveal")];
  if (!reducedMotion && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        currentObserver.unobserve(entry.target);
      });
    }, { threshold: 0.08 });
    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  document.querySelectorAll("[data-language]").forEach((link) => {
    link.addEventListener("click", () => localStorage.setItem("standloud-language", link.dataset.language));
  });
  document.querySelectorAll(".language-switcher a").forEach((link) => {
    link.addEventListener("click", () => {
      const language = link.textContent.trim().toLowerCase();
      if (language === "pt" || language === "en") localStorage.setItem("standloud-language", language);
    });
  });
  document.querySelectorAll("[data-year]").forEach((node) => { node.textContent = new Date().getFullYear(); });
})();
