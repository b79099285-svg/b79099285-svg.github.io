(() => {
  "use strict";

  const cfg = window.FEXING || {};
  const server = cfg.server || {};
  const links = cfg.links || {};
  const prices = cfg.prices || {};
  const root = document.documentElement;
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canHover = window.matchMedia("(pointer: fine)").matches;

  const ip = String(server.ip || "").trim();
  const connectCommand = ip ? `connect ${ip}` : "connect <IP сервера>";

  /* ---------- Подставляем данные из конфига ---------- */

  $$("[data-ip-text]").forEach((el) => {
    if (ip) el.textContent = ip;
  });

  $$("[data-connect]").forEach((el) => {
    el.textContent = connectCommand;
  });

  $$("[data-copy-connect]").forEach((el) => {
    el.setAttribute("aria-label", `Скопировать команду подключения: ${connectCommand}`);
  });

  $$("[data-link]").forEach((el) => {
    const url = links[el.dataset.link];
    if (!url) return;
    el.setAttribute("href", url);
    if (/^https?:/i.test(url)) {
      el.setAttribute("target", "_blank");
      el.setAttribute("rel", "noopener noreferrer");
    }
  });

  $$("[data-year]").forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });

  const statusMap = {
    online: { label: "Онлайн", note: "Сервер работает" },
    maintenance: { label: "Тех. работы", note: "Скоро вернёмся" },
    offline: { label: "Оффлайн", note: "Сервер недоступен" }
  };
  const statusKey = statusMap[server.status] ? server.status : "online";
  const status = statusMap[statusKey];

  $$("[data-status]").forEach((el) => {
    el.dataset.status = statusKey;
  });
  $$("[data-status-label]").forEach((el) => {
    el.textContent = status.label;
  });
  $$("[data-status-note]").forEach((el) => {
    el.textContent = status.note;
  });

  /* ---------- Цены и переключатель периода ---------- */

  const money = new Intl.NumberFormat("ru-RU");
  const hasPricing = $$("[data-price]").length > 0;

  function setPeriod(period) {
    if (period !== "forever") period = "month";
    root.dataset.period = period;

    $$("[data-price]").forEach((el) => {
      const value = prices[el.dataset.price]?.[period];
      if (typeof value === "number") el.textContent = money.format(value);
    });

    $$("[data-price-old]").forEach((el) => {
      const monthly = prices[el.dataset.priceOld]?.month;
      if (typeof monthly === "number") el.textContent = `${money.format(monthly * 12)} ₽`;
    });

    $$("[data-price-note]").forEach((el) => {
      el.textContent = period === "month" ? "Оплата за месяц" : "Один платёж, навсегда";
    });

    $$("[data-price-period-label]").forEach((el) => {
      el.textContent = period === "month" ? "Цена за месяц" : "Цена навсегда";
    });

    $$("[data-period-label]").forEach((el) => {
      el.textContent = period === "month" ? "/ мес" : "навсегда";
    });

    $$("[data-period-toggle] button").forEach((btn) => {
      const active = btn.dataset.period === period;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", String(active));
    });

    try {
      localStorage.setItem("fexing-period", period);
    } catch (_) {
      /* приватный режим — не страшно */
    }
  }

  $$("[data-period-toggle]").forEach((group) => {
    group.addEventListener("click", (event) => {
      const btn = event.target.closest("button[data-period]");
      if (!btn) return;
      setPeriod(btn.dataset.period);
    });
  });

  if (hasPricing) {
    let saved = "month";
    try {
      saved = localStorage.getItem("fexing-period") === "forever" ? "forever" : "month";
    } catch (_) {}
    setPeriod(saved);
  }

  /* ---------- Копирование ---------- */

  async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (_) {}
    }

    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.top = "-1000px";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch (_) {}
    area.remove();
    return ok;
  }

  let toastEl = $("[data-toast]");
  if (!toastEl) {
    toastEl = document.createElement("div");
    toastEl.className = "toast";
    toastEl.dataset.toast = "";
    toastEl.setAttribute("role", "status");
    toastEl.setAttribute("aria-live", "polite");
    toastEl.innerHTML =
      '<svg class="icon" aria-hidden="true"><use href="#i-check"></use></svg><span data-toast-text></span>';
    document.body.appendChild(toastEl);
  }

  let toastTimer = 0;
  function showToast(message) {
    const text = $("[data-toast-text]", toastEl);
    if (text) text.textContent = message;
    toastEl.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toastEl.classList.remove("is-visible"), 3200);
  }

  $$("[data-copy-connect]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (!ip) {
        showToast("IP пока не указан в js/config.js");
        return;
      }
      const ok = await copyText(connectCommand);
      showToast(ok ? "Команда скопирована. Вставь её в консоль CS2." : `Не удалось скопировать. IP: ${ip}`);
    });
  });

  /* ---------- Шапка, прогресс, мобильное меню ---------- */

  const header = $("[data-header]");
  const progress = $("[data-progress]");

  function onScroll() {
    const y = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle("is-scrolled", y > 12);
    if (progress) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const value = max > 0 ? Math.min(y / max, 1) : 0;
      progress.style.transform = `scaleX(${value})`;
    }
  }

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);

  const navToggle = $("[data-nav-toggle]");
  const mobileNav = $("[data-mobile-nav]");

  function closeNav() {
    if (!navToggle || !mobileNav) return;
    mobileNav.hidden = true;
    navToggle.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Открыть меню");
    document.body.classList.remove("nav-open");
  }

  if (navToggle && mobileNav) {
    navToggle.addEventListener("click", () => {
      const isOpen = navToggle.getAttribute("aria-expanded") === "true";
      if (isOpen) {
        closeNav();
        return;
      }
      mobileNav.hidden = false;
      navToggle.classList.add("is-open");
      navToggle.setAttribute("aria-expanded", "true");
      navToggle.setAttribute("aria-label", "Закрыть меню");
      document.body.classList.add("nav-open");
    });

    $$("a", mobileNav).forEach((link) => link.addEventListener("click", closeNav));

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeNav();
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 960) closeNav();
    });
  }

  /* ---------- Появление блоков при скролле ---------- */

  const revealItems = $$("[data-reveal]");

  if (revealItems.length) {
    if (reduceMotion || !("IntersectionObserver" in window)) {
      revealItems.forEach((el) => el.classList.add("is-visible"));
    } else {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          });
        },
        { threshold: 0.08, rootMargin: "0px 0px -6% 0px" }
      );
      revealItems.forEach((el) => observer.observe(el));
    }
  }

  /* ---------- Лёгкий наклон карточки сервера ---------- */

  const tiltCard = $("[data-tilt]");
  if (tiltCard && canHover && !reduceMotion) {
    tiltCard.addEventListener("pointermove", (event) => {
      const rect = tiltCard.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      tiltCard.style.transform = `perspective(1100px) rotateX(${(-y * 3.2).toFixed(2)}deg) rotateY(${(x * 3.2).toFixed(2)}deg) translateY(-4px)`;
    });

    tiltCard.addEventListener("pointerleave", () => {
      tiltCard.style.transform = "";
    });
  }

  /* ---------- FAQ: открыт только один вопрос ---------- */

  $$(".faq-item").forEach((item) => {
    item.addEventListener("toggle", () => {
      if (!item.open) return;
      $$(".faq-item[open]").forEach((other) => {
        if (other !== item) other.open = false;
      });
    });
  });
})();
