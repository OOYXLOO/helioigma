(function attachReceiptCore(global) {
  const totalPhases = 4;
  const stableDemo = {
    receipt: "SC-4P-2907-62-Y5VFX1",
    phases: 4,
    score: 2907,
    shifts: 62,
  };

  function buildReceiptPayload(score, shifts, solvedPhases, phaseCount = totalPhases) {
    return `solstice|${phaseCount}|${score}|${shifts}|${solvedPhases}`;
  }

  function suffixFor(score, shifts, solvedPhases, phaseCount = totalPhases) {
    const payload = buildReceiptPayload(score, shifts, solvedPhases, phaseCount);
    let hash = 2166136261;
    for (const char of payload) {
      hash ^= char.charCodeAt(0);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(36).toUpperCase().padStart(6, "0").slice(0, 6);
  }

  function buildRunReceipt({ score, shifts, solvedPhases, phaseCount = totalPhases }) {
    return `SC-${solvedPhases}P-${score}-${shifts}-${suffixFor(score, shifts, solvedPhases, phaseCount)}`;
  }

  function parseReceipt(receipt) {
    const value = String(receipt || "").trim().toUpperCase();
    const match = /^SC-(\d+)P-(\d+)-(\d+)-([0-9A-Z]{6})$/.exec(value);
    if (!match) return null;
    return {
      value,
      solvedPhases: Number(match[1]),
      score: Number(match[2]),
      shifts: Number(match[3]),
      suffix: match[4],
    };
  }

  function verifyReceipt(receipt) {
    const parsed = parseReceipt(receipt);
    if (!parsed) {
      return { ok: false, status: "invalid_format", expectedFormat: "SC-4P-score-shifts-checksum" };
    }
    const expected = suffixFor(parsed.score, parsed.shifts, parsed.solvedPhases);
    const formulaPlausible =
      parsed.solvedPhases === totalPhases &&
      parsed.score >= 0 &&
      parsed.score <= 5000 &&
      parsed.shifts >= 0 &&
      parsed.shifts <= 300;
    const stableDemoReceipt =
      parsed.value === stableDemo.receipt &&
      parsed.solvedPhases === stableDemo.phases &&
      parsed.score === stableDemo.score &&
      parsed.shifts === stableDemo.shifts &&
      parsed.suffix === expected;
    return {
      ok: parsed.suffix === expected,
      status: stableDemoReceipt
        ? "stable_demo"
        : formulaPlausible && parsed.suffix === expected
          ? "formula_valid"
          : parsed.suffix === expected
            ? "out_of_bounds"
            : "checksum_mismatch",
      expected,
      formulaPlausible,
      stableDemoReceipt,
      ...parsed,
    };
  }

  global.HelioigmaReceipt = Object.freeze({
    totalPhases,
    stableDemo: Object.freeze({ ...stableDemo }),
    buildReceiptPayload,
    suffixFor,
    buildRunReceipt,
    parseReceipt,
    verifyReceipt,
  });
})(globalThis);
