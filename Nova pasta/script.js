;(function () {
  "use strict"

  // ===== Elements =====
  const header = document.querySelector(".site-header")
  const nav = document.querySelector(".nav")

  const toggleBtn = document.querySelector(".nav-toggle")
  const drawer = document.querySelector(".nav-drawer")
  const closeBtn = document.querySelector(".nav-close")

  const form = document.querySelector("#contact-form")
  const feedback = document.querySelector(".form-feedback")

  const marquee = document.querySelector(".portfolio-marquee")

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches

  // ===== Helpers =====
  function getHeaderOffset() {
    if (!nav) return 0
    return nav.getBoundingClientRect().height
  }

  function smoothScrollTo(targetEl) {
    const headerOffset = getHeaderOffset()
    const top =
      window.scrollY + targetEl.getBoundingClientRect().top - headerOffset

    window.scrollTo({
      top: Math.max(top, 0),
      behavior: prefersReducedMotion ? "auto" : "smooth",
    })
  }

  // ===== Header theme (dark/light) by section =====
  function setHeaderTheme(theme) {
    if (!header) return

    header.classList.toggle("header--dark", theme === "dark")
    header.classList.toggle("header--light", theme === "light")
  }

  // default theme
  setHeaderTheme("dark")

  // Observe sections and footer; expects data-header="dark|light"
  const themedTargets = document.querySelectorAll("main section, footer")
  if (header && themedTargets.length) {
    const themeObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) => (b.intersectionRatio || 0) - (a.intersectionRatio || 0),
          )[0]

        if (!visible) return

        const theme = visible.target.getAttribute("data-header")
        if (theme === "light" || theme === "dark") setHeaderTheme(theme)
      },
      {
        threshold: [0.15, 0.25, 0.35, 0.5],
        rootMargin: "-10% 0px -70% 0px",
      },
    )

    themedTargets.forEach((el) => themeObserver.observe(el))
  }

  // ===== Mobile drawer =====
  function setDrawer(open) {
    if (!drawer || !toggleBtn) return

    drawer.classList.toggle("is-open", open)
    drawer.setAttribute("aria-hidden", String(!open))
    toggleBtn.setAttribute("aria-expanded", String(open))

    // lock body scroll when open
    document.body.style.overflow = open ? "hidden" : ""
  }

  if (toggleBtn && drawer) {
    toggleBtn.addEventListener("click", () => {
      const open = toggleBtn.getAttribute("aria-expanded") !== "true"
      setDrawer(open)
    })

    if (closeBtn) closeBtn.addEventListener("click", () => setDrawer(false))

    // click outside panel closes
    drawer.addEventListener("click", (e) => {
      if (e.target === drawer) setDrawer(false)
    })

    // Escape closes
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setDrawer(false)
    })

    // close drawer when clicking a link inside it
    drawer.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener("click", () => setDrawer(false))
    })
  }

  // ===== Anchor scrolling with header offset =====
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const href = a.getAttribute("href")
      if (!href || href === "#") return

      const target = document.querySelector(href)
      if (!target) return

      e.preventDefault()
      smoothScrollTo(target)
    })
  })

  // ===== Marquee pause on hover (desktop) =====
  if (marquee) {
    marquee.addEventListener("mouseenter", () => {
      marquee.style.animationPlayState = "paused"
    })
    marquee.addEventListener("mouseleave", () => {
      marquee.style.animationPlayState = "running"
    })
  }

  // ===== Reveal animations (cards/steps/stats) =====
  const revealTargets = document.querySelectorAll(
    ".service-card, .process-step, .stat",
  )

  if (revealTargets.length) {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    }

    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return

        // reveal
        entry.target.style.opacity = "1"
        entry.target.style.transform = "translateY(0)"

        // stop observing after reveal
        revealObserver.unobserve(entry.target)
      })
    }, observerOptions)

    revealTargets.forEach((el) => {
      el.style.opacity = "0"
      el.style.transform = "translateY(40px)"
      el.style.transition = prefersReducedMotion
        ? "none"
        : "opacity 0.8s ease, transform 0.8s ease"
      revealObserver.observe(el)
    })
  }

  // ===== Form feedback (fake submit) =====
  if (form && feedback) {
    form.addEventListener("submit", (e) => {
      e.preventDefault()

      // simple client-side feedback
      feedback.textContent =
        "Mensagem enviada com sucesso! Entrarei em contato em breve."
      form.reset()
    })
  }
})()
