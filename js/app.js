/* ============================================================
   MHP — « Le Registre »
   Lenis smooth · GSAP ScrollTrigger · Spine · Waypoints
   ============================================================ */

(function(){
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── 1. Lenis smooth scroll ─────────────────────── */
  let lenis = null;
  if (!prefersReduced && window.Lenis) {
    lenis = new Lenis({
      duration: 1.15,
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    if (window.ScrollTrigger) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(t => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    }
  }

  /* ── 2. Fermer menu ─────────────────────────────── */
  const closeMenu = () => {
    const m = document.getElementById('menu');
    m?.classList.remove('is-open');
    m?.setAttribute('aria-hidden','true');
    if (lenis) lenis.start();
  };

  /* ── 3. Anchor links ────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const t = document.querySelector(id);
      if (!t) return;
      e.preventDefault();
      closeMenu();
      if (lenis) lenis.scrollTo(t, { offset: -80, duration: 1.4 });
      else t.scrollIntoView({ behavior:'smooth' });
    });
  });

  /* ── 4. Menu mobile ─────────────────────────────── */
  document.getElementById('burger')?.addEventListener('click', () => {
    const m = document.getElementById('menu');
    m?.classList.add('is-open');
    m?.setAttribute('aria-hidden','false');
    if (lenis) lenis.stop();
  });
  document.getElementById('menuClose')?.addEventListener('click', closeMenu);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

  /* ── 5. Header solid au scroll ──────────────────── */
  const head = document.getElementById('siteHead');
  window.addEventListener('scroll', () => {
    head?.classList.toggle('is-solid', window.scrollY > 40);
  }, { passive:true });

  /* ── 6. Année ───────────────────────────────────── */
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  /* ── 7. GSAP animations ─────────────────────────── */
  window.addEventListener('load', () => {
    if (!window.gsap || !window.ScrollTrigger || prefersReduced) {
      document.querySelectorAll('.hero__title .line>span').forEach(s => s.style.transform = 'none');
      const spineLine = document.getElementById('spineLine');
      if (spineLine) spineLine.style.strokeDashoffset = 0;
      return;
    }
    gsap.registerPlugin(ScrollTrigger);
    initAnimations();
    if (document.fonts) document.fonts.ready.then(() => ScrollTrigger.refresh());
  });

  function initAnimations(){

    /* — Hero reveal — */
    gsap.to('.hero__title .line>span', {
      y: 0, duration: 1.2, stagger: .1, ease: 'expo.out', delay: .2,
    });
    gsap.from('.kicker', { opacity: 0, y: 12, duration: .9, delay: .1 });
    gsap.from('.hero__lead', { opacity: 0, y: 20, duration: 1, delay: .7, ease: 'expo.out' });
    gsap.from('.hero__meta .meta-block', { opacity: 0, y: 12, duration: .8, stagger: .08, delay: .5 });
    gsap.from('.hero__index-list li', { opacity: 0, x: 12, duration: .7, stagger: .05, delay: .6 });

    /* — Spine : trait qui se dessine — */
    const spineLine = document.getElementById('spineLine');
    if (spineLine) {
      gsap.to(spineLine, {
        strokeDashoffset: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: document.body,
          start: 'top top',
          end: 'bottom bottom',
          scrub: .5,
        },
      });
    }

    /* — Waypoints : activation — */
    document.querySelectorAll('.station').forEach(station => {
      const wp = station.querySelector('[data-wp]');
      if (!wp) return;
      ScrollTrigger.create({
        trigger: station,
        start: 'top 50%',
        end: 'bottom 50%',
        onToggle: self => {
          wp.classList.toggle('is-active', self.isActive);
        },
      });
    });

    /* — Nav active — */
    const navLinks = document.querySelectorAll('.head__nav a');
    navLinks.forEach(link => {
      const id = link.getAttribute('href');
      const target = id && document.querySelector(id);
      if (!target) return;
      ScrollTrigger.create({
        trigger: target,
        start: 'top 40%',
        end: 'bottom 40%',
        onToggle: self => {
          if (self.isActive) {
            navLinks.forEach(l => l.classList.remove('is-active'));
            link.classList.add('is-active');
          }
        },
      });
    });

    /* — Page counter — */
    const pageCounter = document.getElementById('pageCounter');
    document.querySelectorAll('.station[data-page]').forEach(station => {
      const num = station.dataset.page;
      ScrollTrigger.create({
        trigger: station,
        start: 'top 50%',
        end: 'bottom 50%',
        onToggle: self => {
          if (self.isActive && pageCounter) {
            pageCounter.textContent = `FEUILLET ${num} / 08`;
          }
        },
      });
    });

    /* — Reveals des stations — */
    document.querySelectorAll('.station').forEach(station => {
      const left = station.querySelector('.station__left');
      const body = station.querySelector('.station__body');
      if (left) {
        gsap.from(left.children, {
          opacity: 0, y: 24, duration: .9, stagger: .1, ease: 'expo.out',
          scrollTrigger: { trigger: left, start: 'top 85%', once: true },
        });
      }
      if (body) {
        gsap.from(body, {
          opacity: 0, y: 30, duration: 1, ease: 'expo.out',
          scrollTrigger: { trigger: body, start: 'top 85%', once: true },
        });
      }
    });

    /* — Listes : stagger — */
    gsap.utils.toArray('.sector-list li, .service-row, .protocol li').forEach(el => {
      gsap.from(el, {
        opacity: 0, x: -16, duration: .8, ease: 'expo.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      });
    });

    /* — Manifesto cards — */
    gsap.from('.m-card', {
      opacity: 0, y: 24, duration: .9, stagger: .12, ease: 'expo.out',
      scrollTrigger: { trigger: '.manifesto-cards', start: 'top 85%', once: true },
    });

    /* — Route SVG : tracé progressif — */
    const routePath = document.getElementById('routePath');
    if (routePath) {
      const len = routePath.getTotalLength();
      gsap.set(routePath, { strokeDasharray: len, strokeDashoffset: len });
      gsap.to(routePath, {
        strokeDashoffset: 0,
        duration: 2,
        ease: 'power2.inOut',
        scrollTrigger: {
          trigger: '.route',
          start: 'top 70%',
          toggleActions: 'play none none none',
        },
      });
      gsap.from('.route__dot', {
        scale: 0, transformOrigin: 'center',
        duration: .6, stagger: .5, delay: .8,
        ease: 'back.out(1.6)',
        scrollTrigger: { trigger: '.route', start: 'top 70%' },
      });
    }

    /* — Valeurs : certificats en cascade — */
    gsap.from('.value-cert', {
      opacity: 0, y: 40,
      duration: .9, stagger: .1, ease: 'expo.out',
      scrollTrigger: { trigger: '.values-grid', start: 'top 82%', once: true },
    });

    /* — Sceaux : entrée en rotation douce (finissent droits) — */
    gsap.from('.value-cert__seal', {
      opacity: 0,
      scale: .6,
      rotation: -20,
      duration: .8,
      stagger: .1,
      delay: .35,
      ease: 'back.out(1.4)',
      clearProps: 'rotation',
      scrollTrigger: { trigger: '.values-grid', start: 'top 82%', once: true },
    });

    /* — Slip contact — */
    gsap.from('.slip', {
      opacity: 0, y: 30, duration: 1, ease: 'expo.out',
      scrollTrigger: { trigger: '.slip', start: 'top 85%', once: true },
    });

    /* — Footer — */
    gsap.from('.signature__brand, .signature__cols > *, .signature__bottom', {
      opacity: 0, y: 20, duration: .9, stagger: .1, ease: 'expo.out',
      scrollTrigger: { trigger: '.signature', start: 'top 85%', once: true },
    });
  }

    /* ── 8. Formulaire (Sauvegarde locale) ───────────── */
  const form = document.getElementById('contactForm');
  form?.addEventListener('submit', e => {
    e.preventDefault();
    const data = new FormData(form);
    const payload = Object.fromEntries(data.entries());
    const required = ['name','email','msg'];
    const missing = required.filter(k => !String(payload[k] || '').trim());
    
    if (missing.length) {
      missing.forEach(k => {
        const el = form.querySelector(`[name="${k}"]`);
        el?.focus();
      });
      return;
    }

    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.innerHTML = '<span>Envoi…</span>';

    // --- NOUVEAU : Sauvegarde dans le localStorage ---
    const newMessage = {
      id: Date.now(),
      name: payload.name,
      email: payload.email,
      org: payload.org || 'Non spécifié',
      sector: payload.sector || 'Non spécifié',
      msg: payload.msg,
      date: new Date().toISOString(),
      read: false // Par défaut, le message est non lu
    };

    const existingMessages = JSON.parse(localStorage.getItem('mhp_messages') || '[]');
    existingMessages.push(newMessage);
    localStorage.setItem('mhp_messages', JSON.stringify(existingMessages));
    // ------------------------------------------------

    setTimeout(() => {
      form.innerHTML = `
        <div class="done">
          <strong>Merci ${payload.name.split(' ')[0]} — demande enregistrée.</strong>
          <p>Nous revenons vers vous sous 48h ouvrées à l'adresse <em>${payload.email}</em>.</p>
          <div style="margin-top:16px">
            <a href="admin.html" class="mono" style="color:var(--gold);text-decoration:underline;">Accéder au tableau de bord (Admin) &rarr;</a>
          </div>
        </div>
      `;
    }, 900);
  });
    /* ── 9. Custom Select Dropdown (Fermeture auto) ──────────────────── */
  const customSelect = document.getElementById('sectorSelect');
  
  if (customSelect) {
    const trigger = customSelect.querySelector('.custom-select__trigger');
    const options = customSelect.querySelectorAll('.custom-select__option');
    const label = customSelect.querySelector('.custom-select__label');
    const hiddenInput = document.getElementById('sectorInput');

    // 1. Ouvrir / Fermer le menu en cliquant sur le bouton
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      customSelect.classList.toggle('is-open');
    });

    // 2. Sélectionner une option
    options.forEach(option => {
      option.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation(); // Évite que le clic ferme le menu de force avant la sélection
        
        const value = option.getAttribute('data-value');
        const text = option.textContent;
        
        // Mettre à jour le texte et la valeur
        label.textContent = text;
        hiddenInput.value = value;
        
        // Gérer les styles de sélection
        options.forEach(o => o.classList.remove('is-selected'));
        option.classList.add('is-selected');
        
        // 3. FERMETURE AUTOMATIQUE ICI
        customSelect.classList.remove('is-open');
        
        // Bonus : on redonne le focus au bouton pour l'accessibilité
        trigger.focus();
      });
    });

    // 4. Fermer le menu si on clique n'importe où ailleurs sur la page
    document.addEventListener('click', (e) => {
      if (!customSelect.contains(e.target)) {
        customSelect.classList.remove('is-open');
      }
    });
  }

})();