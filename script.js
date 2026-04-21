const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(pointer: fine)").matches;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function initWebGLBackdrop() {
  if (reduceMotion) {
    return;
  }

  const canvas = document.getElementById("fx-canvas");
  if (!canvas) {
    return;
  }

  const gl = canvas.getContext("webgl", {
    alpha: true,
    antialias: false,
    premultipliedAlpha: false,
    preserveDrawingBuffer: false,
  });

  if (!gl) {
    document.body.classList.add("no-webgl");
    return;
  }

  const vertexSource = `
    attribute vec2 a_position;
    void main() {
      gl_Position = vec4(a_position, 0.0, 1.0);
    }
  `;

  const fragmentSource = `
    precision mediump float;
    uniform vec2 u_resolution;
    uniform float u_time;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(
        mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
        mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
        u.y
      );
    }

    float fbm(vec2 p) {
      float value = 0.0;
      float amp = 0.5;
      mat2 matrix = mat2(1.6, 1.2, -1.2, 1.6);
      for (int i = 0; i < 5; i++) {
        value += amp * noise(p);
        p = matrix * p;
        amp *= 0.5;
      }
      return value;
    }

    void main() {
      vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);
      float t = u_time * 0.08;

      float n1 = fbm(p * 1.6 + vec2(t, -t * 0.7));
      float n2 = fbm(p * 2.8 - vec2(t * 1.2, t * 0.4));
      float beam = smoothstep(0.45, -0.2, abs(p.y + (n1 - 0.5) * 0.35));
      float halo = smoothstep(1.2, 0.1, length(p - vec2(0.2 * sin(t * 1.4), 0.1 * cos(t))));

      vec3 base = vec3(0.06, 0.08, 0.10);
      vec3 copper = vec3(0.79, 0.47, 0.30);
      vec3 cyan = vec3(0.32, 0.76, 0.74);

      vec3 color = mix(base, copper, beam * 0.6 + n1 * 0.25);
      color = mix(color, cyan, halo * 0.45 + n2 * 0.2);
      color += 0.04 * sin(vec3(1.0, 1.7, 2.4) * (u_time * 0.2 + p.xyx * 5.0));

      gl_FragColor = vec4(color, 0.74);
    }
  `;

  function compileShader(type, source) {
    const shader = gl.createShader(type);
    if (!shader) {
      return null;
    }

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      gl.deleteShader(shader);
      return null;
    }

    return shader;
  }

  const vertexShader = compileShader(gl.VERTEX_SHADER, vertexSource);
  const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fragmentSource);

  if (!vertexShader || !fragmentShader) {
    document.body.classList.add("no-webgl");
    return;
  }

  const program = gl.createProgram();
  if (!program) {
    document.body.classList.add("no-webgl");
    return;
  }

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    document.body.classList.add("no-webgl");
    return;
  }

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
    gl.STATIC_DRAW
  );

  const position = gl.getAttribLocation(program, "a_position");
  const resolution = gl.getUniformLocation(program, "u_resolution");
  const time = gl.getUniformLocation(program, "u_time");

  function resize() {
    const scale = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.floor(window.innerWidth * scale);
    const height = Math.floor(window.innerHeight * scale);

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
    }
  }

  resize();
  window.addEventListener("resize", resize);

  let rafId = 0;

  function render(now) {
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    if (resolution) {
      gl.uniform2f(resolution, canvas.width, canvas.height);
    }

    if (time) {
      gl.uniform1f(time, now * 0.001);
    }

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    rafId = window.requestAnimationFrame(render);
  }

  rafId = window.requestAnimationFrame(render);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      window.cancelAnimationFrame(rafId);
      rafId = 0;
    } else if (!rafId) {
      rafId = window.requestAnimationFrame(render);
    }
  });
}

function initReveal() {
  const revealItems = Array.from(document.querySelectorAll("[data-reveal]"));

  if (reduceMotion) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  revealItems.forEach((item, index) => {
    item.style.transitionDelay = `${Math.min(index * 35, 420)}ms`;
  });

  const observer = new IntersectionObserver(
    (entries, io) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: "0px 0px -10% 0px",
    }
  );

  revealItems.forEach((item) => observer.observe(item));
}

function initCountUp() {
  const stats = Array.from(document.querySelectorAll("[data-count]"));

  function animateCount(node) {
    const target = Number(node.getAttribute("data-count"));
    if (!Number.isFinite(target)) {
      return;
    }

    const startTime = performance.now();
    const duration = 1700;

    function step(now) {
      const progress = clamp((now - startTime) / duration, 0, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      node.textContent = String(Math.round(target * eased));

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    }

    window.requestAnimationFrame(step);
  }

  const observer = new IntersectionObserver(
    (entries, io) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.65 }
  );

  stats.forEach((item) => observer.observe(item));
}

function initHeroParallax() {
  const scene = document.getElementById("scene");
  if (!scene || !finePointer || reduceMotion) {
    return;
  }

  scene.style.transition = "transform 160ms ease-out";

  function move(event) {
    const rect = scene.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    scene.style.transform = `rotateX(${(-y * 16).toFixed(2)}deg) rotateY(${(x * 18).toFixed(2)}deg)`;
  }

  function reset() {
    scene.style.transform = "rotateX(0deg) rotateY(0deg)";
  }

  scene.addEventListener("pointermove", move);
  scene.addEventListener("pointerleave", reset);
}

function initTilt() {
  if (!finePointer || reduceMotion) {
    return;
  }

  const cards = Array.from(document.querySelectorAll(".tilt"));

  cards.forEach((card) => {
    function onMove(event) {
      const rect = card.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width;
      const py = (event.clientY - rect.top) / rect.height;

      const ry = (px - 0.5) * 13;
      const rx = (0.5 - py) * 12;

      card.style.setProperty("--rx", `${rx.toFixed(2)}deg`);
      card.style.setProperty("--ry", `${ry.toFixed(2)}deg`);
    }

    function reset() {
      card.style.setProperty("--rx", "0deg");
      card.style.setProperty("--ry", "0deg");
    }

    card.addEventListener("pointermove", onMove);
    card.addEventListener("pointerleave", reset);
  });
}

function initMagnetic() {
  if (!finePointer || reduceMotion) {
    return;
  }

  const magnetic = Array.from(document.querySelectorAll(".magnetic"));

  magnetic.forEach((item) => {
    function onMove(event) {
      const rect = item.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width - 0.5) * 12;
      const y = ((event.clientY - rect.top) / rect.height - 0.5) * 12;
      item.style.setProperty("--mx", `${x.toFixed(2)}px`);
      item.style.setProperty("--my", `${y.toFixed(2)}px`);
    }

    function reset() {
      item.style.setProperty("--mx", "0px");
      item.style.setProperty("--my", "0px");
    }

    item.addEventListener("pointermove", onMove);
    item.addEventListener("pointerleave", reset);
  });
}

function initSmoothAnchors() {
  const links = Array.from(document.querySelectorAll('a[href^="#"]'));

  links.forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");
      if (!targetId || targetId.length < 2) {
        return;
      }

      const target = document.querySelector(targetId);
      if (!target) {
        return;
      }

      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

function initCursor() {
  if (!finePointer || reduceMotion) {
    return;
  }

  const dot = document.querySelector(".cursor--dot");
  const ring = document.querySelector(".cursor--ring");
  if (!dot || !ring) {
    return;
  }

  let targetX = window.innerWidth * 0.5;
  let targetY = window.innerHeight * 0.5;
  let dotX = targetX;
  let dotY = targetY;
  let ringX = targetX;
  let ringY = targetY;

  document.body.classList.add("cursor-active");

  window.addEventListener("pointermove", (event) => {
    targetX = event.clientX;
    targetY = event.clientY;
  });

  const interactive = Array.from(
    document.querySelectorAll("a, button, .tilt, input, label, textarea, select")
  );

  interactive.forEach((node) => {
    node.addEventListener("pointerenter", () => document.body.classList.add("cursor-hover"));
    node.addEventListener("pointerleave", () => document.body.classList.remove("cursor-hover"));
  });

  function animate() {
    dotX += (targetX - dotX) * 0.45;
    dotY += (targetY - dotY) * 0.45;
    ringX += (targetX - ringX) * 0.18;
    ringY += (targetY - ringY) * 0.18;
    const ringScale = document.body.classList.contains("cursor-hover") ? 1.7 : 1;

    dot.style.transform = `translate3d(${dotX}px, ${dotY}px, 0)`;
    ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) scale(${ringScale})`;

    window.requestAnimationFrame(animate);
  }

  window.requestAnimationFrame(animate);
}

function initReservationForm() {
  const form = document.getElementById("reserve-form");
  const note = document.getElementById("form-note");
  const dateInput = form?.querySelector("input[type='date']");

  if (!form || !note) {
    return;
  }

  if (dateInput) {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    dateInput.min = `${yyyy}-${mm}-${dd}`;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    note.textContent = "Reservation request received. Loft team will contact you shortly.";
    form.reset();
  });
}

window.addEventListener("DOMContentLoaded", () => {
  initWebGLBackdrop();
  initReveal();
  initCountUp();
  initHeroParallax();
  initTilt();
  initMagnetic();
  initSmoothAnchors();
  initCursor();
  initReservationForm();
});
