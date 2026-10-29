import { createMovingPoints } from "./canvas-nest.js";

function getSavedTheme() {
  return localStorage.getItem('theme') || 'dark';
}
function saveTheme(theme) {
  localStorage.setItem('theme', theme);
}
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
}
function toggleTheme() {
  const currentTheme = getSavedTheme();
  const newTheme = currentTheme === 'dark' ? 'white' : 'dark';
  applyTheme(newTheme);
  saveTheme(newTheme);
}
let movingPoints = null;
function initMovingPoints() {
  if (movingPoints !== null) return;
  movingPoints = createMovingPoints({
    canvas: document.getElementById("bganim-canvas"),
    config: {
      count: 90,
      color: "0,200,100",
      opacity: 0.5,
    }
  });
}
function getSavedEnabledState() {
  const saved = localStorage.getItem('bganim-enabled');
  const defaultEnabled = window.innerWidth >= 480;
  const savedEnabled = saved === 'true';
  return saved === null ? defaultEnabled : savedEnabled;
}
function saveEnabledState(enabled) {
  localStorage.setItem('bganim-enabled', enabled);
}
function applyEnabledState(enabled) {
  document.documentElement.setAttribute('data-bganim-enabled', enabled);
  if (enabled) {
    initMovingPoints();
    movingPoints.startAnimation();
  } else {
    if (movingPoints !== null) {
      movingPoints.stopAnimation();
    }
  }
}
function toggleEnabledState() {
  const currentEnabledState = getSavedEnabledState();
  const newEnabledState = !currentEnabledState;
  applyEnabledState(newEnabledState);
  saveEnabledState(newEnabledState);
}
function mountControls() {
  const nav = document.querySelector("#nav > ul");
  if (!nav) return;
  const controls = document.createElement("li");
  nav.append(controls);
  for (const [id, handler] of [
    ["dark-mode-toggle-btn", toggleTheme],
    ["bganim-toggle-btn", toggleEnabledState],
  ]) {
    const button = document.getElementById(id);
    if (!button) continue;
    controls.append(button);
    button.addEventListener("click", handler);
    button.style.display = "";
  }
}

function initSiteControls() {
  window.addEventListener("storage", function(e) {
    if (e.key === "theme") {
      applyTheme(e.newValue);
    } else if (e.key === "bganim-enabled") {
      applyEnabledState(e.newValue === "true");
    }
  });

  applyEnabledState(getSavedEnabledState());
  mountControls();
}

document.addEventListener("DOMContentLoaded", initSiteControls);
