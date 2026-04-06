document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.nav__toggle');
  const links = document.querySelector('[data-nav-links]');

  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const isOpen = links.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });

    links.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        links.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Subtle hero particle grid (lightweight, no libraries)
  const canvas = document.getElementById('fx');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  let w = 0, h = 0;
  const dots = [];
  const DOTS = 80;

  function resize() {
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = Math.floor(w * DPR);
    canvas.height = Math.floor(h * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function init() {
    dots.length = 0;
    for (let i = 0; i < DOTS; i++) {
      dots.push({
        x: rand(0, w),
        y: rand(0, h),
        vx: rand(-0.12, 0.12),
        vy: rand(-0.10, 0.10),
        r: rand(1.0, 2.2),
        a: rand(0.35, 0.85)
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);

    // grid lines
    ctx.globalAlpha = 0.20;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    const step = 90;

    for (let x = 0; x < w; x += step) {
      ctx.beginPath();
      ctx.moveTo(x + 0.5, 0);
      ctx.lineTo(x + 0.5, h);
      ctx.stroke();
    }

    for (let y = 0; y < h; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y + 0.5);
      ctx.lineTo(w, y + 0.5);
      ctx.stroke();
    }

    // dot motion
    for (const d of dots) {
      d.x += d.vx;
      d.y += d.vy;
      if (d.x < -20) d.x = w + 20;
      if (d.x > w + 20) d.x = -20;
      if (d.y < -20) d.y = h + 20;
      if (d.y > h + 20) d.y = -20;
    }

    // connections
    for (let i = 0; i < dots.length; i++) {
      for (let j = i + 1; j < dots.length; j++) {
        const a = dots[i], b = dots[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.hypot(dx, dy);

        if (dist < 170) {
          ctx.globalAlpha = 0.18 * (1 - dist / 200);
          ctx.strokeStyle = '#00ffa8';
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    // dots
    for (const d of dots) {
      ctx.globalAlpha = d.a;
      ctx.fillStyle = '#00f0ff';

      ctx.shadowBlur = 8;
      ctx.shadowColor = '#00f0ff';
      
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fill();

      ctx.shadowBlur = 0;
    }

    requestAnimationFrame(draw);
  }

  const onResize = () => {
    resize();
    init();
  };

  window.addEventListener('resize', onResize, { passive: true });

  resize();
  init();
  draw();
});