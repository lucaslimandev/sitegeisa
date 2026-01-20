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

  // ===== Header: sempre claro (fundo branco + texto escuro) =====
  // Mantemos o JS simples e evitamos trocar classes conforme o scroll.
  if (header) {
    header.classList.remove("header--dark")
    header.classList.add("header--light")
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

  // ===== Form submit: envia para WhatsApp + Email (automatico via FormSubmit) =====
  if (form && feedback) {
    form.addEventListener("submit", (e) => {
      e.preventDefault()

      const nome = (document.querySelector("#nome")?.value || "").trim()
      const email = (document.querySelector("#email")?.value || "").trim()
      const whats = (document.querySelector("#whats")?.value || "").trim()
      const segmento = (document.querySelector("#segmento")?.value || "").trim()
      const servico = (document.querySelector("#servico")?.value || "").trim()
      const mensagem = (document.querySelector("#mensagem")?.value || "").trim()

      const WHATSAPP_NUMBER = "5577981472959"
      // Troque pelo email que vai receber as notificacoes
      // (precisa existir; no FormSubmit voce confirma uma unica vez).
      const EMAIL_TO = "lucaslimadonasc@gmail.com"

      // Monta uma mensagem bonita (curta e objetiva)
      const linhas = [
        "Olá! Vim pelo seu site",
        nome ? `Nome: ${nome}` : null,
        email ? `Email: ${email}` : null,
        whats ? `WhatsApp: ${whats}` : null,
        segmento ? `Segmento: ${segmento}` : null,
        servico ? `Serviço: ${servico}` : null,
        mensagem ? `\nMensagem:\n${mensagem}` : null,
      ].filter(Boolean)

      const texto = linhas.join("\n")

      // 1) WhatsApp (abre nova aba)
      const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(texto)}`
      window.open(waUrl, "_blank", "noopener,noreferrer")

      // 2) Email automatico (sem depender do email do cliente): FormSubmit (serverless)
      // Docs: https://formsubmit.co/
      // Observacao: na primeira vez, o FormSubmit manda um email para CONFIRMAR o endereco.
      const endpoint = `https://formsubmit.co/ajax/${encodeURIComponent(EMAIL_TO)}`

      const fd = new FormData()
      fd.append("Nome", nome)
      fd.append("Email", email)
      fd.append("WhatsApp", whats)
      fd.append("Segmento", segmento)
      fd.append("Servico", servico)
      fd.append("Mensagem", mensagem)
      fd.append("_subject", "Novo contato pelo site")
      fd.append("_captcha", "false")
      fd.append("_template", "table")

      fetch(endpoint, {
        method: "POST",
        body: fd,
        headers: { Accept: "application/json" },
      })
        .then(async (r) => {
          if (!r.ok) throw new Error("Falha ao enviar")
          feedback.textContent =
            "Mensagem preparada no WhatsApp e enviada por email. Se o WhatsApp não abriu, verifique o bloqueador de pop-ups."
          form.reset()
        })
        .catch(() => {
          feedback.textContent =
            "WhatsApp aberto. Nao consegui enviar o email automatico agora (bloqueio de rede ou email nao confirmado no FormSubmit)."
        })
    })
  }
})()
