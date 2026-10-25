export function setVisible(element, visible) {
  if (element) element.style.display = visible ? "" : "none";
}

export function isVisible(element) {
  return Boolean(element && element.getClientRects().length);
}
