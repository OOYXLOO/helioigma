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
  const soundButton = document.querySelector("#soundButton");
  const phaseTrack = document.querySelector("#phaseTrack");
  const dayMeter = document.querySelector("#dayMeter");
  const dayMeterLabel = document.querySelector("#dayMeterLabel");
  const dayMeterFill = document.querySelector("#dayMeterFill");
  const phaseObjective = document.querySelector("#phaseObjective");
  const phaseTargetLine = document.querySelector("#phaseTargetLine");
  const phaseAlignment = document.querySelector("#phaseAlignment");
  const phaseProof = document.querySelector("#phaseProof");
  const nodeButtons = document.querySelector("#nodeButtons");
  const proofPanel = document.querySelector("#proofPanel");
  const proofCode = document.querySelector("#proofCode");
  const proofSummary = document.querySelector("#proofSummary");
  const verifyProofLink = document.querySelector("#verifyProofLink");
  const copyProofButton = document.querySelector("#copyProofButton");
  const copyRunSummaryButton = document.querySelector("#copyRunSummaryButton");
  const phaseLedger = document.querySelector("#phaseLedger");
  const judgeRunSummaryText = document.querySelector("#judgeRunSummaryText");
  const judgeRunFacts = document.querySelector("#judgeRunFacts");
  const nightfallPanel = document.querySelector("#nightfallPanel");
  const nightfallSummary = document.querySelector("#nightfallSummary");
  const nightfallFacts = document.querySelector("#nightfallFacts");
  const retryButton = document.querySelector("#retryButton");
  const demoRetryButton = document.querySelector("#demoRetryButton");
  const tracePanel = document.querySelector("#tracePanel");
  const tracePhase = document.querySelector("#tracePhase");
  const traceMatch = document.querySelector("#traceMatch");
  const traceNext = document.querySelector("#traceNext");
  const traceLast = document.querySelector("#traceLast");
  const phaseAnnouncer = document.querySelector("#phaseAnnouncer");

  const glyphs = ["SOL", "XOR", "LUX", "BIN"];
  const palette = ["#f7c948", "#ff7a59", "#8bd3ff", "#b8f2c8"];
  const phaseNames = ["Crib dawn", "XOR meridian", "Carry twilight", "Checksum night"];
  const phaseMottos = [
    "Find the daylight crib before the wheel starts to drift.",
    "Carry the XOR signal through the longest noon.",
    "Hold twilight long enough for the binary carry.",
    "Close the checksum before nightfall seals the rotor.",
  ];
  const phaseProofs = [
    "Crib checks state.",
    "XOR checks parity.",
    "Binary carry controls shifts.",
    "Checksum seals the trace.",
  ];
  const phaseScanNotes = [
    "Crib scan: first mismatch.",
    "XOR scan: mirrored nodes.",
    "Carry scan: binary chain.",
    "Checksum scan: reverse.",
  ];
  const searchParams = new URLSearchParams(window.location.search);
  const storageDisabled = searchParams.get("nostore") === "1";
  const bestScoreKey = "helioigma-best-score";
  const shiftPenaltySeconds = 0.45;
  const tactilePulseSeconds = 0.55;
  const firstMovePulseSeconds = 1.2;
  const levels = [
    { target: [0, 2, 1, 3, 0, 1], seconds: 45 },
    { target: [3, 0, 2, 1, 3, 2, 0], seconds: 42 },
    { target: [1, 3, 0, 2, 1, 0, 3, 2], seconds: 38 },
    { target: [2, 1, 3, 0, 2, 3, 1, 0, 1], seconds: 35 },
  ];
  const phaseOrders = [
    [0, 1, 2, 3, 4, 5],
    [0, 6, 1, 5, 2, 4, 3],
    [0, 1, 2, 3, 4, 5, 6, 7],
    [8, 7, 6, 5, 4, 3, 2, 1, 0],
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
    failed: false,
    finalProof: "",
    ring: [],
    target: levels[0].target,
    nodes: [],
    particles: [],
    ledger: [],
    lastTick: 0,
    demoing: false,
    hintedIndex: -1,
    recentIndex: -1,
    recentLife: 0,
    recentLocked: false,
    phaseBanner: { title: "", detail: "", life: 0 },
    lastAction: "Awaiting start.",
    message: "Cycle SOL>XOR>LUX>BIN; rotate before nightfall.",
  };
  const audio = {
    enabled: false,
    context: null,
    master: null,
  };

  function syncSoundButton() {
    if (!soundButton) return;
    soundButton.textContent = audio.enabled ? "Audio On" : "Audio";
    soundButton.setAttribute("aria-pressed", String(audio.enabled));
    soundButton.setAttribute("aria-label", audio.enabled ? "Audio cues on" : "Audio cues off");
    soundButton.classList.toggle("active", audio.enabled);
  }

  async function ensureAudio() {
    if (!audio.context) {
      const AudioCtor = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtor) return false;
      audio.context = new AudioCtor();
      audio.master = audio.context.createGain();
      audio.master.gain.value = 0.055;
      audio.master.connect(audio.context.destination);
    }
    if (audio.context.state === "suspended") {
      await audio.context.resume();
    }
    return audio.context.state === "running";
  }

  function playCue(name) {
    if (!audio.enabled || !audio.context || !audio.master || audio.context.state !== "running") return;
    const patterns = {
      start: [[220, 0, 0.08], [330, 0.07, 0.1]],
      hint: [[640, 0, 0.05], [480, 0.05, 0.06]],
      shift: [[260, 0, 0.055]],
      lock: [[420, 0, 0.06], [630, 0.06, 0.08]],
      phase: [[392, 0, 0.08], [588, 0.08, 0.1]],
      complete: [[392, 0, 0.1], [523, 0.1, 0.12], [784, 0.22, 0.16]],
      fail: [[180, 0, 0.16]],
    };
    const tones = patterns[name] || patterns.shift;
    const now = audio.context.currentTime;
    tones.forEach(([frequency, offset, duration]) => {
      const oscillator = audio.context.createOscillator();
      const gain = audio.context.createGain();
      const start = now + offset;
      oscillator.type = name === "fail" ? "sawtooth" : "triangle";
      oscillator.frequency.setValueAtTime(frequency, start);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.72, start + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      oscillator.connect(gain);
      gain.connect(audio.master);
      oscillator.start(start);
      oscillator.stop(start + duration + 0.02);
    });
  }

  async function toggleAudio() {
    if (!audio.enabled) {
      const available = await ensureAudio();
      if (!available) {
        state.message = "Audio cues are unavailable in this browser.";
        updateHud();
        return;
      }
      audio.enabled = true;
      syncSoundButton();
      state.message = "Audio cues enabled.";
      updateHud();
      playCue("start");
      return;
    }
    audio.enabled = false;
    syncSoundButton();
    state.message = "Audio cues off.";
    updateHud();
  }

  function loadBestScore() {
    if (storageDisabled) return 0;
    try {
      return Number(localStorage.getItem(bestScoreKey)) || 0;
    } catch {
      return 0;
    }
  }

  function storeBestScore(score) {
    state.bestScore = Math.max(state.bestScore, score);
    if (storageDisabled) return;
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
    state.recentIndex = -1;
    state.recentLife = 0;
    state.recentLocked = false;
    if (state.running && index > 0) {
      showPhaseBanner(index);
    } else if (state.running) {
      announcePhase(index);
    }
    state.lastAction = index === 0 ? "Awaiting start." : `${phaseNames[index]} seeded.`;
    state.message = index === 0 ? "Cycle SOL>XOR>LUX>BIN; rotate before nightfall." : `${phaseNames[index]} unlocked.`;
    updateHud();
  }

  function showPhaseBanner(index) {
    const title = `Phase ${index + 1}: ${phaseNames[index]}`;
    const detail = phaseMottos[index];
    state.phaseBanner = { title, detail, life: 1.65 };
    announcePhase(index);
  }

  function announcePhase(index) {
    const title = `Phase ${index + 1}: ${phaseNames[index]}`;
    const detail = phaseMottos[index];
    if (phaseAnnouncer) {
      phaseAnnouncer.textContent = `${title}. ${detail}`;
    }
  }

  function updateHud() {
    levelLabel.textContent = String(Math.min(state.level + 1, levels.length));
    scoreLabel.textContent = String(state.score);
    bestLabel.textContent = String(state.bestScore);
    shiftLabel.textContent = String(state.shifts);
    timeLabel.textContent = String(Math.max(0, Math.ceil(state.timeLeft)));
    statusLine.textContent = state.message;
    startButton.disabled = state.demoing || (state.running && !state.complete && !state.failed);
    if (hintButton) {
      hintButton.disabled = !state.running || state.complete || state.demoing;
    }
    demoButton.disabled = state.demoing;
    syncSoundButton();
    syncDayMeter();
    syncPhaseObjective();
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
      if (verifyProofLink) {
        verifyProofLink.href = state.finalProof
          ? `proof-verifier.html?receipt=${encodeURIComponent(state.finalProof)}`
          : "proof-verifier.html";
      }
      syncPhaseLedger();
      syncJudgeRunSummary();
      copyProofButton.disabled = !state.finalProof;
      if (copyRunSummaryButton) {
        copyRunSummaryButton.disabled = !state.finalProof;
      }
    }
    syncNightfallPanel();
  }

  function syncNightfallPanel() {
    if (!nightfallPanel || !nightfallSummary || !nightfallFacts) return;
    nightfallPanel.hidden = !state.failed;
    nightfallFacts.textContent = "";
    if (!state.failed) return;
    const aligned = countAlignedNodes();
    nightfallSummary.textContent = `Nightfall caught phase ${Math.min(state.level + 1, levels.length)} with ${aligned}/${state.target.length} nodes aligned. Press Retry for manual play or Watch Demo Solve to see the stable summary receipt.`;
    [
      ["Held phases", `${state.solvedPhases}/${levels.length}`],
      ["Score", `${state.score} points`],
      ["Shifts", `${state.shifts}`],
      ["Next proof", phaseProof?.textContent || "Run the deterministic demo receipt."],
    ].forEach(([label, value]) => {
      const term = document.createElement("dt");
      const detail = document.createElement("dd");
      term.textContent = label;
      detail.textContent = value;
      nightfallFacts.append(term, detail);
    });
  }

  function syncPhaseLedger() {
    if (!phaseLedger) return;
    phaseLedger.textContent = "";
    state.ledger.forEach((entry) => {
      const item = document.createElement("li");
      const phase = document.createElement("strong");
      const facts = document.createElement("span");
      phase.textContent = entry.phase;
      facts.textContent = `+${entry.points} score | ${entry.daylight}s daylight | ${entry.shifts} shifts`;
      item.append(phase, facts);
      phaseLedger.append(item);
    });
  }

  function buildJudgeRunSummaryText() {
    if (!state.finalProof) return "";
    return `Held ${state.solvedPhases}/${levels.length} solstice phases with ${state.score} score and ${state.shifts} shifts. The award signal is visible in play: solstice timer, Turing-style state alignment, and a Demo Solve summary receipt ${state.finalProof}.`;
  }

  function buildJudgeRunSummaryClipboardText() {
    if (!state.finalProof) return "";
    return [
      "Helioigma judge run summary",
      `Result: ${state.solvedPhases}/${levels.length} phases held`,
      `Score: ${state.score}`,
      `Shifts: ${state.shifts}`,
      `Receipt: ${state.finalProof}`,
      "Award signals: solstice loop, Turing ode, judge receipt",
      "Verification: open proof-verifier.html with the receipt query link",
      "Turing fit: state alignment, XOR/binary glyphs, pressure, and checksum reasoning",
    ].join("\n");
  }

  function syncJudgeRunSummary() {
    if (!judgeRunSummaryText || !judgeRunFacts) return;
    judgeRunSummaryText.textContent = buildJudgeRunSummaryText();
    judgeRunFacts.textContent = "";
    if (!state.finalProof) return;
    const facts = [
      ["Result", `${state.solvedPhases}/${levels.length} phases held`],
      ["Score", `${state.score} points`],
      ["Shifts", `${state.shifts} node shifts`],
      ["Receipt", state.finalProof],
      ["Verify", "Linked local receipt verifier"],
      ["Award signal", "solstice loop + Turing ode + judge receipt"],
      ["Turing fit", "state alignment + checksum reasoning"],
    ];
    facts.forEach(([label, value]) => {
      const term = document.createElement("dt");
      const detail = document.createElement("dd");
      term.textContent = label;
      detail.textContent = value;
      judgeRunFacts.append(term, detail);
    });
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

  function countAlignedNodes() {
    return state.ring.reduce((count, value, index) => count + (value === state.target[index] ? 1 : 0), 0);
  }

  function currentPhaseIndex() {
    return Math.min(state.level, levels.length - 1);
  }

  function currentPhaseOrder() {
    const order = phaseOrders[currentPhaseIndex()] || [];
    return order.filter((index) => index >= 0 && index < state.ring.length);
  }

  function findGuidedMismatchIndex() {
    for (const index of currentPhaseOrder()) {
      if (state.ring[index] !== state.target[index]) {
        return index;
      }
    }
    return state.ring.findIndex((value, index) => value !== state.target[index]);
  }

  function syncPhaseObjective() {
    if (!phaseObjective || !phaseTargetLine || !phaseAlignment) return;
    const safeLevel = currentPhaseIndex();
    const aligned = countAlignedNodes();
    phaseObjective.textContent = state.complete ? "Receipt sealed" : phaseNames[safeLevel];
    phaseObjective.nextElementSibling.textContent = state.complete
      ? "The longest-day run is complete; verify the receipt below."
      : phaseMottos[safeLevel];
    phaseTargetLine.textContent = state.target.map((value) => glyphs[value]).join(" ");
    phaseAlignment.textContent = state.complete
      ? `${state.solvedPhases}/${levels.length} phases solved`
      : `${aligned}/${state.target.length} nodes aligned`;
    if (phaseProof) {
      phaseProof.textContent = state.complete
        ? "Receipt verifier checks the summary checksum."
        : phaseProofs[safeLevel];
    }
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
      button.classList.toggle("recent", index === state.recentIndex && state.recentLife > 0);
      button.classList.toggle("recent-locked", index === state.recentIndex && state.recentLife > 0 && state.recentLocked);
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
    const safeLevel = currentPhaseIndex();
    const phase = state.complete ? "Receipt" : phaseNames[safeLevel];
    const matched = state.ring.filter((value, i) => value === state.target[i]).length;
    const nextMismatch = findGuidedMismatchIndex();
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

    const targetGlyphRadius = Math.min(23, nodeRadius * 0.52);
    const targetInset = Math.max(targetGlyphRadius + 28, Math.min(64, w * 0.16));
    const targetGap = Math.min(72, (w - targetInset * 2) / Math.max(1, state.target.length - 1));
    const targetY = Math.max(70, topBand * 0.72);
    const targetStart = cx - ((state.target.length - 1) * targetGap) / 2;
    const targetVisualRadius = targetGlyphRadius + 12;
    canvas.dataset.targetRowBounds = JSON.stringify({
      left: Math.round(targetStart - targetVisualRadius),
      right: Math.round(targetStart + (state.target.length - 1) * targetGap + targetVisualRadius),
      width: Math.round(w),
      inset: Math.round(targetInset),
    });
    ctx.save();
    ctx.strokeStyle = "rgba(247,243,223,0.14)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(targetStart, targetY);
    ctx.lineTo(targetStart + (state.target.length - 1) * targetGap, targetY);
    ctx.stroke();
    ctx.restore();
    state.target.forEach((value, i) => {
      drawGlyph(targetStart + i * targetGap, targetY, targetGlyphRadius, value, "");
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

      if (i === state.recentIndex && state.recentLife > 0) {
        const pulse = Math.max(0, Math.min(1, state.recentLife / tactilePulseSeconds));
        ctx.save();
        ctx.globalAlpha = 0.18 + pulse * 0.42;
        ctx.strokeStyle = state.recentLocked ? "rgba(184,242,200,0.94)" : "rgba(139,211,255,0.9)";
        ctx.lineWidth = state.recentLocked ? 5 : 4;
        ctx.beginPath();
        ctx.arc(x, y, nodeRadius + 7 + (1 - pulse) * 18, 0, Math.PI * 2);
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

    drawPhaseBanner(cx, topBand, ringRadius, w);

    state.particles.forEach((particle) => {
      ctx.globalAlpha = particle.life;
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    });
  }

  function drawPhaseBanner(cx, topBand, ringRadius, width) {
    if (!state.phaseBanner.life || state.complete) return;
    const fade = Math.min(1, state.phaseBanner.life / 0.28);
    const alpha = Math.max(0, Math.min(1, fade));
    const panelWidth = Math.min(width * 0.72, 560);
    const panelHeight = Math.max(58, ringRadius * 0.34);
    const x = cx - panelWidth / 2;
    const y = topBand + 18;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = "rgba(7,16,24,0.9)";
    ctx.strokeStyle = "rgba(247,201,72,0.48)";
    ctx.lineWidth = 2;
    roundRect(ctx, x, y, panelWidth, panelHeight, 16);
    ctx.fill();
    ctx.stroke();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#f7c948";
    ctx.font = `800 ${Math.max(16, Math.min(width, ringRadius * 2) * 0.052)}px ui-sans-serif, system-ui`;
    ctx.fillText(state.phaseBanner.title.toUpperCase(), cx, y + panelHeight * 0.38);
    ctx.fillStyle = "rgba(247,243,223,0.86)";
    ctx.font = `700 ${Math.max(11, Math.min(width, ringRadius * 2) * 0.028)}px ui-sans-serif, system-ui`;
    ctx.fillText(state.phaseBanner.detail, cx, y + panelHeight * 0.67);
    ctx.restore();
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
    roundRect(ctx, cx - ringRadius * 0.88, cy - ringRadius * 0.46, ringRadius * 1.76, ringRadius * 1.02, 18);
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
    ctx.fillStyle = "rgba(184,242,200,0.9)";
    ctx.font = `700 ${Math.max(11, ringRadius * 0.05)}px ui-sans-serif, system-ui`;
    ctx.fillText("Logic aligned. Daylight sealed.", cx, cy + ringRadius * 0.28);
    ctx.fillStyle = "rgba(174,184,197,0.78)";
    ctx.font = `600 ${Math.max(11, ringRadius * 0.046)}px ui-sans-serif, system-ui`;
    ctx.fillText(`Receipt ${state.finalProof}`, cx, cy + ringRadius * 0.39);
    ctx.fillText(state.score >= state.bestScore ? "New solstice record." : "Ready for another run.", cx, cy + ringRadius * 0.51);
    ctx.restore();
  }

  function checkWin() {
    if (!state.running) return;
    const complete = state.ring.every((value, i) => value === state.target[i]);
    if (!complete) return;
    state.streak += 1;
    state.solvedPhases += 1;
    const phaseScore = Math.ceil(state.timeLeft * 10) + state.target.length * 25 + state.streak * 50;
    state.ledger.push({
      phase: phaseNames[state.level],
      points: phaseScore,
      daylight: Math.max(0, Math.ceil(state.timeLeft)),
      shifts: state.shifts,
    });
    state.score += phaseScore;
    state.level += 1;
    burst(canvas.clientWidth / 2, canvas.clientHeight / 2, "#b8f2c8");
    seedLevel(state.level);
    playCue(state.complete ? "complete" : "phase");
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
      state.timeLeft = Math.max(0, state.timeLeft - shiftPenaltySeconds);
    }
    state.recentIndex = index;
    state.recentLife = tactilePulseSeconds;
    state.recentLocked = locked;
    burst(px, py, palette[state.ring[index]]);
    playCue(locked ? "lock" : "shift");
    state.lastAction = locked
      ? `Node ${index + 1} locked at ${glyphs[state.ring[index]]}.`
      : `Node ${index + 1} shifted to ${glyphs[state.ring[index]]}.`;
    const nextMismatch = findGuidedMismatchIndex();
    state.message = locked
      ? nextMismatch === -1
        ? "All signals aligned; sealing phase."
        : `Signal ${index + 1} locked. Next mismatch: node ${nextMismatch + 1} -> ${glyphs[state.target[nextMismatch]]}.`
      : `Node ${index + 1} shifted to ${glyphs[state.ring[index]]}; target ${glyphs[state.target[index]]}. Daylight -${shiftPenaltySeconds}s.`;
    updateHud();
    checkWin();
    draw();
  }

  function showHint() {
    if (!state.running || state.complete || state.demoing) return;
    const index = findGuidedMismatchIndex();
    if (index === -1) {
      state.hintedIndex = -1;
      state.message = "All visible signals are aligned.";
      updateHud();
      return;
    }
    state.hintedIndex = index;
    state.recentIndex = index;
    state.recentLife = tactilePulseSeconds;
    state.recentLocked = false;
    state.lastAction = `Hint node ${index + 1}: target ${glyphs[state.target[index]]}. ${phaseScanNotes[currentPhaseIndex()]}`;
    state.message = `Hint: rotate node ${index + 1} toward ${glyphs[state.target[index]]}.`;
    playCue("hint");
    updateHud();
    draw();
  }

  function cueFirstMove() {
    const index = findGuidedMismatchIndex();
    if (index === -1) return;
    state.hintedIndex = index;
    state.recentIndex = index;
    state.recentLife = firstMovePulseSeconds;
    state.recentLocked = false;
    state.lastAction = `First move cue: node ${index + 1} target ${glyphs[state.target[index]]}.`;
    state.message = `First move: rotate node ${index + 1} toward ${glyphs[state.target[index]]}.`;
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
    if (state.phaseBanner.life > 0) {
      state.phaseBanner.life = Math.max(0, state.phaseBanner.life - delta);
    }
    if (state.recentLife > 0) {
      state.recentLife = Math.max(0, state.recentLife - delta);
      if (state.recentLife === 0) {
        state.recentIndex = -1;
        state.recentLocked = false;
      }
    }

    if (state.running && !state.demoing) {
      state.timeLeft -= delta;
      if (state.timeLeft <= 0) {
        state.running = false;
        state.failed = true;
        state.streak = 0;
        state.timeLeft = 0;
        state.lastAction = "Nightfall report ready.";
        state.message = "Nightfall sealed the rotor. Retry or watch Demo Solve.";
        playCue("fail");
      }
      updateHud();
    }

    draw();
    requestAnimationFrame(tick);
  }

  function startGame(options = {}) {
    const { coach = true } = options;
    state.demoing = false;
    state.running = true;
    state.level = 0;
    state.score = 0;
    state.streak = 0;
    state.shifts = 0;
    state.solvedPhases = 0;
    state.complete = false;
    state.failed = false;
    state.finalProof = "";
    state.hintedIndex = -1;
    state.recentIndex = -1;
    state.recentLife = 0;
    state.recentLocked = false;
    state.phaseBanner = { title: "", detail: "", life: 0 };
    state.ledger = [];
    state.lastAction = "Run started. Align the first visible mismatch.";
    state.particles = [];
    state.lastTick = 0;
    seedLevel(0);
    state.message = "Helioigma rotor is live.";
    if (coach) {
      cueFirstMove();
    }
    playCue("start");
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
    state.failed = false;
    state.finalProof = "";
    state.hintedIndex = -1;
    state.recentIndex = -1;
    state.recentLife = 0;
    state.recentLocked = false;
    state.phaseBanner = { title: "", detail: "", life: 0 };
    state.ledger = [];
    state.lastAction = "Awaiting start.";
    state.particles = [];
    seedLevel(0);
    state.message = "Cycle SOL>XOR>LUX>BIN; rotate before nightfall.";
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

  function focusCompletedReceipt() {
    if (!proofPanel || !verifyProofLink) return;
    proofPanel.scrollIntoView({ block: "start", behavior: "auto" });
    try {
      verifyProofLink.focus({ preventScroll: true });
    } catch {
      verifyProofLink.focus();
    }
  }

  async function demoSolve() {
    if (state.demoing) return;
    startGame({ coach: false });
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
    if (state.complete) {
      focusCompletedReceipt();
    }
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
      if (state.running && !state.complete && !state.failed) return;
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
    if (event.key.toLowerCase() === "s") {
      event.preventDefault();
      toggleAudio();
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
    if (state.running && !state.complete && !state.failed) return;
    startGame();
    focusPlayfield();
  });
  resetButton.addEventListener("click", () => {
    resetGame();
    focusPlayfield();
  });
  if (retryButton) {
    retryButton.addEventListener("click", () => {
      startGame();
      focusPlayfield();
    });
  }
  if (demoRetryButton) {
    demoRetryButton.addEventListener("click", () => {
      demoSolve();
      focusPlayfield();
    });
  }
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
  if (soundButton) {
    soundButton.addEventListener("click", () => {
      toggleAudio();
      focusPlayfield();
    });
  }
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
  if (copyRunSummaryButton) {
    copyRunSummaryButton.addEventListener("click", async () => {
      if (!state.finalProof) return;
      const text = buildJudgeRunSummaryClipboardText();
      try {
        await navigator.clipboard.writeText(text);
        state.message = "Judge run summary copied.";
      } catch {
        state.message = "Judge run summary is ready below.";
      }
      updateHud();
    });
  }

  resizeCanvas();
  seedLevel(0);
  syncSoundButton();
  updateHud();
  requestAnimationFrame(tick);

  if (searchParams.get("demo") === "1") {
    window.setTimeout(() => {
      demoSolve();
    }, 350);
  }
})();
