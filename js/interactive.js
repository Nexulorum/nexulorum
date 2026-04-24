//for the background

(() => {
  const zone = document.getElementById("webdevInteractiveZone");
  const canvas = document.getElementById("webdevCircuitCanvas");
  if (!zone || !canvas) return;

  const ctx = canvas.getContext("2d");
  let dpr = Math.min(window.devicePixelRatio || 1, 2);

  let width = 0;
  let height = 0;

  let mouse = {
    x: 0,
    y: 0,
    inside: false,
    lastSpawnX: 0,
    lastSpawnY: 0
  };

  const nodes = [];
  const traces = [];
  const pulses = [];

  const config = {
    spawnDistance: 34,
    nodeLife: 850,
    traceLife: 1100,
    pulseLife: 650,
    minSeg: 20,
    maxSeg: 52,
    maxBranchCount: 3,
    lineWidth: 1.4,
    nodeRadius: 2.2,
    auraRadius: 16
  };

  function resizeCanvas() {
    const rect = zone.getBoundingClientRect();
    width = Math.max(1, rect.width);
    height = Math.max(1, zone.scrollHeight);

    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  }

  function distance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function addNode(x, y) {
    const now = performance.now();

    nodes.push({
      x,
      y,
      born: now,
      life: config.nodeLife
    });

    pulses.push({
      x,
      y,
      born: now,
      life: config.pulseLife
    });

    const branchCount = Math.floor(rand(1, config.maxBranchCount + 1));

    for (let i = 0; i < branchCount; i++) {
      addTrace(x, y);
    }
  }

  function addTrace(x, y) {
    const now = performance.now();

    const primaryDir = pick(["right", "left", "up", "down"]);
    const firstLen = rand(config.minSeg, config.maxSeg);

    let x2 = x;
    let y2 = y;

    if (primaryDir === "right") x2 += firstLen;
    if (primaryDir === "left") x2 -= firstLen;
    if (primaryDir === "down") y2 += firstLen;
    if (primaryDir === "up") y2 -= firstLen;

    x2 = clamp(x2, 8, width - 8);
    y2 = clamp(y2, 8, height - 8);

    const turn = Math.random() > 0.45;

    if (!turn) {
      traces.push({
        points: [{ x, y }, { x: x2, y: y2 }],
        born: now,
        life: config.traceLife
      });
      return;
    }

    const secondDirOptions =
      primaryDir === "left" || primaryDir === "right"
        ? ["up", "down"]
        : ["left", "right"];

    const secondDir = pick(secondDirOptions);
    const secondLen = rand(config.minSeg * 0.7, config.maxSeg * 0.95);

    let x3 = x2;
    let y3 = y2;

    if (secondDir === "right") x3 += secondLen;
    if (secondDir === "left") x3 -= secondLen;
    if (secondDir === "down") y3 += secondLen;
    if (secondDir === "up") y3 -= secondLen;

    x3 = clamp(x3, 8, width - 8);
    y3 = clamp(y3, 8, height - 8);

    traces.push({
      points: [{ x, y }, { x: x2, y: y2 }, { x: x3, y: y3 }],
      born: now,
      life: config.traceLife
    });

    if (Math.random() > 0.55) {
      nodes.push({
        x: x2,
        y: y2,
        born: now + 70,
        life: config.nodeLife * 0.8
      });
    }
  }

  function maybeSpawn(x, y) {
    if (!mouse.inside) return;

    const d = distance(x, y, mouse.lastSpawnX, mouse.lastSpawnY);
    if (d < config.spawnDistance) return;

    mouse.lastSpawnX = x;
    mouse.lastSpawnY = y;
    addNode(x, y);
  }

  function drawTrace(trace, now) {
    const age = now - trace.born;
    if (age >= trace.life) return false;

    const t = age / trace.life;
    const alpha = 1 - t;

    ctx.save();
    ctx.lineWidth = config.lineWidth;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    ctx.strokeStyle = `rgba(136, 255, 110, ${0.65 * alpha})`;
    ctx.shadowBlur = 10;
    ctx.shadowColor = `rgba(0, 255, 214, ${0.18 * alpha})`;

    ctx.beginPath();
    ctx.moveTo(trace.points[0].x, trace.points[0].y);

    for (let i = 1; i < trace.points.length; i++) {
      ctx.lineTo(trace.points[i].x, trace.points[i].y);
    }

    ctx.stroke();
    ctx.restore();

    const end = trace.points[trace.points.length - 1];
    ctx.beginPath();
    ctx.fillStyle = `rgba(235,255,255, ${0.22 * alpha})`;
    ctx.arc(end.x, end.y, 1.2, 0, Math.PI * 2);
    ctx.fill();

    return true;
  }

  function drawNode(node, now) {
    const age = now - node.born;
    if (age < 0 || age >= node.life) return false;

    const t = age / node.life;
    const alpha = 1 - t;

    ctx.beginPath();
    ctx.fillStyle = `rgba(140, 255, 120, ${0.85 * alpha})`;
    ctx.arc(node.x, node.y, config.nodeRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.fillStyle = `rgba(0, 255, 214, ${0.16 * alpha})`;
    ctx.arc(node.x, node.y, config.auraRadius * (0.55 + t * 0.35), 0, Math.PI * 2);
    ctx.fill();

    return true;
  }

  function drawPulse(pulse, now) {
    const age = now - pulse.born;
    if (age >= pulse.life) return false;

    const t = age / pulse.life;
    const alpha = 1 - t;

    ctx.beginPath();
    ctx.strokeStyle = `rgba(255,255,255, ${0.22 * alpha})`;
    ctx.lineWidth = 1;
    ctx.arc(pulse.x, pulse.y, 4 + t * 14, 0, Math.PI * 2);
    ctx.stroke();

    return true;
  }

  function render(now) {
    ctx.clearRect(0, 0, width, height);

    for (let i = traces.length - 1; i >= 0; i--) {
      if (!drawTrace(traces[i], now)) traces.splice(i, 1);
    }

    for (let i = nodes.length - 1; i >= 0; i--) {
      if (!drawNode(nodes[i], now)) nodes.splice(i, 1);
    }

    for (let i = pulses.length - 1; i >= 0; i--) {
      if (!drawPulse(pulses[i], now)) pulses.splice(i, 1);
    }

    requestAnimationFrame(render);
  }

  function handleMove(event) {
    const rect = zone.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top + zone.scrollTop;

    mouse.x = x;
    mouse.y = y;
    mouse.inside = true;

    maybeSpawn(x, y);
  }

  zone.addEventListener("mouseenter", (event) => {
    const rect = zone.getBoundingClientRect();
    mouse.inside = true;
    mouse.lastSpawnX = event.clientX - rect.left;
    mouse.lastSpawnY = event.clientY - rect.top + zone.scrollTop;
    addNode(mouse.lastSpawnX, mouse.lastSpawnY);
  });

  zone.addEventListener("mousemove", handleMove);

  zone.addEventListener("mouseleave", () => {
    mouse.inside = false;
  });

  window.addEventListener("resize", () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    resizeCanvas();
  });

  const resizeObserver = new ResizeObserver(() => resizeCanvas());
  resizeObserver.observe(zone);

  resizeCanvas();
  requestAnimationFrame(render);
})();