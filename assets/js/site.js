(() => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const header = document.querySelector("[data-header]");
  const menuButton = document.querySelector(".menu-toggle");
  const scrollProof = document.querySelector("[data-scroll-proof]");
  const proofBlocks = [...document.querySelectorAll(".wire-block")];
  const brandGravity = document.querySelector("[data-brand-gravity]");
  const gravityPanels = [...document.querySelectorAll(".noise-panel")];
  const gravityComponents = [...document.querySelectorAll(".gravity-component")];
  let frameRequested = false;

  const clamp01 = (value) => Math.min(1, Math.max(0, value));
  const phase = (value, start, end) => clamp01((value - start) / (end - start));
  const lerp = (from, to, value) => from + (to - from) * value;
  const blockOrigins = [
    { x: -160, y: -115, z: 90, r: -8, s: 0.94 },
    { x: -125, y: -40, z: 125, r: -6, s: 0.96 },
    { x: -175, y: 35, z: 185, r: 7, s: 1.04 },
    { x: -145, y: 98, z: 105, r: -5, s: 0.96 },
    { x: -70, y: 145, z: 155, r: 6, s: 1.02 },
    { x: 175, y: 10, z: 220, r: 10, s: 1.08 },
    { x: -130, y: 145, z: 90, r: -5, s: 0.97 },
    { x: 10, y: 175, z: 130, r: 4, s: 0.98 },
    { x: 140, y: 135, z: 105, r: -5, s: 0.97 },
    { x: -125, y: 205, z: 125, r: -7, s: 0.96 },
    { x: 15, y: 225, z: 170, r: 5, s: 0.98 },
    { x: 145, y: 195, z: 120, r: -6, s: 0.96 },
    { x: 70, y: 245, z: 150, r: 4, s: 0.98 }
  ];
  const gravityPanelOrigins = [
    { x: -610, y: -245, z: -80, r: -8, s: 0.94, blur: 1.5 },
    { x: -385, y: -285, z: 55, r: 6, s: 0.82, blur: 2.4 },
    { x: -155, y: -255, z: -120, r: -4, s: 0.72, blur: 3.2 },
    { x: 205, y: -275, z: -90, r: 5, s: 0.76, blur: 2.8 },
    { x: 440, y: -235, z: 70, r: -6, s: 0.88, blur: 1.8 },
    { x: 620, y: -90, z: -60, r: 8, s: 0.92, blur: 2.2 },
    { x: -635, y: 5, z: 45, r: 7, s: 0.86, blur: 2.6 },
    { x: -520, y: 235, z: -75, r: -5, s: 0.9, blur: 1.7 },
    { x: -225, y: 270, z: 80, r: 5, s: 0.76, blur: 3.1 },
    { x: 180, y: 285, z: -85, r: -4, s: 0.72, blur: 3.4 },
    { x: 430, y: 250, z: 65, r: 6, s: 0.84, blur: 2.1 },
    { x: 625, y: 115, z: -55, r: -7, s: 0.94, blur: 1.6 }
  ];
  const gravityComponentOrigins = [
    { x: -210, y: -145, z: 150, r: -7, s: 0.94 },
    { x: -180, y: -55, z: 120, r: -5, s: 0.96 },
    { x: -235, y: 20, z: 210, r: 6, s: 1.04 },
    { x: -190, y: 105, z: 120, r: -4, s: 0.96 },
    { x: -90, y: 155, z: 175, r: 5, s: 1.02 },
    { x: 225, y: 15, z: 240, r: 9, s: 1.08 },
    { x: -210, y: 205, z: 120, r: -6, s: 0.96 },
    { x: -65, y: 235, z: 165, r: 5, s: 0.98 },
    { x: 85, y: 220, z: 140, r: -5, s: 0.97 },
    { x: 225, y: 195, z: 110, r: 6, s: 0.96 },
    { x: 120, y: 275, z: 150, r: -4, s: 0.98 }
  ];

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
    const cameraSettle = clamp01(assemble * 0.72 + polish * 0.28);

    scrollProof.style.setProperty("--scene-progress", progressValue.toFixed(4));
    scrollProof.style.setProperty("--scene-phase-a", emerge.toFixed(4));
    scrollProof.style.setProperty("--scene-phase-b", scatter.toFixed(4));
    scrollProof.style.setProperty("--scene-phase-c", assemble.toFixed(4));
    scrollProof.style.setProperty("--scene-phase-d", polish.toFixed(4));
    scrollProof.style.setProperty("--scene-phase-e", launch.toFixed(4));
    scrollProof.style.setProperty("--proof-ambient-opacity", String(lerp(0.06, 0.34, emerge)));
    scrollProof.style.setProperty("--proof-browser-opacity", String(lerp(0.04, 1, Math.max(emerge, assemble))));
    scrollProof.style.setProperty("--proof-copy-opacity", String(lerp(1, 0.56, launch)));
    scrollProof.style.setProperty("--proof-polish", String(polish));
    scrollProof.style.setProperty("--proof-launch", String(launch));
    scrollProof.style.setProperty("--proof-content-opacity", String(Math.max(scatter * 0.48, polish)));
    scrollProof.style.setProperty("--proof-guides-opacity", String(lerp(0.72, 0.08, polish)));
    scrollProof.style.setProperty("--proof-glow", `${(polish * 1.4).toFixed(2)}rem`);
    scrollProof.style.setProperty("--proof-launch-offset", `${lerp(12, 0, launch).toFixed(1)}px`);
    scrollProof.style.setProperty("--proof-sheen-x", `${lerp(-145, 145, launch).toFixed(1)}%`);
    scrollProof.style.setProperty("--proof-camera-transform", `translate3d(0, ${lerp(24, 0, cameraSettle).toFixed(1)}px, 0) rotateX(${lerp(isMobile ? 14 : 50, isMobile ? 0.25 : 0.5, cameraSettle).toFixed(2)}deg) rotateZ(${lerp(isMobile ? -1.5 : -7, 0, cameraSettle).toFixed(2)}deg) scale(${lerp(isMobile ? 0.9 : 0.8, isMobile ? 0.995 : 0.99, cameraSettle).toFixed(3)})`);
    scrollProof.classList.toggle("is-settled", progressValue >= 0.82);
    scrollProof.classList.toggle("is-complete", progressValue >= 0.985);

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

  const setBrandGravityProgress = (value) => {
    if (!brandGravity) return;
    const progressValue = reducedMotion ? 1 : value;
    const noise = phase(progressValue, 0, 0.2);
    const pulse = phase(progressValue, 0.2, 0.4);
    const attraction = phase(progressValue, 0.4, 0.65);
    const dominance = phase(progressValue, 0.65, 0.85);
    const final = phase(progressValue, 0.85, 1);
    const isMobile = window.innerWidth <= 760;
    const spatialScale = isMobile ? 0.55 : Math.min(1, window.innerWidth / 1440);
    const depthScale = isMobile ? 0.46 : 1;
    const retreat = clamp01(attraction * 0.55 + dominance * 0.35 + final * 0.1);
    const camera = clamp01(pulse * 0.25 + attraction * 0.45 + dominance * 0.25 + final * 0.05);
    const presence = Math.max(pulse * 0.46, attraction, dominance, final);

    brandGravity.style.setProperty("--brand-gravity-progress", progressValue.toFixed(4));
    brandGravity.style.setProperty("--brand-noise", noise.toFixed(4));
    brandGravity.style.setProperty("--brand-pulse", pulse.toFixed(4));
    brandGravity.style.setProperty("--brand-attraction", attraction.toFixed(4));
    brandGravity.style.setProperty("--brand-dominance", dominance.toFixed(4));
    brandGravity.style.setProperty("--brand-final", final.toFixed(4));
    brandGravity.style.setProperty("--brand-browser-opacity", String(lerp(0.015, 1, presence)));
    brandGravity.style.setProperty("--brand-core-opacity", String(lerp(0.04, 0.82, Math.max(pulse, attraction))));
    brandGravity.style.setProperty("--brand-core-scale", String(lerp(0.25, 1.8, clamp01(pulse * 0.65 + attraction * 0.35))));
    brandGravity.style.setProperty("--brand-label-opacity", String(lerp(1, 0.08, dominance)));
    brandGravity.style.setProperty("--brand-page-clarity", String(clamp01(attraction * 0.45 + dominance * 0.55)));
    brandGravity.style.setProperty("--brand-glow", `${lerp(0, isMobile ? 1.5 : 3.2, dominance).toFixed(2)}rem`);
    brandGravity.style.setProperty("--brand-established-opacity", String(final));
    brandGravity.style.setProperty("--brand-established-offset", `${lerp(12, 0, final).toFixed(1)}px`);
    brandGravity.style.setProperty("--brand-sheen-x", `${lerp(-150, 150, final).toFixed(1)}%`);
    brandGravity.style.setProperty("--brand-browser-transform", `translate3d(0, ${lerp(34, 0, camera).toFixed(1)}px, 0) rotateX(${lerp(isMobile ? 15 : 38, isMobile ? 0.3 : 0.6, camera).toFixed(2)}deg) rotateZ(${lerp(isMobile ? -2 : -6, 0, camera).toFixed(2)}deg) scale(${lerp(isMobile ? 0.62 : 0.54, isMobile ? 0.995 : 1, camera).toFixed(3)})`);
    brandGravity.classList.toggle("is-settled", progressValue >= 0.85);
    brandGravity.classList.toggle("is-complete", progressValue >= 0.985);

    gravityPanels.forEach((panel, index) => {
      const origin = gravityPanelOrigins[index] || gravityPanelOrigins[0];
      const direction = origin.x < 0 ? -1 : 1;
      const driftX = Math.sin(progressValue * Math.PI * (1.25 + index * 0.035) + index) * 18 * (1 - dominance);
      const driftY = Math.cos(progressValue * Math.PI * (1.1 + index * 0.025) + index) * 12 * (1 - dominance);
      const x = (origin.x + driftX + direction * retreat * 18) * spatialScale;
      const y = (origin.y * (1 + retreat * 0.12) + driftY) * (isMobile ? 0.72 : 1);
      const z = origin.z - retreat * 210;
      const rotate = origin.r + direction * retreat * 7;
      const scale = lerp(origin.s, isMobile ? 0.58 : 0.68, dominance * 0.82 + final * 0.18);
      const blur = lerp(origin.blur, isMobile ? 4.2 : 8.5, dominance * 0.82 + final * 0.18);
      const opacity = lerp(0.34, 0.095, dominance * 0.84 + final * 0.16);
      panel.style.opacity = String(opacity);
      panel.style.filter = `blur(${blur.toFixed(2)}px) saturate(${lerp(0.72, 0.15, dominance).toFixed(2)})`;
      panel.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, ${z.toFixed(1)}px) rotate(${rotate.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
    });

    gravityComponents.forEach((component, index) => {
      const origin = gravityComponentOrigins[index] || gravityComponentOrigins[0];
      const reveal = clamp01(pulse * 1.35 - index * 0.055);
      const remaining = 1 - attraction;
      const x = origin.x * remaining * depthScale;
      const y = origin.y * remaining * depthScale;
      const z = origin.z * remaining * depthScale;
      const rotate = origin.r * remaining;
      const scale = lerp(origin.s, 1, attraction);
      component.style.opacity = String(Math.max(reveal, attraction, reducedMotion ? 1 : 0));
      component.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, ${z.toFixed(1)}px) rotate(${rotate.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
    });
  };

  const readScroll = () => {
    header?.classList.toggle("is-scrolled", window.scrollY > 24);
    if (scrollProof) {
      const rect = scrollProof.getBoundingClientRect();
      const travel = Math.max(1, scrollProof.offsetHeight - window.innerHeight);
      setScrollProofProgress(clamp01(-rect.top / travel));
    }
    if (brandGravity) {
      const rect = brandGravity.getBoundingClientRect();
      const travel = Math.max(1, brandGravity.offsetHeight - window.innerHeight);
      setBrandGravityProgress(clamp01(-rect.top / travel));
    }
    frameRequested = false;
  };

  const requestRead = () => {
    if (frameRequested) return;
    frameRequested = true;
    requestAnimationFrame(readScroll);
  };

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
    link.addEventListener("click", () => localStorage.setItem("standloud-language", link.dataset.language));
  });
  document.querySelectorAll(".footer-bottom .language-switcher a").forEach((link) => {
    link.addEventListener("click", () => {
      const value = link.textContent.trim().toLowerCase();
      localStorage.setItem("standloud-language", value);
    });
  });

  const form = document.querySelector("[data-demo-form]");
  const formStartedAt = performance.now();
  document.querySelectorAll("[data-service-choice]").forEach((link) => {
    link.addEventListener("click", () => {
      const select = form?.querySelector("[name='service']");
      if (!select) return;
      select.value = link.dataset.serviceChoice;
      select.dispatchEvent(new Event("change", { bubbles: true }));
    });
  });

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    const status = form.querySelector("[data-form-status]");
    const submit = form.querySelector("[type='submit']");
    const trap = form.querySelector("[name='website']");
    const minimumDelay = Number(form.dataset.minSubmitDelay || 0);
    status.classList.remove("is-success", "is-error");

    if (trap?.value || performance.now() - formStartedAt < minimumDelay) {
      status.textContent = status.dataset.error;
      status.classList.add("is-error");
      return;
    }

    if (!form.checkValidity()) {
      status.textContent = status.dataset.error;
      status.classList.add("is-error");
      form.querySelector(":invalid")?.focus();
      form.reportValidity();
      return;
    }

    submit.disabled = true;
    form.setAttribute("aria-busy", "true");
    form.classList.add("is-sending");
    status.textContent = status.dataset.loading;

    window.setTimeout(() => {
      form.classList.remove("is-sending");
      form.removeAttribute("aria-busy");
      submit.disabled = false;
      status.textContent = status.dataset.success;
      status.classList.add("is-success");
      form.reset();
    }, reducedMotion ? 0 : 350);
  });

  document.querySelectorAll("[data-year]").forEach((node) => {
    node.textContent = new Date().getFullYear();
  });

  addEventListener("scroll", requestRead, { passive: true });
  addEventListener("resize", requestRead, { passive: true });
  if (scrollProof && reducedMotion) setScrollProofProgress(1);
  if (brandGravity && reducedMotion) setBrandGravityProgress(1);
  readScroll();
})();
