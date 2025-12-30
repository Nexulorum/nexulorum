(() => {
  // Mobile menu
  const toggle = document.querySelector('.nav__toggle');
  const links = document.querySelector('[data-nav-links]');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const isOpen = links.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });

    links.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        links.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }
  //Nav accessibility + ESC close + click outside + focus trap-lite

  (() => {
    const toggle = document.querySelector('.nav__toggle');
    const links = document.querySelector('[data-nav-links]');
    if (!toggle || !links) return;

    const focusableSelector =
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

    const getFocusable = () => Array.from(links.querySelectorAll(focusableSelector));
    const setExpanded = (open) => {
      toggle.setAttribute('aria-expanded', String(open));
      links.classList.toggle('is-open', open);
      document.documentElement.classList.toggle('nav-open', open);
      document.body.classList.toggle('nav-open', open);
    };

    const isOpen = () => links.classList.contains('is-open');

    const openMenu = () => {
      if (isOpen()) return;
      setExpanded(true);

      // Focus first link for keyboard users
      const focusables = getFocusable();
      if (focusables.length) focusables[0].focus({ preventScroll: true });
    };

    const closeMenu = () => {
      if (!isOpen()) return;
      setExpanded(false);
      toggle.focus({ preventScroll: true });
    };

    toggle.addEventListener('click', () => {
      isOpen() ? closeMenu() : openMenu();
    });

    // Close when clicking a link
    links.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', closeMenu);
    });

    // Close on ESC, and add basic focus trapping while open
    document.addEventListener('keydown', (e) => {
      if (!isOpen()) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        closeMenu();
        return;
      }

      if (e.key === 'Tab') {
        const focusables = getFocusable();
        if (!focusables.length) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement;

        // If shift-tabbing from first, wrap to last. If tabbing from last, wrap to first.
        if (e.shiftKey && active === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });

    // Close when clicking outside the nav
    document.addEventListener('click', (e) => {
      if (!isOpen()) return;
      const target = e.target;
      const clickedInsideNav = links.contains(target) || toggle.contains(target);
      if (!clickedInsideNav) closeMenu();
    });

    // Close if viewport resized up (optional safety)
    window.addEventListener('resize', () => {
      if (!isOpen()) return;
      // If your desktop layout shows links normally above some breakpoint,
      // you can close the overlay on resize.
      closeMenu();
    });
  })();


  // Subtle hero particle grid (lightweight, no libraries)
  const canvas = document.getElementById('fx');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  let w = 0, h = 0;
  const dots = [];
  const DOTS = 80;

  function resize(){
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = Math.floor(w * DPR);
    canvas.height = Math.floor(h * DPR);
    ctx.setTransform(DPR,0,0,DPR,0,0);
  }

  function rand(min, max){ return Math.random() * (max - min) + min; }

  function init(){
    dots.length = 0;
    for (let i=0;i<DOTS;i++){
      dots.push({
        x: rand(0, w),
        y: rand(0, h),
        vx: rand(-0.12, 0.12),
        vy: rand(-0.10, 0.10),
        r: rand(1.0, 2.2),
        a: rand(0.18, 0.60)
      });
    }
  }

  function draw(){
    ctx.clearRect(0,0,w,h);

    // grid lines
    ctx.globalAlpha = 0.20;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    const step = 90;
    for (let x=0; x<w; x+=step){
      ctx.beginPath();
      ctx.moveTo(x+0.5, 0);
      ctx.lineTo(x+0.5, h);
      ctx.stroke();
    }
    for (let y=0; y<h; y+=step){
      ctx.beginPath();
      ctx.moveTo(0, y+0.5);
      ctx.lineTo(w, y+0.5);
      ctx.stroke();
    }

    // dot motion
    for (const d of dots){
      d.x += d.vx;
      d.y += d.vy;
      if (d.x < -20) d.x = w + 20;
      if (d.x > w + 20) d.x = -20;
      if (d.y < -20) d.y = h + 20;
      if (d.y > h + 20) d.y = -20;
    }

    // connections
    for (let i=0;i<dots.length;i++){
      for (let j=i+1;j<dots.length;j++){
        const a = dots[i], b = dots[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 170){
          ctx.globalAlpha = 0.10 * (1 - dist/170);
          ctx.strokeStyle = '#00ffa8';
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    // dots
    for (const d of dots){
      ctx.globalAlpha = d.a;
      ctx.fillStyle = '#00d9ff';
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI*2);
      ctx.fill();
    }

    requestAnimationFrame(draw);
  }

  const onResize = () => { resize(); init(); };
  window.addEventListener('resize', onResize, {passive:true});

  resize();
  init();
  draw();

  // Nexulorum Standard tabs
  const tabs = document.querySelectorAll('.standard__tab');
  const panes = document.querySelectorAll('.standard__pane');
  tabs.forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-tab');
      tabs.forEach(t => {
        const active = t === btn;
        t.classList.toggle('is-active', active);
        t.setAttribute('aria-selected', String(active));
      });
      panes.forEach(p => p.classList.toggle('is-active', p.getAttribute('data-pane') === key));
    });
  });

  // Estimator
  const form = document.getElementById('estimatorForm');
  const outTier = document.getElementById('estTier');
  const outRange = document.getElementById('estRange');
  const outNote = document.getElementById('estNote');

  function recommend(type, pages, feats){
    let tier = 'Basic Website Package';
    let range = '$499–$999';
    let note = 'Best fit for clean, premium informational sites.';

    const featScore = feats.length;

    if (type === 'landing'){
      tier = 'Landing Page';
      range = '$299–$699';
      note = 'Perfect for ads, promos, and fast conversion pages.';
      return {tier, range, note};
    }

    if (type === 'ecom' || feats.includes('products')){
      tier = 'E-Commerce';
      range = '$1499–$2000';
      note = 'Store structure + checkout foundations, built to scale.';
      return {tier, range, note};
    }

    if (type === 'business' || featScore >= 2 || pages >= 6){
      tier = 'Business Upgrade';
      range = '$999–$1499';
      note = 'Ideal for listings, calendars, newsletters, and richer structure.';
    }

    if (pages >= 10 || featScore >= 4){
      note = 'This looks like a larger scope. We’ll confirm requirements in discovery.';
    }

    return {tier, range, note};
  }

  
  function postEstimatorLog(payload){
    const body = new URLSearchParams(payload).toString();
    fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body
    }).catch(() => {});
  }

  function applyEstimatorToIntake(data){
    const typeMap = {
      basic: "Basic Website (3–5 pages)",
      business: "Business Upgrade (listings / calendar / newsletter)",
      ecom: "E-Commerce (products + checkout)",
      landing: "Landing Page (single page)"
    };
    const pagesMap = {
      "1": "1 (Landing Page)",
      "3": "2–3 pages",
      "5": "4–5 pages",
      "8": "6–10 pages",
      "12": "10+ pages"
    };

    const intakeType = document.getElementById("intakeSiteType");
    if (intakeType && data.type && typeMap[data.type]) intakeType.value = typeMap[data.type];

    const intakePages = document.getElementById("intakePages");
    if (intakePages && data.pages && pagesMap[data.pages]) intakePages.value = pagesMap[data.pages];

    if (Array.isArray(data.features)) {
      document.querySelectorAll(".intakeFeat").forEach(cb => {
        cb.checked = data.features.includes(cb.value);
      });
    }
  }

  (function wireEstimatorContinue(){
    const btn = document.getElementById("estContinue");
    if (!btn) return;

    btn.addEventListener("click", () => {
      const type = document.getElementById("estType")?.value || "";
      const pages = document.getElementById("estPages")?.value || "";
      const features = Array.from(document.querySelectorAll(".estFeat:checked")).map(x => x.value);

      const estSelection = { type, pages, features };
      localStorage.setItem("nex_estimator_selection", JSON.stringify(estSelection));

      // Apply immediately (so it’s filled when they arrive)
      if (typeof applyEstimatorToIntake === "function") {
        applyEstimatorToIntake(estSelection);
      }
    });
  })();

  // Fill intake from prior estimator selection (no server required)
  (function fillIntakeFromEstimator(){
    const raw = localStorage.getItem("nex_estimator_selection");
    if (!raw) return;
    try {
      const data = JSON.parse(raw);
      applyEstimatorToIntake(data);
    } catch(e){}
  })();

  if (form){
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const type = document.getElementById('estType').value;
      const pagesVal = document.getElementById('estPages').value;
      const pages = parseInt(pagesVal, 10) || 0;
      const feats = Array.from(document.querySelectorAll('.estFeat:checked')).map(x => x.value);

      const rec = recommend(type, pages, feats);
      if (outTier) outTier.textContent = rec.tier;
      if (outRange) outRange.textContent = rec.range;
      if (outNote) outNote.textContent = rec.note;

      // Save estimator selections so the intake form can auto-fill (no server)
      const estSelection = { type, pages: pagesVal, features: feats };
      localStorage.setItem("nex_estimator_selection", JSON.stringify(estSelection));
      applyEstimatorToIntake(estSelection);

      // Log the recommendation separately (Netlify hidden form)
      postEstimatorLog({
        "form-name": "estimator-log",
        recommended_tier: rec.tier,
        recommended_range: rec.range,
        type: type,
        pages: pagesVal,
        features: feats.join(", ")
      });
    });
  }

})();