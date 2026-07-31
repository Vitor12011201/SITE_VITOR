(() => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const header = document.querySelector("[data-header]");
  const menuButton = document.querySelector(".menu-toggle");
  let frameRequested = false;

  const clamp01 = (value) => Math.min(1, Math.max(0, value));
  const setInert = (node, value) => {
    if ("inert" in node) node.inert = value;
    if (value) node.setAttribute("inert", "");
    else node.removeAttribute("inert");
  };

  const initSelectedWorkCarousel = () => {
    document.querySelectorAll("[data-selected-work]").forEach((carousel) => {
      if (carousel.dataset.selectedWorkReady === "true") return;
      carousel.dataset.selectedWorkReady = "true";

      const slides = [...carousel.querySelectorAll("[data-selected-work-slide]")];
      const dots = [...carousel.querySelectorAll("[data-selected-work-dot]")];
      const previous = carousel.querySelector("[data-selected-work-prev]");
      const next = carousel.querySelector("[data-selected-work-next]");
      const address = carousel.querySelector("[data-selected-work-address]");
      const action = carousel.querySelector("[data-selected-work-action]");
      if (slides.length !== 3 || dots.length !== 3 || !action) return;

      let activeIndex = Math.max(0, slides.findIndex((slide) => slide.classList.contains("is-active")));
      let timer = 0;
      let pausedByUser = false;
      let pointerStartX = null;
      const delay = 5600;

      const stop = () => {
        if (!timer) return;
        window.clearTimeout(timer);
        timer = 0;
      };

      const schedule = () => {
        stop();
        if (reducedMotion || pausedByUser || document.hidden) return;
        timer = window.setTimeout(() => {
          setActive(activeIndex + 1, { userInitiated: false });
        }, delay);
      };

      function setActive(index, options = {}) {
        activeIndex = (index + slides.length) % slides.length;
        slides.forEach((slide, slideIndex) => {
          const active = slideIndex === activeIndex;
          slide.classList.toggle("is-active", active);
          slide.setAttribute("aria-hidden", String(!active));
          setInert(slide, !active);
        });
        dots.forEach((dot, dotIndex) => {
          const active = dotIndex === activeIndex;
          dot.classList.toggle("is-active", active);
          dot.setAttribute("aria-selected", String(active));
          dot.tabIndex = active ? 0 : -1;
        });
        if (address) address.textContent = slides[activeIndex].dataset.address || "";
        action.href = slides[activeIndex].dataset.href || "#projects";
        if (options.userInitiated) {
          pausedByUser = true;
          window.setTimeout(() => {
            pausedByUser = false;
            schedule();
          }, delay);
        }
        schedule();
      }

      const pause = () => {
        pausedByUser = true;
        stop();
      };
      const resume = () => {
        pausedByUser = false;
        schedule();
      };
      const interact = (index) => setActive(index, { userInitiated: true });

      previous?.addEventListener("click", () => interact(activeIndex - 1));
      next?.addEventListener("click", () => interact(activeIndex + 1));
      dots.forEach((dot, index) => dot.addEventListener("click", () => interact(index)));
      carousel.addEventListener("mouseenter", pause);
      carousel.addEventListener("mouseleave", resume);
      carousel.addEventListener("focusin", pause);
      carousel.addEventListener("focusout", () => {
        window.setTimeout(() => {
          if (!carousel.contains(document.activeElement)) resume();
        }, 0);
      });
      carousel.addEventListener("keydown", (event) => {
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          interact(activeIndex - 1);
        }
        if (event.key === "ArrowRight") {
          event.preventDefault();
          interact(activeIndex + 1);
        }
      });
      carousel.addEventListener("pointerdown", (event) => {
        if (event.pointerType === "mouse") return;
        pointerStartX = event.clientX;
      }, { passive: true });
      carousel.addEventListener("pointerup", (event) => {
        if (pointerStartX === null) return;
        const delta = event.clientX - pointerStartX;
        pointerStartX = null;
        if (Math.abs(delta) < 36) return;
        interact(activeIndex + (delta < 0 ? 1 : -1));
      }, { passive: true });
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) stop();
        else schedule();
      });

      setActive(activeIndex);
    });
  };

  const initImageComparisons = () => {
    document.querySelectorAll("[data-image-comparison]").forEach((comparison) => {
      if (comparison.dataset.comparisonReady === "true") return;
      comparison.dataset.comparisonReady = "true";
      comparison.classList.add("is-enhanced");
      comparison.setAttribute("role", "slider");
      comparison.setAttribute("tabindex", "0");
      comparison.setAttribute("aria-orientation", "horizontal");
      comparison.setAttribute("aria-valuemin", "0");
      comparison.setAttribute("aria-valuemax", "100");
      comparison.setAttribute("aria-label", comparison.dataset.comparisonLabel || "Image comparison");

      let activePointer = null;
      const beforeLabel = comparison.dataset.beforeLabel || "Before";
      const afterLabel = comparison.dataset.afterLabel || "After";

      const setPosition = (value) => {
        const position = Math.round(clamp01(Number(value) / 100) * 100);
        comparison.style.setProperty("--compare-position", `${position}%`);
        comparison.dataset.position = String(position);
        comparison.setAttribute("aria-valuenow", String(position));
        comparison.setAttribute("aria-valuetext", `${position}% — ${beforeLabel} / ${afterLabel}`);
      };

      const setFromPointer = (clientX) => {
        const rect = comparison.getBoundingClientRect();
        if (!rect.width) return;
        setPosition(((clientX - rect.left) / rect.width) * 100);
      };

      comparison.addEventListener("pointerdown", (event) => {
        if (event.pointerType === "mouse" && event.button !== 0) return;
        activePointer = event.pointerId;
        comparison.classList.add("is-dragging");
        try { comparison.setPointerCapture(event.pointerId); } catch {}
        setFromPointer(event.clientX);
        event.preventDefault();
      });
      comparison.addEventListener("pointermove", (event) => {
        if (activePointer !== event.pointerId) return;
        setFromPointer(event.clientX);
        event.preventDefault();
      });
      const finishPointer = (event) => {
        if (activePointer !== event.pointerId) return;
        try {
          if (comparison.hasPointerCapture(event.pointerId)) {
            comparison.releasePointerCapture(event.pointerId);
          }
        } catch {}
        activePointer = null;
        comparison.classList.remove("is-dragging");
      };
      comparison.addEventListener("pointerup", finishPointer);
      comparison.addEventListener("pointercancel", finishPointer);
      comparison.addEventListener("dragstart", (event) => event.preventDefault());
      comparison.addEventListener("keydown", (event) => {
        const current = Number(comparison.dataset.position || 50);
        const step = event.shiftKey ? 10 : 5;
        let next = current;
        if (event.key === "ArrowLeft" || event.key === "ArrowDown") next -= step;
        else if (event.key === "ArrowRight" || event.key === "ArrowUp") next += step;
        else if (event.key === "Home") next = 0;
        else if (event.key === "End") next = 100;
        else return;
        event.preventDefault();
        setPosition(next);
      });

      setPosition(50);
    });
  };

  const readScroll = () => {
    header?.classList.toggle("is-scrolled", window.scrollY > 24);
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

  const setMenuOpen = (open) => {
    if (!header || !menuButton) return;
    header.classList.toggle("is-menu-open", open);
    menuButton.setAttribute("aria-expanded", String(open));
    const label = menuButton.querySelector(".sr-only");
    if (label) label.textContent = open ? menuButton.dataset.closeLabel : menuButton.dataset.openLabel;
  };
  menuButton?.addEventListener("click", () => {
    setMenuOpen(!header.classList.contains("is-menu-open"));
  });
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || !header?.classList.contains("is-menu-open")) return;
    setMenuOpen(false);
    menuButton?.focus();
  });
  document.addEventListener("pointerdown", (event) => {
    if (!header?.classList.contains("is-menu-open") || header.contains(event.target)) return;
    setMenuOpen(false);
  });
  document.querySelectorAll(".primary-nav a").forEach((link) => link.addEventListener("click", () => {
    setMenuOpen(false);
  }));
  document.querySelectorAll(".selected-work__link").forEach((link) => {
    link.addEventListener("click", () => {
      const target = document.querySelector(link.getAttribute("href"));
      if (!target) return;
      window.setTimeout(() => target.focus({ preventScroll: true }), reducedMotion ? 0 : 550);
    });
  });

  document.querySelectorAll("[data-language]").forEach((link) => {
    link.addEventListener("click", () => localStorage.setItem("standloud-language", link.dataset.language));
  });
  document.querySelectorAll(".footer-bottom .language-switcher a").forEach((link) => {
    link.addEventListener("click", () => {
      const value = link.textContent.trim().toLowerCase();
      localStorage.setItem("standloud-language", value);
    });
  });

  const form = document.querySelector("[data-contact-form]");
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

    const recipient = form.dataset.recipient?.trim() || "";
    if (!recipient || !recipient.includes("@")) {
      status.textContent = status.dataset.unavailable;
      status.classList.add("is-error");
      return;
    }

    submit.disabled = true;
    form.setAttribute("aria-busy", "true");
    form.classList.add("is-sending");
    status.textContent = status.dataset.loading;

    window.setTimeout(() => {
      const values = new FormData(form);
      const lines = [...form.querySelectorAll("input, select, textarea")]
        .filter((field) => field.name && field.name !== "website")
        .map((field) => {
          const label = field.labels?.[0]?.textContent?.trim() || field.name;
          return `${label}: ${values.get(field.name) || "—"}`;
        });
      const query = new URLSearchParams({
        subject: form.dataset.subject || "STANDLOUD",
        body: lines.join("\n\n")
      });
      window.location.href = `mailto:${recipient}?${query}`;
      form.classList.remove("is-sending");
      form.removeAttribute("aria-busy");
      submit.disabled = false;
      status.textContent = status.dataset.success;
      status.classList.add("is-success");
    }, reducedMotion ? 0 : 350);
  });

  document.querySelectorAll("[data-year]").forEach((node) => {
    node.textContent = new Date().getFullYear();
  });

  addEventListener("scroll", requestRead, { passive: true });
  initSelectedWorkCarousel();
  initImageComparisons();
  readScroll();
})();
