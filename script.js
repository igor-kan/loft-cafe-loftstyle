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

function initThreeStudio() {
  if (reduceMotion || !window.THREE) {
    return;
  }

  const canvas = document.getElementById("three-stage");
  if (!canvas) {
    return;
  }

  const THREE = window.THREE;
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0f1316, 0.28);

  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  camera.position.set(0, 1.2, 5.2);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  if (renderer.outputColorSpace) {
    renderer.outputColorSpace = THREE.SRGBColorSpace;
  }

  const ambient = new THREE.AmbientLight(0xfce6cc, 0.7);
  const key = new THREE.DirectionalLight(0xbbe7e3, 1.15);
  key.position.set(2.8, 3.6, 2.1);
  const warm = new THREE.PointLight(0xd8834a, 1.8, 9, 2);
  warm.position.set(-2.2, 1.2, 1.5);
  scene.add(ambient, key, warm);

  const rig = new THREE.Group();
  scene.add(rig);

  const cupMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xe8ddce,
    roughness: 0.28,
    metalness: 0.12,
    clearcoat: 0.54,
    clearcoatRoughness: 0.22,
  });
  const ceramicDark = new THREE.MeshStandardMaterial({ color: 0x1b2328, roughness: 0.6 });
  const liquidMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x3a2215,
    roughness: 0.28,
    metalness: 0.18,
    transmission: 0.06,
    thickness: 0.7,
  });

  const cupProfile = [
    new THREE.Vector2(0.42, -0.95),
    new THREE.Vector2(0.46, -0.82),
    new THREE.Vector2(0.5, -0.5),
    new THREE.Vector2(0.54, -0.12),
    new THREE.Vector2(0.58, 0.25),
    new THREE.Vector2(0.62, 0.65),
    new THREE.Vector2(0.65, 0.84),
  ];

  const cup = new THREE.Mesh(new THREE.LatheGeometry(cupProfile, 64), cupMaterial);
  cup.position.y = -0.04;
  rig.add(cup);

  const cupInner = new THREE.Mesh(new THREE.CylinderGeometry(0.56, 0.48, 1.34, 48, 1, true), ceramicDark);
  cupInner.position.y = -0.04;
  rig.add(cupInner);

  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.08, 24, 64, Math.PI * 1.55), cupMaterial);
  handle.rotation.z = Math.PI / 2;
  handle.position.set(0.71, 0.14, 0.02);
  rig.add(handle);

  const saucer = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 0.98, 0.15, 64), cupMaterial);
  saucer.position.y = -1.02;
  rig.add(saucer);

  const liquid = new THREE.Mesh(new THREE.CylinderGeometry(0.54, 0.48, 0.11, 42), liquidMaterial);
  liquid.position.y = 0.59;
  rig.add(liquid);

  const beanGroup = new THREE.Group();
  const beanGeometry = new THREE.SphereGeometry(0.09, 16, 16);
  const beanMaterial = new THREE.MeshStandardMaterial({
    color: 0x4b2a1a,
    roughness: 0.74,
    metalness: 0.08,
  });

  for (let i = 0; i < 80; i += 1) {
    const bean = new THREE.Mesh(beanGeometry, beanMaterial);
    bean.userData = {
      phase: Math.random() * Math.PI * 2,
      radius: 1.08 + Math.random() * 0.84,
      speed: 0.54 + Math.random() * 0.78,
      wobble: 0.04 + Math.random() * 0.1,
    };
    beanGroup.add(bean);
  }

  beanGroup.position.y = -0.14;
  rig.add(beanGroup);

  const steamCount = 220;
  const steamPositions = new Float32Array(steamCount * 3);
  const steamGeometry = new THREE.BufferGeometry();
  steamGeometry.setAttribute("position", new THREE.BufferAttribute(steamPositions, 3));

  const steamMaterial = new THREE.PointsMaterial({
    color: 0xc0f7ef,
    size: 0.04,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.5,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const steam = new THREE.Points(steamGeometry, steamMaterial);
  steam.position.y = 0.55;
  rig.add(steam);

  let pointerX = 0;
  let pointerY = 0;

  function updatePointer(event) {
    const rect = canvas.getBoundingClientRect();
    pointerX = ((event.clientX - rect.left) / rect.width - 0.5) * 1.45;
    pointerY = ((event.clientY - rect.top) / rect.height - 0.5) * 1.1;
  }

  canvas.addEventListener("pointermove", updatePointer);
  canvas.addEventListener("pointerleave", () => {
    pointerX = 0;
    pointerY = 0;
  });

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(1, Math.floor(rect.width));
    const height = Math.max(1, Math.floor(rect.height));

    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  resize();
  window.addEventListener("resize", resize);

  let rafId = 0;
  let isVisible = true;

  const observer = new IntersectionObserver(
    (entries) => {
      if (!entries.length) {
        return;
      }

      isVisible = entries[0].isIntersecting;
      if (isVisible && !rafId) {
        rafId = window.requestAnimationFrame(render);
      }
    },
    { threshold: 0.12 }
  );

  observer.observe(canvas);

  function render(now) {
    if (!isVisible || document.hidden) {
      rafId = 0;
      return;
    }

    const t = now * 0.001;

    rig.rotation.y += (pointerX - rig.rotation.y) * 0.028;
    rig.rotation.x += (-pointerY - rig.rotation.x) * 0.03;
    rig.position.y = Math.sin(t * 1.1) * 0.07;

    liquid.position.y = 0.59 + Math.sin(t * 3.2) * 0.012;

    for (let i = 0; i < beanGroup.children.length; i += 1) {
      const bean = beanGroup.children[i];
      const { phase, radius, speed, wobble } = bean.userData;
      const angle = phase + t * speed;
      const orbitalRadius = radius + Math.sin(t * 1.9 + phase) * wobble;

      bean.position.set(
        Math.cos(angle) * orbitalRadius,
        -0.34 + Math.sin(t * 2.3 + phase) * 0.12,
        Math.sin(angle) * orbitalRadius
      );

      const s = 0.72 + (Math.sin(t * 3.6 + phase) + 1) * 0.24;
      bean.scale.setScalar(s);
      bean.rotation.x = angle;
      bean.rotation.y = angle * 0.6;
    }

    const pos = steamGeometry.attributes.position.array;
    for (let i = 0; i < steamCount; i += 1) {
      const base = i * 3;
      const layer = i / steamCount;
      const swirl = t * 1.2 + layer * 14.0;
      const radius = 0.09 + layer * 0.42 + Math.sin(t * 1.4 + layer * 22.0) * 0.03;
      pos[base] = Math.cos(swirl + layer * 4.0) * radius;
      pos[base + 1] = layer * 2.0 + Math.sin(t * 2.2 + layer * 16.0) * 0.05;
      pos[base + 2] = Math.sin(swirl) * radius;
    }

    steamGeometry.attributes.position.needsUpdate = true;

    camera.position.x = Math.sin(t * 0.2) * 0.15;
    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);

    rafId = window.requestAnimationFrame(render);
  }

  rafId = window.requestAnimationFrame(render);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      window.cancelAnimationFrame(rafId);
      rafId = 0;
    } else if (isVisible && !rafId) {
      rafId = window.requestAnimationFrame(render);
    }
  });
}

function initBeanFlowSimulation() {
  if (reduceMotion) {
    return;
  }

  const canvas = document.getElementById("bean-flow");
  if (!canvas) {
    return;
  }

  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) {
    return;
  }

  let width = 0;
  let height = 0;
  let dpr = 1;
  let particles = [];

  const pointer = {
    x: 0,
    y: 0,
    active: false,
  };

  const count = finePointer ? 260 : 170;

  canvas.addEventListener("pointermove", (event) => {
    const rect = canvas.getBoundingClientRect();
    pointer.x = (event.clientX - rect.left) * dpr;
    pointer.y = (event.clientY - rect.top) * dpr;
    pointer.active = true;
  });

  canvas.addEventListener("pointerleave", () => {
    pointer.active = false;
  });

  function wrapParticle(particle) {
    if (particle.x < 0) particle.x += width;
    if (particle.x > width) particle.x -= width;
    if (particle.y < 0) particle.y += height;
    if (particle.y > height) particle.y -= height;
  }

  function createParticle() {
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      hueShift: Math.random() * Math.PI * 2,
      size: 0.8 + Math.random() * 1.4,
    };
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = Math.max(1, Math.floor(canvas.clientWidth * dpr));
    height = Math.max(1, Math.floor(canvas.clientHeight * dpr));

    canvas.width = width;
    canvas.height = height;

    particles = new Array(count).fill(null).map(createParticle);
    ctx.fillStyle = "#0f1519";
    ctx.fillRect(0, 0, width, height);
  }

  resize();
  window.addEventListener("resize", resize);

  function render() {
    const t = performance.now() * 0.001;

    ctx.fillStyle = "rgba(9, 13, 16, 0.11)";
    ctx.fillRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i += 1) {
      const p = particles[i];
      const nx = (p.x / width - 0.5) * 2.0;
      const ny = (p.y / height - 0.5) * 2.0;

      const wave =
        Math.sin(nx * 7.0 + t * 1.1 + p.hueShift) +
        Math.cos(ny * 9.0 - t * 1.2 - p.hueShift * 0.8);

      p.vx += Math.cos(wave + t * 0.5) * 0.055;
      p.vy += Math.sin(wave - t * 0.4) * 0.055;

      if (pointer.active) {
        const dx = p.x - pointer.x;
        const dy = p.y - pointer.y;
        const distSq = dx * dx + dy * dy + 0.0001;
        const influence = clamp(16000 / distSq, 0, 1.5);

        p.vx += (-dy / Math.sqrt(distSq)) * influence * 0.16;
        p.vy += (dx / Math.sqrt(distSq)) * influence * 0.16;
      }

      p.vx *= 0.965;
      p.vy *= 0.965;
      p.x += p.vx;
      p.y += p.vy;
      wrapParticle(p);

      const heat = Math.sin(t * 1.5 + p.hueShift) * 0.5 + 0.5;
      const r = Math.floor(164 + heat * 54);
      const g = Math.floor(98 + heat * 96);
      const b = Math.floor(68 + (1 - heat) * 95);

      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.68)`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * dpr, 0, Math.PI * 2);
      ctx.fill();
    }

    window.requestAnimationFrame(render);
  }

  window.requestAnimationFrame(render);
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
  initThreeStudio();
  initBeanFlowSimulation();
  initReveal();
  initCountUp();
  initHeroParallax();
  initTilt();
  initMagnetic();
  initSmoothAnchors();
  initCursor();
  initReservationForm();
});
