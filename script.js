function formatDate() {
  const chip = document.getElementById("dateChip");
  if (!chip) return;
  chip.textContent = new Date().toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function setupActiveNav() {
  const page = document.body.dataset.page;
  const links = document.querySelectorAll(".menu a");
  links.forEach((link) => {
    if (link.dataset.nav === page) {
      link.classList.add("active");
    }
  });
}

function setupSidebar() {
  const sidebar = document.getElementById("sidebar");
  const toggle = document.getElementById("menuToggle");
  if (!sidebar || !toggle) return;

  toggle.addEventListener("click", () => {
    sidebar.classList.toggle("open");
  });

  window.addEventListener("click", (event) => {
    if (window.innerWidth > 1060) return;
    const target = event.target;
    const isInsideSidebar = sidebar.contains(target);
    const isToggle = toggle.contains(target);
    if (!isInsideSidebar && !isToggle) {
      sidebar.classList.remove("open");
    }
  });
}

function setupPageTransitions() {
  const links = document.querySelectorAll(".menu a");
  links.forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");
      if (!href) return;
      event.preventDefault();
      document.activeElement?.blur();
      document.body.classList.add("page-leave");
      setTimeout(() => {
        window.location.href = href;
      }, 220);
    });
  });
}

function setupInsightsPanel() {
  const panelToggle = document.getElementById("panelToggle");
  const expandBtn = document.getElementById("expandInsights");
  const secondary = document.getElementById("secondaryInsights");

  if (panelToggle) {
    panelToggle.addEventListener("click", () => {
      document.body.classList.toggle("panel-collapsed");
      const icon = panelToggle.querySelector("i");
      if (icon) icon.classList.toggle("fa-rotate-180");
    });
  }

  if (expandBtn && secondary) {
    expandBtn.addEventListener("click", () => {
      const isHidden = secondary.hasAttribute("hidden");
      if (isHidden) {
        secondary.removeAttribute("hidden");
      } else {
        secondary.setAttribute("hidden", "");
      }
      const isOpen = !secondary.hasAttribute("hidden");
      expandBtn.setAttribute("aria-expanded", String(isOpen));
      expandBtn.innerHTML = isOpen
        ? '<i class="fa-solid fa-layer-group"></i> Hide Extra Insights'
        : '<i class="fa-solid fa-layer-group"></i> Show More Insights';
    });
  }
}

function localSimulation(input) {
  const text = input.toLowerCase();
  if (text.includes("study")) {
    return {
      type: "productivity",
      title: "High Productivity Outcome",
      detail: "Your scenario indicates deep work momentum and stronger execution confidence.",
      recommendation: "Keep focused study blocks in your first cognitive peak window.",
      tone: "green"
    };
  }

  if (text.includes("rest")) {
    return {
      type: "recovery",
      title: "Recovery Benefit Outcome",
      detail: "Your scenario improves cognitive recovery and lowers burnout probability.",
      recommendation: "Pair rest windows with one strategic task to maintain progress.",
      tone: "blue"
    };
  }

  return {
    type: "balanced",
    title: "Balanced Outcome",
    detail: "This scenario balances output and energy with moderate growth potential.",
    recommendation: "Clarify one key priority to raise decision confidence.",
    tone: "red"
  };
}

async function requestSimulation(input) {
  try {
    const response = await fetch("/simulate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scenario: input })
    });

    if (!response.ok) {
      throw new Error("Simulation API failed");
    }

    return await response.json();
  } catch (error) {
    return localSimulation(input);
  }
}

function toneClass(tone) {
  if (tone === "green") return "pill-green";
  if (tone === "red") return "pill-red";
  return "pill-blue";
}

function pushHistory(historyId, scenario, resultTitle) {
  if (!historyId) return;
  const history = document.getElementById(historyId);
  if (!history) return;

  const item = document.createElement("li");
  const shortScenario = scenario.length > 46 ? `${scenario.slice(0, 46)}...` : scenario;
  item.innerHTML = `<span class="task-dot task-blue"></span>${shortScenario}<span class="priority low">${resultTitle}</span>`;
  history.prepend(item);

  while (history.children.length > 5) {
    history.removeChild(history.lastElementChild);
  }
}

function setupSimulators() {
  const forms = document.querySelectorAll(".simulator-form");
  forms.forEach((form) => {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const textArea = form.querySelector("textarea[name='scenario']");
      if (!textArea) return;

      const scenario = textArea.value.trim();
      if (!scenario) {
        textArea.focus();
        return;
      }

      const outputId = form.dataset.output;
      const output = outputId ? document.getElementById(outputId) : null;
      const submit = form.querySelector("button[type='submit']");

      if (submit) {
        submit.disabled = true;
        submit.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Simulating';
      }

      const result = await requestSimulation(scenario);

      if (output) {
        const pill = toneClass(result.tone || "blue");
        output.innerHTML = `
          <span class="pill ${pill}">${result.title || "Simulation Result"}</span>
          <p>${result.detail || "No detail provided."}</p>
          <p class="insights-copy">${result.recommendation || "No recommendation provided."}</p>
        `;
      }

      pushHistory(form.dataset.history, scenario, result.type || "Result");

      if (submit) {
        submit.disabled = false;
        submit.innerHTML = '<i class="fa-solid fa-play"></i> Simulate Outcome';
      }
    });
  });
}

function drawPerformanceChart() {
  const canvas = document.getElementById("performanceChart");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const parent = canvas.parentElement;
  if (!ctx || !parent) return;

  const width = parent.clientWidth;
  const height = parent.clientHeight;
  const dpr = window.devicePixelRatio || 1;

  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const data = [42, 56, 53, 67, 74, 86, 81];
  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const pad = { top: 16, right: 16, bottom: 30, left: 16 };
  const chartW = width - pad.left - pad.right;
  const chartH = height - pad.top - pad.bottom;

  ctx.clearRect(0, 0, width, height);

  for (let i = 0; i <= 4; i += 1) {
    const y = pad.top + (chartH / 4) * i;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(width - pad.right, y);
    ctx.strokeStyle = "rgba(204, 221, 255, 0.12)";
    ctx.stroke();
  }

  const points = data.map((value, index) => ({
    x: pad.left + (chartW / (data.length - 1)) * index,
    y: pad.top + chartH - (value / 100) * chartH
  }));

  const area = ctx.createLinearGradient(0, pad.top, 0, height - pad.bottom);
  area.addColorStop(0, "rgba(76, 201, 255, 0.35)");
  area.addColorStop(1, "rgba(76, 201, 255, 0.02)");

  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i += 1) {
    const prev = points[i - 1];
    const curr = points[i];
    const cpX = (prev.x + curr.x) / 2;
    ctx.bezierCurveTo(cpX, prev.y, cpX, curr.y, curr.x, curr.y);
  }
  ctx.lineTo(points[points.length - 1].x, height - pad.bottom);
  ctx.lineTo(points[0].x, height - pad.bottom);
  ctx.closePath();
  ctx.fillStyle = area;
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i += 1) {
    const prev = points[i - 1];
    const curr = points[i];
    const cpX = (prev.x + curr.x) / 2;
    ctx.bezierCurveTo(cpX, prev.y, cpX, curr.y, curr.x, curr.y);
  }
  ctx.strokeStyle = "#4cc9ff";
  ctx.lineWidth = 2.8;
  ctx.stroke();

  points.forEach((point, index) => {
    ctx.beginPath();
    ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = "#eef6ff";
    ctx.fill();
    ctx.strokeStyle = "rgba(76, 201, 255, 0.65)";
    ctx.stroke();

    ctx.fillStyle = "rgba(210, 226, 255, 0.9)";
    ctx.font = "12px Manrope";
    ctx.textAlign = "center";
    ctx.fillText(labels[index], point.x, height - 10);
  });
}

function setupFocusTimer() {
  const timerEl = document.getElementById("focusTimer");
  const timerRing = document.getElementById("timerRing");
  const start = document.getElementById("startFocus");
  const pause = document.getElementById("pauseFocus");
  const reset = document.getElementById("resetFocus");
  if (!timerEl || !start || !pause || !reset) return;

  const fullDuration = 25 * 60;
  let remaining = fullDuration;
  let intervalId = null;

  const render = () => {
    const minutes = String(Math.floor(remaining / 60)).padStart(2, "0");
    const seconds = String(remaining % 60).padStart(2, "0");
    timerEl.textContent = `${minutes}:${seconds}`;

    if (timerRing) {
      const progress = Math.max(remaining / fullDuration, 0);
      timerRing.style.setProperty("--timer-progress", String(progress));
    }
  };

  start.addEventListener("click", () => {
    if (intervalId) return;
    intervalId = setInterval(() => {
      if (remaining <= 0) {
        clearInterval(intervalId);
        intervalId = null;
        return;
      }
      remaining -= 1;
      render();
    }, 1000);
  });

  pause.addEventListener("click", () => {
    clearInterval(intervalId);
    intervalId = null;
  });

  reset.addEventListener("click", () => {
    clearInterval(intervalId);
    intervalId = null;
    remaining = fullDuration;
    render();
  });

  render();
}

function setupCardTilt() {
  const cards = document.querySelectorAll(".shell-raise");
  cards.forEach((card) => {
    card.addEventListener("mousemove", (event) => {
      if (window.innerWidth < 1060) return;
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const rotateY = ((x / rect.width) - 0.5) * 8;
      const rotateX = (0.5 - (y / rect.height)) * 6;
      card.style.transform = `translateZ(10px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "translateZ(0) rotateX(0) rotateY(0)";
    });
  });
}

function setupGsapAnimations() {
  if (typeof window.gsap === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.querySelectorAll(".animate-in").forEach((el) => {
      el.style.opacity = "1";
      el.style.transform = "none";
    });
    return;
  }

  window.gsap.to(".animate-in", {
    y: 0,
    opacity: 1,
    rotateX: 0,
    duration: 0.85,
    stagger: 0.1,
    ease: "power3.out"
  });
}

function setupThreeBackground() {
  if (typeof window.THREE === "undefined") return;
  if (window.innerWidth < 760) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const container = document.getElementById("sceneBackground");
  if (!container) return;

  const THREE = window.THREE;
  const page = document.body.dataset.page || "dashboard";
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 0, 18);

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  const lightA = new THREE.PointLight(0x4cc9ff, 2.3, 120);
  lightA.position.set(8, 6, 20);
  scene.add(lightA);

  const lightB = new THREE.PointLight(0x8f7dff, 2.1, 120);
  lightB.position.set(-10, -6, 16);
  scene.add(lightB);

  const lightC = new THREE.PointLight(0x41f0c5, 1.4, 100);
  lightC.position.set(0, -10, 14);
  scene.add(lightC);

  const ambient = new THREE.AmbientLight(0x8fb5ff, 0.5);
  scene.add(ambient);

  const root = new THREE.Group();
  scene.add(root);

  const animatedUpdaters = [];
  const addUpdater = (fn) => animatedUpdaters.push(fn);

  const makeStarfield = (count, color, spread) => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      positions[i * 3] = (Math.random() - 0.5) * spread;
      positions[i * 3 + 1] = (Math.random() - 0.5) * spread * 0.75;
      positions[i * 3 + 2] = (Math.random() - 0.5) * spread;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      color,
      size: 0.08,
      transparent: true,
      opacity: 0.55,
      depthWrite: false
    });
    return new THREE.Points(geometry, material);
  };

  const makeDashboardScene = () => {
    const group = new THREE.Group();
    const geometry = new THREE.IcosahedronGeometry(1.1, 0);
    const baseMaterial = new THREE.MeshStandardMaterial({
      color: 0x4cc9ff,
      roughness: 0.25,
      metalness: 0.65,
      transparent: true,
      opacity: 0.62,
      emissive: 0x0a1d36,
      emissiveIntensity: 0.7
    });

    for (let i = 0; i < 24; i += 1) {
      const mesh = new THREE.Mesh(geometry, baseMaterial.clone());
      mesh.position.set((Math.random() - 0.5) * 26, (Math.random() - 0.5) * 20, (Math.random() - 0.5) * 18);
      mesh.scale.setScalar(0.25 + Math.random() * 0.6);
      group.add(mesh);
    }

    const stars = makeStarfield(260, 0x8fb5ff, 42);
    root.add(stars);
    root.add(group);

    addUpdater((time, pointer) => {
      group.rotation.y += 0.0018;
      group.rotation.x += 0.001;
      group.position.x += (pointer.x * 1.25 - group.position.x) * 0.02;
      group.position.y += (-pointer.y * 1.0 - group.position.y) * 0.02;
      stars.rotation.y -= 0.0003;
      stars.rotation.x = Math.sin(time * 0.00018) * 0.06;
    });
  };

  const makeInsightsScene = () => {
    const group = new THREE.Group();
    const torusGeo = new THREE.TorusGeometry(4, 0.18, 16, 120);
    const torusGeo2 = new THREE.TorusGeometry(5.9, 0.14, 16, 120);
    const torusGeo3 = new THREE.TorusGeometry(3.1, 0.12, 16, 120);

    const ringA = new THREE.Mesh(torusGeo, new THREE.MeshStandardMaterial({ color: 0x4cc9ff, metalness: 0.55, roughness: 0.25 }));
    const ringB = new THREE.Mesh(torusGeo2, new THREE.MeshStandardMaterial({ color: 0x8f7dff, metalness: 0.58, roughness: 0.22 }));
    const ringC = new THREE.Mesh(torusGeo3, new THREE.MeshStandardMaterial({ color: 0x41f0c5, metalness: 0.52, roughness: 0.2 }));

    ringA.rotation.x = 1.15;
    ringB.rotation.y = 1.2;
    ringC.rotation.z = 0.9;
    group.add(ringA, ringB, ringC);

    const stars = makeStarfield(180, 0x4cc9ff, 36);
    stars.position.z = -3;
    root.add(stars);
    root.add(group);

    addUpdater((time, pointer) => {
      ringA.rotation.z += 0.0032;
      ringB.rotation.x -= 0.0024;
      ringC.rotation.y += 0.003;
      group.rotation.y += (pointer.x * 0.28 - group.rotation.y) * 0.04;
      group.rotation.x += (-pointer.y * 0.2 - group.rotation.x) * 0.04;
      group.position.y = Math.sin(time * 0.001) * 0.35;
      stars.rotation.z += 0.0005;
    });
  };

  const makeFocusScene = () => {
    camera.position.set(0, 0.5, 17);

    const group = new THREE.Group();
    const core = new THREE.Mesh(
      new THREE.SphereGeometry(1.3, 32, 32),
      new THREE.MeshStandardMaterial({
        color: 0x41f0c5,
        metalness: 0.32,
        roughness: 0.18,
        emissive: 0x0f3a31,
        emissiveIntensity: 1.1,
        transparent: true,
        opacity: 0.82
      })
    );

    const orbitA = new THREE.Mesh(
      new THREE.TorusGeometry(3.2, 0.09, 16, 128),
      new THREE.MeshStandardMaterial({ color: 0x4cc9ff, metalness: 0.45, roughness: 0.24, transparent: true, opacity: 0.75 })
    );
    orbitA.rotation.x = 1.2;

    const orbitB = new THREE.Mesh(
      new THREE.TorusGeometry(4.4, 0.08, 16, 128),
      new THREE.MeshStandardMaterial({ color: 0x8f7dff, metalness: 0.4, roughness: 0.2, transparent: true, opacity: 0.62 })
    );
    orbitB.rotation.y = 1.1;

    group.add(core, orbitA, orbitB);
    const stars = makeStarfield(200, 0x41f0c5, 34);
    root.add(stars);
    root.add(group);

    addUpdater((time, pointer) => {
      const pulse = 1 + Math.sin(time * 0.0022) * 0.06;
      core.scale.setScalar(pulse);
      core.material.emissiveIntensity = 0.9 + (pulse - 1) * 5;
      orbitA.rotation.z += 0.002;
      orbitB.rotation.x -= 0.0016;
      group.position.x += (pointer.x * 0.45 - group.position.x) * 0.03;
      group.position.y += (-pointer.y * 0.45 - group.position.y) * 0.03;
      stars.rotation.y += 0.0004;
    });
  };

  const makeSimulatorScene = () => {
    const group = new THREE.Group();
    const nodes = [];
    const nodeCount = 18;
    const bounds = 9.5;

    for (let i = 0; i < nodeCount; i += 1) {
      const node = new THREE.Mesh(
        new THREE.SphereGeometry(0.21 + Math.random() * 0.12, 16, 16),
        new THREE.MeshStandardMaterial({
          color: i % 3 === 0 ? 0x4cc9ff : i % 3 === 1 ? 0x8f7dff : 0x41f0c5,
          emissive: 0x102747,
          emissiveIntensity: 0.8,
          metalness: 0.55,
          roughness: 0.25
        })
      );
      node.position.set(
        (Math.random() - 0.5) * bounds * 2,
        (Math.random() - 0.5) * bounds * 1.45,
        (Math.random() - 0.5) * bounds
      );
      node.userData.velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 0.008,
        (Math.random() - 0.5) * 0.006,
        (Math.random() - 0.5) * 0.004
      );
      nodes.push(node);
      group.add(node);
    }

    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x4cc9ff,
      transparent: true,
      opacity: 0.28
    });

    const linePoints = [];
    for (let i = 0; i < nodes.length - 1; i += 1) {
      linePoints.push(nodes[i].position, nodes[i + 1].position);
    }
    const lineGeometry = new THREE.BufferGeometry().setFromPoints(linePoints);
    const lines = new THREE.LineSegments(lineGeometry, lineMaterial);

    const stars = makeStarfield(140, 0x8f7dff, 36);
    root.add(stars);
    root.add(group);
    root.add(lines);

    addUpdater((time, pointer) => {
      const limitX = bounds;
      const limitY = bounds * 0.72;
      const limitZ = bounds * 0.7;

      nodes.forEach((node) => {
        node.position.add(node.userData.velocity);
        if (Math.abs(node.position.x) > limitX) node.userData.velocity.x *= -1;
        if (Math.abs(node.position.y) > limitY) node.userData.velocity.y *= -1;
        if (Math.abs(node.position.z) > limitZ) node.userData.velocity.z *= -1;
      });

      lineGeometry.setFromPoints(linePoints);
      lineGeometry.attributes.position.needsUpdate = true;
      group.rotation.y += 0.0015;
      group.rotation.x += 0.0008;
      group.position.x += (pointer.x * 0.95 - group.position.x) * 0.025;
      group.position.y += (-pointer.y * 0.8 - group.position.y) * 0.025;
      lines.material.opacity = 0.22 + (Math.sin(time * 0.0016) + 1) * 0.08;
      stars.rotation.y -= 0.0003;
    });
  };

  if (page === "insights") {
    makeInsightsScene();
  } else if (page === "focus") {
    makeFocusScene();
  } else if (page === "simulator") {
    makeSimulatorScene();
  } else {
    makeDashboardScene();
  }

  const pointer = { x: 0, y: 0 };
  const handlePointer = (event) => {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = (event.clientY / window.innerHeight) * 2 - 1;
  };
  window.addEventListener("mousemove", handlePointer);

  let rafId = null;
  const animate = (time = 0) => {
    animatedUpdaters.forEach((update) => update(time, pointer));
    renderer.render(scene, camera);
    rafId = window.requestAnimationFrame(animate);
  };

  animate();

  const handleResize = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  };

  window.addEventListener("resize", handleResize);

  window.addEventListener("beforeunload", () => {
    if (rafId) window.cancelAnimationFrame(rafId);
    window.removeEventListener("mousemove", handlePointer);
    window.removeEventListener("resize", handleResize);
    scene.traverse((obj) => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) {
          obj.material.forEach((mat) => mat.dispose());
        } else {
          obj.material.dispose();
        }
      }
    });
    renderer.dispose();
  });
}

function init() {
  formatDate();
  setupActiveNav();
  setupSidebar();
  setupPageTransitions();
  setupInsightsPanel();
  setupSimulators();
  drawPerformanceChart();
  setupFocusTimer();
  setupCardTilt();
  setupGsapAnimations();
  setupThreeBackground();
  window.addEventListener("resize", drawPerformanceChart);
}

document.addEventListener("DOMContentLoaded", init);
