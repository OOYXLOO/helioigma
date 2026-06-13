(() => {
  const canvas = document.querySelector("#game");
  const ctx = canvas.getContext("2d");
  const levelLabel = document.querySelector("#levelLabel");
  const scoreLabel = document.querySelector("#scoreLabel");
  const bestLabel = document.querySelector("#bestLabel");
  const shiftLabel = document.querySelector("#shiftLabel");
  const timeLabel = document.querySelector("#timeLabel");
  const statusLine = document.querySelector("#statusLine");
  const startButton = document.querySelector("#startButton");
  const resetButton = document.querySelector("#resetButton");
  const hintButton = document.querySelector("#hintButton");
  const demoButton = document.querySelector("#demoButton");
  const phaseTrack = document.querySelector("#phaseTrack");
  const dayMeter = document.querySelector("#dayMeter");
  const dayMeterLabel = document.querySelector("#dayMeterLabel");
  const dayMeterFill = document.querySelector("#dayMeterFill");
  const nodeButtons = document.querySelector("#nodeButtons");
  const proofPanel = document.querySelector("#proofPanel");
  const proofCode = document.querySelector("#proofCode");
  const proofSummary = document.querySelector("#proofSummary");
  const copyProofButton = document.querySelector("#copyProofButton");
  const tracePanel = document.querySelector("#tracePanel");
  const tracePhase = document.querySelector("#tracePhase");
  const traceMatch = document.querySelector("#traceMatch");
  const traceNext = document.querySelector("#traceNext");
  const traceLast = document.querySelector("#traceLast");

  const glyphs = ["SOL", "XOR", "LUX", "BIN"];
  const palette = ["#f7c948", "#ff7a59", "#8bd3ff", "#b8f2c8"];
  const phaseNames = ["Crib dawn", "XOR meridian", "Carry twilight", "Checksum night"];
  const bestScoreKey = "solstice-cipher-best-score";
  const levels = [
    { target: [0, 2, 1, 3, 0, 1], seconds: 45 },
    { target: [3, 0, 2, 1, 3, 2, 0], seconds: 42 },
    { target: [1, 3, 0, 2, 1, 0, 3, 2], seconds: 38 },
    { target: [2, 1, 3, 0, 2, 3, 1, 0, 1], seconds: 35 },
  ];

  const state = {
    running: false,
    level: 0,
    score: 0,
    bestScore: loadBestScore(),
    timeLeft: levels[0].seconds,
    streak: 0,
    shifts: 0,
    solvedPhases: 0,
    complete: false,
    finalProof: "",
    ring: [],
    target: levels[0].target,
    nodes: [],
    particles: [],
    lastTick: 0,
    demoing: false,
    hintedIndex: -1,
    lastAction: "Awaiting start.",
    message: "Decode the Helioigma rotor before nightfall.",
  };

  function loadBestScore() {
    try {
      return Number(localStorage.getItem(bestScoreKey)) || 0;
    } catch {
      return 0;
    }
  }

  function storeBestScore(score) {
    state.bestScore = Math.max(state.bestScore, score);
    try {
      localStorage.setItem(bestScoreKey, String(state.bestScore));
    } catch {
      // Local storage can be unavailable in privacy-restricted contexts.
    }
  }

  function buildRunProof() {
    const payload = buildReceiptPayload();
    let hash = 2166136261;
    for (const char of payload) {
      hash ^= char.charCodeAt(0);
      hash = Math.imul(hash, 16777619);
    }
    const suffix = (hash >>> 0).toString(36).toUpperCase().padStart(6, "0").slice(0, 6);
    return `SC-${state.solvedPhases}P-${state.score}-${state.shifts}-${suffix}`;
  }

  function buildReceiptPayload() {
    return `solstice|${levels.length}|${state.score}|${state.shifts}|${state.solvedPhases}`;
  }

  function seedLevel(index) {
    const level = levels[index];
    if (!level) {
      state.complete = true;
      state.running = false;
      state.timeLeft = 0;
      storeBestScore(state.score);
      state.finalProof = buildRunProof();
      state.lastAction = "Receipt built from final score and shifts.";
      state.message = `Longest day held. Final score ${state.score} across ${state.shifts} shifts.`;
      updateHud();
      return;
    }
    state.target = level.target.slice();
    state.ring = state.target.map((value, i) => (value + 1 + (i % 3)) % glyphs.length);
    state.timeLeft = level.seconds;
    state.finalProof = "";
    state.hintedIndex = -1;
    state.lastAction = index === 0 ? "Awaiting start." : `${phaseNames[index]} seeded.`;
    state.message = index === 0 ? "Decode the Helioigma rotor before nightfall." : `${phaseNames[index]} unlocked.`;
    updateHud();
  }

  function updateHud() {
    levelLabel.textContent = String(Math.min(state.level + 1, levels.length));
    scoreLabel.textContent = String(state.score);
    bestLabel.textContent = String(state.bestScore);
    shiftLabel.textContent = String(state.shifts);
    timeLabel.textContent = String(Math.max(0, Math.ceil(state.timeLeft)));
    statusLine.textContent = state.message;
    startButton.disabled = state.demoing;
    if (hintButton) {
      hintButton.disabled = !state.running || state.complete || state.demoing;
    }
    demoButton.disabled = state.demoing;
    syncDayMeter();
    syncPhaseTrack();
    syncNodeButtons();
    syncRotorTrace();
    if (proofPanel && proofCode && copyProofButton) {
      proofPanel.hidden = !state.complete;
      proofCode.textContent = state.finalProof;
      if (proofSummary) {
        proofSummary.textContent = state.finalProof
      ? `Receipt loop: ${state.solvedPhases}/${levels.length} phases, ${state.score} score, ${state.shifts} shifts. FNV-1a payload ${buildReceiptPayload()} -> ${state.finalProof.split("-").at(-1)}.`
          : "";
      }
      copyProofButton.disabled = !state.finalProof;
    }
  }

  function syncDayMeter() {
    if (!dayMeter || !dayMeterLabel || !dayMeterFill) return;
    const level = levels[Math.min(state.level, levels.length - 1)];
    const ratio = state.complete ? 1 : Math.max(0, Math.min(1, state.timeLeft / level.seconds));
    dayMeterFill.style.transform = `scaleX(${ratio})`;
    dayMeter.classList.toggle("low", !state.complete && ratio <= 0.25);
    dayMeter.classList.toggle("held", state.complete);
    dayMeterLabel.textContent = state.complete ? "held" : `${Math.max(0, Math.ceil(state.timeLeft))}s`;
  }

  function syncPhaseTrack() {
    if (!phaseTrack) return;
    if (phaseTrack.children.length !== levels.length) {
      phaseTrack.textContent = "";
      phaseNames.forEach((name, index) => {
        const item = document.createElement("li");
        const indexLabel = document.createElement("span");
        const nameLabel = document.createElement("span");
        item.className = "phase-step";
        indexLabel.className = "phase-index";
        nameLabel.className = "phase-name";
        indexLabel.textContent = String(index + 1);
        nameLabel.textContent = name;
        item.append(indexLabel, nameLabel);
        phaseTrack.append(item);
      });
    }
    [...phaseTrack.children].forEach((item, index) => {
      const done = state.solvedPhases > index;
      const active = state.running && state.level === index && !state.complete;
      item.classList.toggle("complete", done);
      item.classList.toggle("active", active);
      if (active) {
        item.setAttribute("aria-current", "step");
      } else {
        item.removeAttribute("aria-current");
      }
    });
  }

  function syncNodeButtons() {
    if (!nodeButtons) return;
    if (nodeButtons.children.length !== state.ring.length) {
      nodeButtons.textContent = "";
      state.ring.forEach((_, index) => {
        const button = document.createElement("button");
        const nodeIndex = document.createElement("span");
        const current = document.createElement("span");
        const target = document.createElement("span");
        button.type = "button";
        button.className = "node-button";
        button.dataset.index = String(index);
        nodeIndex.className = "node-index";
        current.className = "node-current";
        target.className = "node-target";
        button.append(nodeIndex, current, target);
        nodeButtons.append(button);
      });
    }
    [...nodeButtons.children].forEach((button, index) => {
      const value = state.ring[index];
      const targetValue = state.target[index];
      const locked = value === targetValue;
      button.disabled = !state.running || state.complete || state.demoing;
      button.classList.toggle("locked", locked);
      button.classList.toggle("hinted", index === state.hintedIndex && !locked);
      button.setAttribute(
        "aria-label",
        `Rotate node ${index + 1}; current ${glyphs[value]}; target ${glyphs[targetValue]}`
      );
      button.querySelector(".node-index").textContent = String(index + 1);
      button.querySelector(".node-current").textContent = glyphs[value];
      button.querySelector(".node-target").textContent = `target ${glyphs[targetValue]}`;
    });
  }

  function syncRotorTrace() {
    if (!tracePanel || !tracePhase || !traceMatch || !traceNext || !traceLast) return;
    const safeLevel = Math.min(state.level, levels.length - 1);
    const phase = state.complete ? "Receipt" : phaseNames[safeLevel];
    const matched = state.ring.filter((value, i) => value === state.target[i]).length;
    const nextMismatch = state.ring.findIndex((value, i) => value !== state.target[i]);
    tracePhase.textContent = state.complete ? `${levels.length}/${levels.length} phases held` : `${safeLevel + 1} - ${phase}`;
    traceMatch.textContent = `${matched}/${state.target.length}`;
    traceNext.textContent = state.complete
      ? "Receipt ready"
      : nextMismatch === -1
        ? "All nodes aligned"
        : `Node ${nextMismatch + 1}: ${glyphs[state.ring[nextMismatch]]} -> ${glyphs[state.target[nextMismatch]]}`;
    traceLast.textContent = state.lastAction;
  }

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const ratio = Math.max(1, window.devicePixelRatio || 1);
    canvas.width = Math.round(rect.width * ratio);
    canvas.height = Math.round(rect.height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function drawGlyph(x, y, radius, value, label) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = "rgba(255,255,255,0.06)";
    ctx.strokeStyle = palette[value];
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = palette[value];
    ctx.font = `700 ${Math.max(12, radius * 0.38)}px ui-sans-serif, system-ui`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(glyphs[value], 0, 0);

    if (label) {
      ctx.fillStyle = "rgba(247,243,223,0.75)";
      ctx.font = `700 ${Math.max(10, radius * 0.22)}px ui-sans-serif, system-ui`;
      ctx.fillText(label, 0, radius + 18);
    }
    ctx.restore();
  }

  function draw() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    ctx.clearRect(0, 0, w, h);

    const cx = w / 2;
    const topBand = Math.max(92, h * 0.18);
    const cy = topBand + (h - topBand) * 0.52;
    const ringRadius = Math.min(w * 0.32, (h - topBand) * 0.36);
    const nodeRadius = Math.max(22, Math.min(w, h) * 0.05);
    state.nodes = [];

    const levelSeconds = levels[Math.min(state.level, levels.length - 1)].seconds;
    const nightfall = state.complete ? 0 : 1 - Math.max(0, state.timeLeft) / levelSeconds;
    const sky = ctx.createRadialGradient(cx, cy, 10, cx, cy, Math.max(w, h) * 0.72);
    sky.addColorStop(0, `rgba(247,201,72,${0.16 - nightfall * 0.08})`);
    sky.addColorStop(0.46, `rgba(139,211,255,${0.1 - nightfall * 0.03})`);
    sky.addColorStop(1, `rgba(0,0,0,${0.18 + nightfall * 0.22})`);
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,0.045)";
    ctx.strokeStyle = "rgba(255,255,255,0.1)";
    ctx.lineWidth = 1;
    roundRect(ctx, w * 0.08, 18, w * 0.84, topBand - 32, 18);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    ctx.strokeStyle = "rgba(247,243,223,0.22)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, ringRadius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = "rgba(247,243,223,0.84)";
    ctx.font = `700 ${Math.max(14, w * 0.018)}px ui-sans-serif, system-ui`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("HELIOIGMA TARGET ROTOR", cx, Math.max(34, topBand * 0.33));
    ctx.fillStyle = "rgba(174,184,197,0.92)";
    ctx.font = `700 ${Math.max(12, w * 0.014)}px ui-sans-serif, system-ui`;
    ctx.fillText((phaseNames[state.level] || "Solstice receipt").toUpperCase(), cx, Math.max(52, topBand * 0.48));

    const targetGap = Math.min(72, (w * 0.76) / Math.max(1, state.target.length - 1));
    const targetY = Math.max(70, topBand * 0.72);
    const targetStart = cx - ((state.target.length - 1) * targetGap) / 2;
    ctx.save();
    ctx.strokeStyle = "rgba(247,243,223,0.14)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(targetStart, targetY);
    ctx.lineTo(targetStart + (state.target.length - 1) * targetGap, targetY);
    ctx.stroke();
    ctx.restore();
    state.target.forEach((value, i) => {
      drawGlyph(targetStart + i * targetGap, targetY, Math.min(23, nodeRadius * 0.52), value, "");
    });

    state.ring.forEach((value, i) => {
      const angle = -Math.PI / 2 + (Math.PI * 2 * i) / state.ring.length;
      const x = cx + Math.cos(angle) * ringRadius;
      const y = cy + Math.sin(angle) * ringRadius;
      const matched = value === state.target[i];
      const hinted = i === state.hintedIndex && !matched;
      state.nodes.push({ x, y, radius: nodeRadius, index: i });

      ctx.save();
      ctx.strokeStyle = matched ? "rgba(184,242,200,0.55)" : hinted ? "rgba(247,201,72,0.82)" : "rgba(255,255,255,0.09)";
      ctx.lineWidth = matched ? 6 : hinted ? 7 : 3;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.restore();

      if (hinted) {
        ctx.save();
        ctx.strokeStyle = "rgba(247,201,72,0.9)";
        ctx.lineWidth = 3;
        ctx.setLineDash([8, 6]);
        ctx.beginPath();
        ctx.arc(x, y, nodeRadius + 9, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      drawGlyph(x, y, nodeRadius, value, String(i + 1));
    });

    const matched = state.ring.filter((value, i) => value === state.target[i]).length;
    const progress = matched / state.target.length;
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.arc(cx, cy, ringRadius * 0.48, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = progress === 1 ? "#b8f2c8" : "#f7c948";
    ctx.beginPath();
    ctx.arc(cx, cy, ringRadius * 0.48, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progress);
    ctx.stroke();
    ctx.fillStyle = "rgba(247,243,223,0.92)";
    ctx.font = `800 ${Math.max(36, Math.min(w, h) * 0.09)}px ui-sans-serif, system-ui`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`${matched}/${state.target.length}`, cx, cy - 4);
    ctx.font = `700 ${Math.max(12, Math.min(w, h) * 0.022)}px ui-sans-serif, system-ui`;
    ctx.fillStyle = "rgba(174,184,197,0.9)";
    const centerStatus = state.complete ? `${state.solvedPhases}/${levels.length} PHASES` : state.running ? `STREAK ${state.streak}` : "MATCH";
    ctx.fillText(centerStatus, cx, cy + Math.max(34, h * 0.07));
    ctx.font = `600 ${Math.max(11, Math.min(w, h) * 0.018)}px ui-sans-serif, system-ui`;
    ctx.fillStyle = "rgba(174,184,197,0.78)";
    ctx.fillText(`best ${state.bestScore} / ${state.shifts} shifts`, cx, cy + Math.max(54, h * 0.105));
    ctx.restore();

    if (state.complete) {
      drawFinale(cx, cy, ringRadius);
    }

    state.particles.forEach((particle) => {
      ctx.globalAlpha = particle.life;
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    });
  }

  function burst(x, y, color) {
    for (let i = 0; i < 18; i += 1) {
      const angle = (Math.PI * 2 * i) / 18;
      state.particles.push({
        x,
        y,
        vx: Math.cos(angle) * (1.4 + Math.random() * 1.8),
        vy: Math.sin(angle) * (1.4 + Math.random() * 1.8),
        size: 2 + Math.random() * 3,
        life: 0.9,
        color,
      });
    }
  }

  function roundRect(context, x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);
    context.beginPath();
    context.moveTo(x + r, y);
    context.arcTo(x + width, y, x + width, y + height, r);
    context.arcTo(x + width, y + height, x, y + height, r);
    context.arcTo(x, y + height, x, y, r);
    context.arcTo(x, y, x + width, y, r);
    context.closePath();
  }

  function drawFinale(cx, cy, ringRadius) {
    ctx.save();
    ctx.fillStyle = "rgba(7,16,24,0.82)";
    ctx.strokeStyle = "rgba(247,201,72,0.45)";
    ctx.lineWidth = 2;
    roundRect(ctx, cx - ringRadius * 0.88, cy - ringRadius * 0.4, ringRadius * 1.76, ringRadius * 0.88, 18);
    ctx.fill();
    ctx.stroke();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#f7c948";
    ctx.font = `800 ${Math.max(22, ringRadius * 0.14)}px ui-sans-serif, system-ui`;
    ctx.fillText("SOLSTICE HELD", cx, cy - ringRadius * 0.18);
    ctx.fillStyle = "rgba(247,243,223,0.9)";
    ctx.font = `700 ${Math.max(14, ringRadius * 0.075)}px ui-sans-serif, system-ui`;
    ctx.fillText(`Final score ${state.score}`, cx, cy + ringRadius * 0.02);
    ctx.fillStyle = "rgba(174,184,197,0.9)";
    ctx.font = `600 ${Math.max(12, ringRadius * 0.055)}px ui-sans-serif, system-ui`;
    ctx.fillText(`${state.solvedPhases}/${levels.length} phases solved in ${state.shifts} shifts`, cx, cy + ringRadius * 0.16);
    ctx.fillStyle = "rgba(174,184,197,0.78)";
    ctx.font = `600 ${Math.max(11, ringRadius * 0.046)}px ui-sans-serif, system-ui`;
    ctx.fillText(`Receipt ${state.finalProof}`, cx, cy + ringRadius * 0.29);
    ctx.fillText(state.score >= state.bestScore ? "New solstice record." : "Ready for another run.", cx, cy + ringRadius * 0.41);
    ctx.restore();
  }

  function checkWin() {
    if (!state.running) return;
    const complete = state.ring.every((value, i) => value === state.target[i]);
    if (!complete) return;
    state.streak += 1;
    state.solvedPhases += 1;
    const phaseScore = Math.ceil(state.timeLeft * 10) + state.target.length * 25 + state.streak * 50;
    state.score += phaseScore;
    state.level += 1;
    burst(canvas.clientWidth / 2, canvas.clientHeight / 2, "#b8f2c8");
    seedLevel(state.level);
    state.lastAction = `${phaseNames[state.level - 1]} complete: +${phaseScore}.`;
    if (!state.complete) {
      state.message = `${phaseNames[state.level - 1]} complete. +${phaseScore}`;
    }
    updateHud();
  }

  function pointerToCanvas(event) {
    const rect = canvas.getBoundingClientRect();
    const source = event.touches ? event.touches[0] : event;
    return { x: source.clientX - rect.left, y: source.clientY - rect.top };
  }

  function handlePointer(event) {
    event.preventDefault();
    if (!state.running || state.demoing) return;
    const point = pointerToCanvas(event);
    const hit = state.nodes.find((node) => Math.hypot(point.x - node.x, point.y - node.y) <= node.radius * 1.25);
    if (!hit) return;
    rotateNode(hit.index, hit.x, hit.y);
  }

  function rotateNode(index, x = null, y = null) {
    if (!state.running || index < 0 || index >= state.ring.length) return;
    if (state.hintedIndex === index) {
      state.hintedIndex = -1;
    }
    state.shifts += 1;
    state.ring[index] = (state.ring[index] + 1) % glyphs.length;
    const node = state.nodes[index] || {};
    const px = x ?? node.x ?? canvas.clientWidth / 2;
    const py = y ?? node.y ?? canvas.clientHeight / 2;
    const locked = state.ring[index] === state.target[index];
    if (locked) {
      state.score += 5 + state.streak;
    } else {
      state.timeLeft = Math.max(0, state.timeLeft - 0.45);
    }
    burst(px, py, palette[state.ring[index]]);
    state.lastAction = locked
      ? `Node ${index + 1} locked at ${glyphs[state.ring[index]]}.`
      : `Node ${index + 1} shifted to ${glyphs[state.ring[index]]}.`;
    state.message = locked ? `Signal ${index + 1} locked.` : `Phase ${index + 1} shifted.`;
    updateHud();
    checkWin();
    draw();
  }

  function showHint() {
    if (!state.running || state.complete || state.demoing) return;
    const index = state.ring.findIndex((value, i) => value !== state.target[i]);
    if (index === -1) {
      state.hintedIndex = -1;
      state.message = "All visible signals are aligned.";
      updateHud();
      return;
    }
    state.hintedIndex = index;
    state.lastAction = `Hint node ${index + 1}: target ${glyphs[state.target[index]]}.`;
    state.message = `Hint: rotate node ${index + 1} toward ${glyphs[state.target[index]]}.`;
    updateHud();
    draw();
  }

  function tick(time) {
    if (!state.lastTick) state.lastTick = time;
    const delta = Math.min(0.05, (time - state.lastTick) / 1000);
    state.lastTick = time;

    state.particles.forEach((particle) => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += 0.02;
      particle.life -= delta * 1.5;
    });
    state.particles = state.particles.filter((particle) => particle.life > 0);

    if (state.running && !state.demoing) {
      state.timeLeft -= delta;
      if (state.timeLeft <= 0) {
        state.running = false;
        state.streak = 0;
        state.timeLeft = 0;
        state.message = "Nightfall sealed the Helioigma rotor.";
      }
      updateHud();
    }

    draw();
    requestAnimationFrame(tick);
  }

  function startGame() {
    state.demoing = false;
    state.running = true;
    state.level = 0;
    state.score = 0;
    state.streak = 0;
    state.shifts = 0;
    state.solvedPhases = 0;
    state.complete = false;
    state.finalProof = "";
    state.hintedIndex = -1;
    state.lastAction = "Run started. Align the first visible mismatch.";
    state.particles = [];
    state.lastTick = 0;
    seedLevel(0);
    state.message = "Helioigma rotor is live.";
    updateHud();
  }

  function resetGame() {
    state.demoing = false;
    state.running = false;
    state.level = 0;
    state.score = 0;
    state.streak = 0;
    state.shifts = 0;
    state.solvedPhases = 0;
    state.complete = false;
    state.finalProof = "";
    state.hintedIndex = -1;
    state.lastAction = "Awaiting start.";
    state.particles = [];
    seedLevel(0);
    state.message = "Decode the Helioigma rotor before nightfall.";
    updateHud();
    draw();
  }

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function focusPlayfield() {
    try {
      canvas.focus({ preventScroll: true });
    } catch {
      canvas.focus();
    }
  }

  async function demoSolve() {
    if (state.demoing) return;
    startGame();
    state.demoing = true;
    state.lastTick = 0;
    state.message = "Demo solve is tracing the longest day with a stable judge receipt.";
    updateHud();
    await sleep(260);
    while (state.running && !state.complete) {
      const phaseLength = state.ring.length;
      for (let index = 0; index < phaseLength && state.running && !state.complete; index += 1) {
        let guard = 0;
        while (state.ring[index] !== state.target[index] && guard < glyphs.length && state.running) {
          rotateNode(index);
          guard += 1;
          await sleep(90);
        }
      }
      await sleep(220);
    }
    state.demoing = false;
    if (state.complete) {
      state.message = `Demo solve complete. Final score ${state.score} across ${state.shifts} shifts.`;
    }
    updateHud();
    draw();
  }

  function isTextEntryTarget(target) {
    return Boolean(
      target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
    );
  }

  window.addEventListener("resize", () => {
    resizeCanvas();
    draw();
  });
  canvas.addEventListener("click", handlePointer);
  canvas.addEventListener("touchstart", handlePointer, { passive: false });
  if (nodeButtons) {
    nodeButtons.addEventListener("click", (event) => {
      if (state.demoing) return;
      const button = event.target.closest("button[data-index]");
      if (!button) return;
      rotateNode(Number(button.dataset.index));
    });
  }
  window.addEventListener("keydown", (event) => {
    if (isTextEntryTarget(event.target)) return;
    if (state.demoing) return;
    if (event.key === "Enter") {
      event.preventDefault();
      startGame();
      return;
    }
    if (event.key.toLowerCase() === "d") {
      event.preventDefault();
      demoSolve();
      return;
    }
    if (event.key.toLowerCase() === "h") {
      event.preventDefault();
      showHint();
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      resetGame();
      return;
    }
    if (event.key.toLowerCase() === "r") {
      event.preventDefault();
      resetGame();
      return;
    }
    const index = Number(event.key) - 1;
    if (Number.isInteger(index) && index >= 0 && index < state.ring.length) {
      event.preventDefault();
      rotateNode(index);
    }
  });
  startButton.addEventListener("click", () => {
    startGame();
    focusPlayfield();
  });
  resetButton.addEventListener("click", () => {
    resetGame();
    focusPlayfield();
  });
  if (hintButton) {
    hintButton.addEventListener("click", () => {
      showHint();
      focusPlayfield();
    });
  }
  demoButton.addEventListener("click", () => {
    demoSolve();
    focusPlayfield();
  });
  copyProofButton.addEventListener("click", async () => {
    if (!state.finalProof) return;
    try {
      await navigator.clipboard.writeText(state.finalProof);
      state.message = "Run receipt copied.";
    } catch {
      state.message = `Run receipt ready: ${state.finalProof}`;
    }
    updateHud();
  });

  resizeCanvas();
  seedLevel(0);
  updateHud();
  requestAnimationFrame(tick);
})();
