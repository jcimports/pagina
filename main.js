(() => {
  const cfg = window.JC_CONFIG || {};
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const waLink = (msg) => `https://wa.me/${cfg.whatsapp}?text=${encodeURIComponent(msg)}`;

  /* ---------- WhatsApp ---------- */
  document.querySelectorAll("[data-wa]").forEach((a) => {
    a.href = waLink(a.dataset.wa);
    a.target = "_blank";
    a.rel = "noopener";
  });
  const waNum = document.getElementById("waNumber");
  if (waNum && cfg.whatsappDisplay) waNum.textContent = cfg.whatsappDisplay;

  /* ---------- Frase em palavras ---------- */
  const st = document.getElementById("statement");
  st.innerHTML = st.textContent.trim().split(/\s+/).map((w) => `<span class="w">${w}</span>`).join(" ");

  /* ---------- Checklist helpers ---------- */
  const items = [...document.querySelectorAll("#checkItems li")];
  const progress = document.getElementById("checkProgress");
  const count = document.getElementById("checkCount");
  document.getElementById("checkTotal").textContent = items.length;
  function setChecked(n) {
    items.forEach((li, i) => li.classList.toggle("on", i < n));
    progress.style.width = `${(n / items.length) * 100}%`;
    count.textContent = n;
  }

  /* ---------- Formulário de troca + menu do celular ---------- */
  initTradeForm();
  initMobileMenu();

  const hasGsap = window.gsap && window.ScrollTrigger;
  if (!hasGsap || reduce) {
    setChecked(items.length);
    document.getElementById("ringNum").textContent = "100";
    return;
  }
  document.documentElement.classList.add("has-gsap");
  gsap.registerPlugin(ScrollTrigger);

  /* ---------- Rolagem suave (Lenis) ---------- */
  let lenis = null;
  if (window.Lenis) {
    lenis = new Lenis({ duration: 0.6, easing: (t) => 1 - Math.pow(1 - t, 4), smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    window.__lenis = lenis;
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (id.length < 2) return;
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      lenis ? lenis.scrollTo(el, { offset: -52 }) : el.scrollIntoView({ behavior: "smooth" });
    });
  });

  /* ---------- Nav some ao descer, volta ao subir ---------- */
  const nav = document.getElementById("nav");
  let lastY = 0;
  ScrollTrigger.create({
    onUpdate: (self) => {
      const y = self.scroll();
      nav.classList.toggle("is-hidden", !nav.classList.contains("is-open") && y > 400 && y > lastY);
      lastY = y;
    },
  });

  /* ---------- Intro do hero ---------- */
  const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
  intro
    .from(".hero__aura", { opacity: 0, scale: 0.85, duration: 1.6, ease: "power2.out" }, 0)
    .from(".hero__title .line > span", { yPercent: 105, duration: 0.6, stagger: 0.08 }, 0)
    .from(".kicker[data-intro], .hero__sub", { opacity: 0, duration: 0.4 }, 0.1)
    .from(".hero__ctas", { opacity: 0, y: 8, duration: 0.4 }, 0.25)
    .from("#heroProduct", { opacity: 0, y: 24, scale: 0.96, duration: 0.7 }, 0.2)
    .from(".hero__facts", { opacity: 0, duration: 0.4 }, 0.5);

  /* Rolagem: produto cresce, texto sobe e desaparece */
  gsap.to("#heroProduct", {
    scale: 1.12, yPercent: -8, ease: "none",
    scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: true },
  });
  gsap.to(".hero__copy", {
    yPercent: -40, opacity: 0, ease: "none",
    scrollTrigger: { trigger: "#hero", start: "top top", end: "60% top", scrub: true },
  });
  gsap.to(".hero__aura", {
    scale: 1.3, opacity: 0.4, ease: "none",
    scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: true },
  });

  /* Leve inclinação seguindo o mouse */
  if (fine) {
    const img = document.querySelector("#heroProduct picture");
    const rx = gsap.quickTo(img, "rotationX", { duration: 1.2, ease: "power3.out" });
    const ry = gsap.quickTo(img, "rotationY", { duration: 1.2, ease: "power3.out" });
    gsap.set(img, { transformPerspective: 1200 });
    window.addEventListener("pointermove", (e) => {
      const x = e.clientX / window.innerWidth - 0.5;
      const y = e.clientY / window.innerHeight - 0.5;
      ry(x * 8); rx(-y * 6);
    });
  }

  /* ---------- Marquee com velocidade do scroll ---------- */
  const marquee = gsap.to("#marquee", { xPercent: -50, duration: 38, ease: "none", repeat: -1 });
  const speed = gsap.quickTo(marquee, "timeScale", { duration: 0.6, ease: "power2.out" });
  let hoverPaused = false;
  ScrollTrigger.create({
    trigger: ".marquee", start: "top bottom", end: "bottom top",
    onToggle: (self) => (self.isActive && !hoverPaused ? marquee.play() : marquee.pause()),
    onUpdate: (self) => { if (!hoverPaused) speed(1 + Math.min(4, Math.abs(self.getVelocity()) / 600)); },
  });
  ScrollTrigger.addEventListener("scrollEnd", () => { if (!hoverPaused) speed(1); });
  const mq = document.querySelector(".marquee");
  const pause = () => { hoverPaused = true; gsap.to(marquee, { timeScale: 0, duration: 0.5, ease: "power2.out", onComplete: () => marquee.pause() }); };
  const resume = () => { hoverPaused = false; marquee.play(); speed(1); };
  mq.addEventListener("pointerenter", pause);
  mq.addEventListener("pointerleave", resume);
  mq.addEventListener("focusin", pause);
  mq.addEventListener("focusout", resume);

  /* ---------- Frase acende palavra por palavra ---------- */
  gsap.to("#statement .w", {
    opacity: 1, stagger: 0.1, ease: "none",
    scrollTrigger: { trigger: ".statement", start: "top 75%", end: "bottom 60%", scrub: true },
  });

  /* ---------- Entradas: só a peça principal de cada seção se move ---------- */
  gsap.utils.toArray("[data-rise], [data-card]").forEach((el) => {
    gsap.from(el, {
      opacity: 0, y: 20, duration: 0.6, ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 88%", once: true },
    });
  });
  gsap.from(".brands", {
    opacity: 0, duration: 0.4, ease: "power2.out",
    scrollTrigger: { trigger: ".brands", start: "top 88%", once: true },
  });

  /* Upgrade: o aparelho antigo dá lugar ao novo, uma vez */
  const upg = gsap.timeline({ scrollTrigger: { trigger: ".card--upgrade", start: "top 70%", once: true }, defaults: { ease: "power3.out" } });
  upg
    .fromTo(".upg__old", { opacity: 1, y: 0 }, { opacity: 0.35, y: 6, duration: 0.5 })
    .fromTo(".upg__arrow", { scaleX: 0, transformOrigin: "left center" }, { scaleX: 1, duration: 0.4 }, 0.15)
    .fromTo(".upg__new", { opacity: 0, y: 14, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.6 }, 0.35);

  /* Parallax da imagem do card */
  gsap.utils.toArray("[data-parallax]").forEach((el) => {
    gsap.fromTo(el, { yPercent: 12 }, {
      yPercent: -6, ease: "none",
      scrollTrigger: { trigger: el.closest(".card"), start: "top bottom", end: "bottom top", scrub: true },
    });
  });

  /* ---------- Anel da bateria ---------- */
  const ring = document.getElementById("ringBar");
  const ringNum = document.getElementById("ringNum");
  const circ = 2 * Math.PI * 52;
  gsap.set(ring, { strokeDasharray: circ, strokeDashoffset: circ });
  const rn = { v: 0 };
  ScrollTrigger.create({
    trigger: "#seminovos", start: "top 70%", once: true,
    onEnter: () => {
      gsap.to(ring, { strokeDashoffset: 0, duration: 0.9, ease: "power3.out" });
      gsap.to(rn, { v: 100, duration: 0.9, ease: "power3.out", onUpdate: () => (ringNum.textContent = Math.round(rn.v)) });
    },
  });

  /* ---------- 21x ---------- */
  const payNum = document.getElementById("payNum");
  const pn = { v: 0 };
  payNum.textContent = "0";
  ScrollTrigger.create({
    trigger: payNum, start: "top 85%", once: true,
    onEnter: () => gsap.to(pn, { v: 21, duration: 0.9, ease: "power3.out", onUpdate: () => (payNum.textContent = Math.round(pn.v)) }),
  });

  /* ---------- Checklist ---------- */
  const mm = gsap.matchMedia();
  mm.add("(min-width: 901px)", () => {
    const t = ScrollTrigger.create({
      trigger: "#checkPin", start: "top top", end: "+=120%", pin: true, pinSpacing: true,
      onUpdate: (self) => setChecked(Math.min(items.length, Math.floor(self.progress * (items.length + 0.6)))),
    });
    return () => t.kill();
  });
  mm.add("(max-width: 900px)", () => {
    const ts = items.map((li, i) =>
      ScrollTrigger.create({ trigger: li, start: "top 75%", onEnter: () => setChecked(Math.max(i + 1, +count.textContent)) })
    );
    return () => ts.forEach((t) => t.kill());
  });

  /* ---------- Luz do cursor nos cards ---------- */
  if (fine) {
    document.querySelectorAll(".card").forEach((c) => {
      c.addEventListener("pointermove", (e) => {
        const r = c.getBoundingClientRect();
        c.style.setProperty("--mx", `${e.clientX - r.left}px`);
        c.style.setProperty("--my", `${e.clientY - r.top}px`);
      });
    });

  }

  window.addEventListener("load", () => ScrollTrigger.refresh());

  /* ========================================================= */
  function initTradeForm() {
    const tModel = document.getElementById("tModel");
    const tWant = document.getElementById("tWant");
    (cfg.tradeModels || []).forEach((m) => tModel.add(new Option(m, m)));
    (cfg.wantModels || []).forEach((m) => tWant.add(new Option(m, m)));

    document.querySelectorAll(".seg").forEach((seg) => {
      const btns = [...seg.querySelectorAll("button")];
      const select = (b) => {
        btns.forEach((x) => { x.setAttribute("aria-checked", x === b); x.tabIndex = x === b ? 0 : -1; });
        b.focus();
      };
      btns.forEach((b, i) => {
        b.tabIndex = b.getAttribute("aria-checked") === "true" ? 0 : -1;
        b.addEventListener("click", () => select(b));
        b.addEventListener("keydown", (e) => {
          if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); select(btns[(i + 1) % btns.length]); }
          if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); select(btns[(i - 1 + btns.length) % btns.length]); }
        });
      });
    });

    const tBattery = document.getElementById("tBattery");
    const tBatteryOut = document.getElementById("tBatteryOut");
    tBattery.addEventListener("input", () => { tBatteryOut.textContent = `${tBattery.value}%`; });

    const err = document.getElementById("tradeError");
    const hideErr = () => {
      tModel.removeAttribute("aria-invalid");
      if (err.hidden) return;
      err.classList.remove("is-on");
      setTimeout(() => { if (!err.classList.contains("is-on")) err.hidden = true; }, 200);
    };
    tModel.addEventListener("change", hideErr);

    document.getElementById("tradeForm").addEventListener("submit", (e) => {
      e.preventDefault();
      if (!tModel.value) {
        err.hidden = false;
        requestAnimationFrame(() => requestAnimationFrame(() => err.classList.add("is-on")));
        tModel.setAttribute("aria-invalid", "true");
        tModel.focus();
        return;
      }
      const pick = (id) => document.querySelector(`#${id} [aria-checked="true"]`)?.textContent || "";
      const lines = [
        "Olá! Quero fazer upgrade e avaliar meu iPhone atual:",
        `• Modelo: ${tModel.value}`,
        `• Armazenamento: ${pick("tStorage")}`,
        `• Bateria: ${tBattery.value}%`,
        `• Estado: ${pick("tCondition")}`,
      ];
      if (tWant.value) lines.push(`• Quero levar: ${tWant.value}`);
      window.open(waLink(lines.join("\n")), "_blank", "noopener");
    });
  }

  function initMobileMenu() {
    const nav = document.getElementById("nav");
    const btn = nav.querySelector(".nav__toggle");
    const menu = document.getElementById("mnav");
    if (!btn || !menu) return;
    const setOpen = (open) => {
      nav.classList.toggle("is-open", open);
      nav.classList.remove("is-hidden");
      btn.setAttribute("aria-expanded", String(open));
      btn.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
      document.documentElement.classList.toggle("menu-open", open);
      if (window.__lenis) open ? window.__lenis.stop() : window.__lenis.start();
      if (open) menu.querySelector("a")?.focus({ preventScroll: true });
    };
    btn.addEventListener("click", () => setOpen(!nav.classList.contains("is-open")));
    menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setOpen(false)));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && nav.classList.contains("is-open")) { setOpen(false); btn.focus(); }
    });
    window.matchMedia("(min-width: 901px)").addEventListener("change", (e) => { if (e.matches) setOpen(false); });
  }
})();
