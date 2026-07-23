(() => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const header = document.querySelector("[data-header]");
  const menuButton = document.querySelector(".menu-toggle");
  const world = document.querySelector(".world");
  const scrollProof = document.querySelector("[data-scroll-proof]");
  const proofBlocks = [...document.querySelectorAll(".wire-block")];
  const steps = [...document.querySelectorAll(".world-step")];
  const stageImages = [...document.querySelectorAll(".world-stage__image")];
  const routes = [...document.querySelectorAll("[data-route]")];
  const progress = document.querySelector(".world-progress");
  const progressBar = progress?.querySelector("span");
  const routeNav = document.querySelector(".world-route");
  let activeScene = 0;
  let visibleLayer = 0;
  let frameRequested = false;

  const clamp01 = (value) => Math.min(1, Math.max(0, value));
  const phase = (value, start, end) => clamp01((value - start) / (end - start));
  const lerp = (from, to, value) => from + (to - from) * value;
  const blockOrigins = [
    { x: -180, y: -120, z: 80, r: -11, s: 0.92 },
    { x: 110, y: -95, z: 160, r: 8, s: 1.06 },
    { x: -150, y: 65, z: 110, r: 7, s: 0.96 },
    { x: 180, y: 105, z: 70, r: -9, s: 0.94 },
    { x: 165, y: -10, z: 220, r: 12, s: 1.08 },
    { x: -130, y: 145, z: 120, r: -7, s: 0.95 },
    { x: 20, y: 175, z: 165, r: 5, s: 0.98 },
    { x: 150, y: 145, z: 105, r: -6, s: 0.96 }
  ];

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

  const setScrollProofProgress = (value) => {
    if (!scrollProof) return;
    const progressValue = reducedMotion ? 1 : value;
    const emerge = phase(progressValue, 0, 0.15);
    const scatter = phase(progressValue, 0.15, 0.35);
    const assemble = phase(progressValue, 0.35, 0.6);
    const polish = phase(progressValue, 0.6, 0.82);
    const launch = phase(progressValue, 0.82, 1);
    const isMobile = window.innerWidth <= 760;
    const depthScale = isMobile ? 0.42 : 1;

    scrollProof.style.setProperty("--scene-progress", progressValue.toFixed(4));
    scrollProof.style.setProperty("--scene-phase-a", emerge.toFixed(4));
    scrollProof.style.setProperty("--scene-phase-b", scatter.toFixed(4));
    scrollProof.style.setProperty("--scene-phase-c", assemble.toFixed(4));
    scrollProof.style.setProperty("--scene-phase-d", polish.toFixed(4));
    scrollProof.style.setProperty("--scene-phase-e", launch.toFixed(4));
    scrollProof.style.setProperty("--proof-ambient-opacity", String(lerp(0.08, 0.52, emerge)));
    scrollProof.style.setProperty("--proof-browser-opacity", String(lerp(0.04, 1, Math.max(emerge, assemble))));
    scrollProof.style.setProperty("--proof-copy-opacity", String(lerp(1, 0.18, launch)));
    scrollProof.style.setProperty("--proof-final-opacity", String(launch));
    scrollProof.style.setProperty("--proof-polish", String(polish));
    scrollProof.style.setProperty("--proof-launch", String(launch));
    scrollProof.style.setProperty("--proof-glow", `${(polish * 3).toFixed(2)}rem`);
    scrollProof.style.setProperty("--proof-launch-offset", `${lerp(16, 0, launch).toFixed(1)}px`);
    scrollProof.style.setProperty("--proof-final-offset", `${lerp(20, 0, launch).toFixed(1)}px`);
    scrollProof.style.setProperty("--proof-camera-transform", `translate3d(0, ${lerp(28, -10, polish)}px, 0) rotateX(${lerp(58, isMobile ? 14 : 44, polish)}deg) rotateZ(${lerp(-10, isMobile ? 0 : -2, polish)}deg) scale(${lerp(isMobile ? 0.86 : 0.82, isMobile ? 1 : 1.08, polish)})`);

    proofBlocks.forEach((block, index) => {
      const origin = blockOrigins[index] || blockOrigins[0];
      const reveal = clamp01(scatter * 1.35 - index * 0.08);
      const remaining = 1 - assemble;
      const x = origin.x * remaining * depthScale;
      const y = origin.y * remaining * depthScale;
      const z = origin.z * remaining * depthScale;
      const rotate = origin.r * remaining;
      const scale = lerp(origin.s, 1, assemble);
      block.style.opacity = String(Math.max(reveal, assemble, reducedMotion ? 1 : 0));
      block.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, ${z.toFixed(1)}px) rotate(${rotate.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
    });
  };

  const readScroll = () => {
    header?.classList.toggle("is-scrolled", window.scrollY > 24);
    if (scrollProof) {
      const rect = scrollProof.getBoundingClientRect();
      const travel = Math.max(1, scrollProof.offsetHeight - window.innerHeight);
      setScrollProofProgress(clamp01(-rect.top / travel));
    }
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
  if (scrollProof && reducedMotion) setScrollProofProgress(1);
  readScroll();
  setScene(0);
})();
