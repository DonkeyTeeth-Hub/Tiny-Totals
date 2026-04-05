const CONSTANTS = {
  DEXTROSE_KCAL_PER_GRAM: 3.4,
  LIPID_G_PER_ML_20: 0.2,
  LIPID_KCAL_PER_ML_20: 2.0,
  KCAL_OZ_DIVISOR: 30
};

function getInput(id) {
  return document.getElementById(id);
}

function raw(id) {
  const el = getInput(id);
  return el ? el.value.trim() : "";
}

function n(id) {
  const value = Number(raw(id));
  return Number.isFinite(value) ? value : 0;
}

function isBlank(id) {
  return raw(id) === "";
}

function blankIf(condition, value) {
  return condition ? null : value;
}

function formatNumber(value, digits = 1) {
  if (value === null || value === undefined || !Number.isFinite(value)) return "—";
  return Number(value).toFixed(digits);
}

function setOutput(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function syncEnteralMode(changedId = "") {
  const volumePerFeed = getInput("volume_per_feed_ml");
  const feedsPerDay = getInput("feeds_per_day");
  const totalEnteralVolume = getInput("total_enteral_volume_ml_day");

  if (!volumePerFeed || !feedsPerDay || !totalEnteralVolume) return;

  const pairHasValue = raw("volume_per_feed_ml") !== "" || raw("feeds_per_day") !== "";
  const totalHasValue = raw("total_enteral_volume_ml_day") !== "";

  if (changedId === "total_enteral_volume_ml_day" && totalHasValue) {
    volumePerFeed.value = "";
    feedsPerDay.value = "";
  }

  if ((changedId === "volume_per_feed_ml" || changedId === "feeds_per_day") && pairHasValue) {
    totalEnteralVolume.value = "";
  }

  const updatedPairHasValue = raw("volume_per_feed_ml") !== "" || raw("feeds_per_day") !== "";
  const updatedTotalHasValue = raw("total_enteral_volume_ml_day") !== "";

  totalEnteralVolume.disabled = updatedPairHasValue;
  volumePerFeed.disabled = updatedTotalHasValue;
  feedsPerDay.disabled = updatedTotalHasValue;
}

function spreadsheetModel() {
  const weightKg = n("weight_kg");

  const enteralKcalOz = n("enteral_kcal_oz");
  const volumePerFeedMl = n("volume_per_feed_ml");
  const feedsPerDay = n("feeds_per_day");

  const totalEnteralVolumeDirect = blankIf(
    isBlank("total_enteral_volume_ml_day"),
    n("total_enteral_volume_ml_day")
  );

  const totalEnteralVolumeFromFeeds = blankIf(
    volumePerFeedMl === 0 || feedsPerDay === 0,
    volumePerFeedMl * feedsPerDay
  );

  const totalEnteralVolume =
    totalEnteralVolumeDirect !== null
      ? totalEnteralVolumeDirect
      : totalEnteralVolumeFromFeeds;

  const kcalPerMl = blankIf(
    enteralKcalOz === 0,
    enteralKcalOz / CONSTANTS.KCAL_OZ_DIVISOR
  );

  const enteralMlKgDay = blankIf(
    weightKg <= 0 || totalEnteralVolume === null,
    totalEnteralVolume / weightKg
  );

  const enteralKcalKgDay = blankIf(
    enteralMlKgDay === null || kcalPerMl === null,
    enteralMlKgDay * kcalPerMl
  );

  const totalPoVolume = blankIf(
    isBlank("po_total_volume_ml_day"),
    n("po_total_volume_ml_day")
  );

  const totalPoPercent = blankIf(
    totalPoVolume === null || totalEnteralVolume === null || totalEnteralVolume <= 0,
    (totalPoVolume / totalEnteralVolume) * 100
  );

  const dex1Percent = n("dex1_percent");
  const dex1VolMlDay = n("dex1_vol_ml_day");
  const dex2Percent = n("dex2_percent");
  const dex2VolMlDay = n("dex2_vol_ml_day");
  const nondex1TotalMlDay = n("nondex1_total_ml_day");
  const nondex2TotalMlDay = n("nondex2_total_ml_day");
  const lipidsGKgDay = n("lipids_g_kg_day");

  const ilMlKgDay = blankIf(
    isBlank("lipids_g_kg_day"),
    lipidsGKgDay / CONSTANTS.LIPID_G_PER_ML_20
  );

  const dexTotalKcal =
    (dex1Percent / 100 * dex1VolMlDay * CONSTANTS.DEXTROSE_KCAL_PER_GRAM) +
    (dex2Percent / 100 * dex2VolMlDay * CONSTANTS.DEXTROSE_KCAL_PER_GRAM);

  const ivMlKgDay = blankIf(
    weightKg <= 0,
    ((dex1VolMlDay + dex2VolMlDay + nondex1TotalMlDay + nondex2TotalMlDay) / weightKg) +
      (ilMlKgDay ?? 0)
  );

  const ivKcalKgDay = blankIf(
    weightKg <= 0,
    (dexTotalKcal + ((ilMlKgDay ?? 0) * weightKg * CONSTANTS.LIPID_KCAL_PER_ML_20)) / weightKg
  );

  const totalMlKgDay = blankIf(
    weightKg <= 0,
    (enteralMlKgDay ?? 0) + (ivMlKgDay ?? 0)
  );

  const totalKcalKgDay = blankIf(
    weightKg <= 0,
    (enteralKcalKgDay ?? 0) + (ivKcalKgDay ?? 0)
  );

  return {
    weightKg,
    totalEnteralVolume,
    kcalPerMl,
    enteralMlKgDay,
    enteralKcalKgDay,
    totalPoVolume,
    totalPoPercent,
    ilMlKgDay,
    dexTotalKcal,
    ivMlKgDay,
    ivKcalKgDay,
    totalMlKgDay,
    totalKcalKgDay
  };
}

function render(model) {
  setOutput("out_total_ml_kg_day", formatNumber(model.totalMlKgDay, 1));
  setOutput("out_total_kcal_kg_day", formatNumber(model.totalKcalKgDay, 1));

  setOutput("out_kcal_ml", formatNumber(model.kcalPerMl, 3));
  setOutput("out_total_ml_day", formatNumber(model.totalEnteralVolume, 1));
  setOutput("out_enteral_ml_kg_day", formatNumber(model.enteralMlKgDay, 1));
  setOutput("out_enteral_kcal_kg_day", formatNumber(model.enteralKcalKgDay, 1));
  setOutput("out_total_po_volume", formatNumber(model.totalPoVolume, 1));
  setOutput("out_total_po_percent", formatNumber(model.totalPoPercent, 1));

  setOutput("out_il_ml_kg_day", formatNumber(model.ilMlKgDay, 1));
  setOutput("out_dex_total_kcal", formatNumber(model.dexTotalKcal, 1));
  setOutput("out_iv_total_ml_kg_day", formatNumber(model.ivMlKgDay, 1));
  setOutput("out_iv_total_kcal_kg_day", formatNumber(model.ivKcalKgDay, 1));

  const statusBadge = document.getElementById("statusBadge");
  if (!statusBadge) return;

  if (model.weightKg <= 0) {
    statusBadge.textContent = "Enter weight";
    statusBadge.className = "badge warning";
  } else {
    statusBadge.textContent = "Calculated";
    statusBadge.className = "badge success";
  }
}

function calculate() {
  syncEnteralMode();
  render(spreadsheetModel());
}

function resetForm() {
  document.querySelectorAll("input").forEach((input) => {
    input.value = "";
  });

  syncEnteralMode();

  [
    "out_total_ml_kg_day",
    "out_total_kcal_kg_day",
    "out_kcal_ml",
    "out_total_ml_day",
    "out_enteral_ml_kg_day",
    "out_enteral_kcal_kg_day",
    "out_total_po_volume",
    "out_total_po_percent",
    "out_il_ml_kg_day",
    "out_dex_total_kcal",
    "out_iv_total_ml_kg_day",
    "out_iv_total_kcal_kg_day"
  ].forEach((id) => setOutput(id, "—"));

  const statusBadge = document.getElementById("statusBadge");
  if (statusBadge) {
    statusBadge.textContent = "Awaiting input";
    statusBadge.className = "badge";
  }
}

const resetBtn = document.getElementById("resetBtn");
if (resetBtn) {
  resetBtn.addEventListener("click", resetForm);
}

document.querySelectorAll("input").forEach((input) => {
  input.addEventListener("input", () => {
    syncEnteralMode(input.id);
    calculate();
  });
});

resetForm();
