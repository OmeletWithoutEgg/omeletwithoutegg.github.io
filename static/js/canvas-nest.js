function createMovingPoints({ canvas, config = {} }) {
  if (!canvas || !(canvas instanceof HTMLCanvasElement)) {
    throw new Error("must provide a valid <canvas> element.");
  }

  const {
    zIndex = -1,
    opacity = 0.5,
    color = "0,0,0",
    count = 99,
  } = config;

  const ctx = canvas.getContext("2d");
  const mouse = { x: null, y: null };
  let intervalId = null;

  canvas.style.zIndex = zIndex;
  canvas.style.opacity = opacity;
  canvas.style.position = canvas.style.position || "fixed";
  canvas.style.top = canvas.style.top || "0";
  canvas.style.left = canvas.style.left || "0";
  canvas.style.pointerEvents = "none";

  function setCanvasSize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  setCanvasSize();

  const points = Array.from({ length: count }, () => {
    const theta = Math.random() * 2 * Math.PI;
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: 1.5 * Math.cos(theta),
      vy: 1.5 * Math.sin(theta),
    };
  });

  function getDist(a, b) {
    return (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
  }

  function updatePositions() {
    for (const p of points) {
      if (mouse.x != null && mouse.y != null) {
        const d = getDist(p, mouse);
        if (d >= 10500 && d < 20000) {
          p.x += p.vx;
          p.y += p.vy;
          p.x -= 0.03 * (p.x - mouse.x);
          p.y -= 0.03 * (p.y - mouse.y);
        } else if (d >= 10000 && d < 10500) {
          let angle = Math.atan2(p.y - mouse.y, p.x - mouse.x) + 0.01;
          const r = Math.sqrt(d);
          p.x = mouse.x + r * Math.cos(angle);
          p.y = mouse.y + r * Math.sin(angle);
          const t = Math.random() * Math.PI * 2;
          p.vx = Math.cos(t);
          p.vy = Math.sin(t);
        } else {
          p.x += p.vx;
          p.y += p.vy;
        }
      } else {
        p.x += p.vx;
        p.y += p.vy;
      }

      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
    }
  }

  function draw() {
    const buckets = Array.from({ length: 32 }, () => []);
    points.sort((a, b) => a.x - b.x || a.y - b.y);

    for (let i = 0; i < points.length; i++) {
      let cnt = 0;
      for (let j = i - 1; j >= 0; j--) {
        const a = points[i], b = points[j];
        const dist = getDist(a, b);
        const d = 1 - dist / 6000;
        if (d > 0) {
          buckets[Math.floor(d * 32)].push([a, b]);
          cnt++;
        }
        if (a.x - b.x > 80 || cnt > 5) break;
      }
    }

    for (const p of points) {
      const d = 1 - getDist(p, mouse) / 20000;
      if (d > 0) {
        buckets[Math.floor(d * 32)].push([p, mouse]);
      }
    }

    for (let i = 0; i < 32; i++) {
      ctx.lineWidth = (i / 32) * 2;
      ctx.strokeStyle = `rgba(${color},${i / 32 + 0.2})`;
      ctx.beginPath();
      for (const [a, b] of buckets[i]) {
        ctx.moveTo(Math.floor(a.x), Math.floor(a.y));
        ctx.lineTo(Math.floor(b.x), Math.floor(b.y));
      }
      ctx.stroke();
    }
  }

  function redraw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    updatePositions();
    draw();
  }

  window.addEventListener("resize", setCanvasSize);
  window.addEventListener("mousemove", e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
  window.addEventListener("mouseout", () => {
    mouse.x = null;
    mouse.y = null;
  });

  return {
    startAnimation() {
      if (intervalId === null) {
        intervalId = setInterval(redraw, 1000 / 30);
      }
    },
    stopAnimation() {
      clearInterval(intervalId);
      intervalId = null;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    },
  };
}
