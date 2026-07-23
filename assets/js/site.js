(() => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const header = document.querySelector("[data-header]");
  const menuButton = document.querySelector(".menu-toggle");
  const world = document.querySelector(".world");
  const steps = [...document.querySelectorAll(".world-step")];
  const stageImages = [...document.querySelectorAll(".world-stage__image")];
  const routes = [...document.querySelectorAll("[data-route]")];
  const progress = document.querySelector(".world-progress");
  const progressBar = progress?.querySelector("span");
  const routeNav = document.querySelector(".world-route");
  let activeScene = 0;
  let visibleLayer = 0;
  let frameRequested = false;

  const setScene = (index) => {
    if (index === activeScene && steps[index]?.classList.contains("is-active")) return;
    activeScene = index;
    steps.forEach((step, i) => step.classList.toggle("is-active", i === index));
    routes.forEach((route, i) => {
      route.classList.toggle("is-active", i === index);
      if (i === index) route.setAttribute("aria-current", "step");
      else route.removeAttribute("aria-current");
    });

    if (!stageImages.length || window.innerWidth <= 760 || reducedMotion) return;
    const nextLayer = visibleLayer === 0 ? 1 : 0;
    const nextImage = stageImages[nextLayer];
    nextImage.src = steps[index].dataset.image;
    nextImage.onload = () => {
      stageImages[visibleLayer].classList.remove("is-visible");
      nextImage.classList.add("is-visible");
      visibleLayer = nextLayer;
    };
  };

  const readScroll = () => {
    header?.classList.toggle("is-scrolled", window.scrollY > 24);
    if (world && progress && progressBar) {
      const rect = world.getBoundingClientRect();
      const travel = Math.max(1, world.offsetHeight - window.innerHeight);
      const value = Math.min(1, Math.max(0, -rect.top / travel));
      progressBar.style.transform = `scaleX(${value})`;
      progress.setAttribute("aria-valuenow", String(Math.round(value * 100)));
      routeNav?.classList.toggle("is-in-world", rect.top <= 0 && rect.bottom >= window.innerHeight);
    }
    frameRequested = false;
  };

  const requestRead = () => {
    if (frameRequested) return;
    frameRequested = true;
    requestAnimationFrame(readScroll);
  };

  if ("IntersectionObserver" in window && steps.length) {
    const sceneObserver = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setScene(Number(visible.target.dataset.scene));
    }, { rootMargin: "-20% 0px -20% 0px", threshold: [0.2, 0.4, 0.6] });
    steps.forEach((step) => sceneObserver.observe(step));
  }

  const revealItems = [...document.querySelectorAll(".reveal")];
  if (!reducedMotion && "IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12 });
    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  menuButton?.addEventListener("click", () => {
    const open = header.classList.toggle("is-menu-open");
    menuButton.setAttribute("aria-expanded", String(open));
  });
  document.querySelectorAll(".primary-nav a").forEach((link) => link.addEventListener("click", () => {
    header?.classList.remove("is-menu-open");
    menuButton?.setAttribute("aria-expanded", "false");
  }));

  document.querySelectorAll("[data-language]").forEach((link) => {
    link.addEventListener("click", () => localStorage.setItem("nova-frame-language", link.dataset.language));
  });
  document.querySelectorAll(".footer-bottom .language-switcher a").forEach((link) => {
    link.addEventListener("click", () => {
      const value = link.textContent.trim().toLowerCase();
      localStorage.setItem("nova-frame-language", value);
    });
  });

  document.querySelector("[data-demo-form]")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const status = form.querySelector("[data-form-status]");
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    status.textContent = status.dataset.message;
  });

  document.querySelectorAll("[data-placeholder]").forEach((link) => {
    link.addEventListener("click", (event) => event.preventDefault());
  });
  document.querySelectorAll("[data-year]").forEach((node) => {
    node.textContent = new Date().getFullYear();
  });

  addEventListener("scroll", requestRead, { passive: true });
  addEventListener("resize", requestRead, { passive: true });
  readScroll();
  setScene(0);
})();
