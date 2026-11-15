// The title's shrink-to-the-top is a CSS scroll-driven animation (see styles.css).
// This script only:
//  1. pins --vh to a stable pixel height, so the mobile address bar showing and
//     hiding doesn't make the layout or the animation jump, and
//  2. animates the title itself in browsers without CSS scroll timelines.
const root = document.documentElement;
const title = document.getElementById("title");
const band = document.querySelector(".title-band");

let width = 0;

function setViewportHeight() {
  if (window.innerWidth === width) return;
  width = window.innerWidth;
  root.style.setProperty("--vh", `${window.innerHeight}px`);
}

setViewportHeight();
window.addEventListener("resize", setViewportHeight);

if (!CSS.supports("animation-timeline: scroll()")) {
  const px = (name) => parseFloat(getComputedStyle(root).getPropertyValue(name));
  let distance = 1;
  let startY = 0;
  let endScale = 0.5;

  const measure = () => {
    const vh = window.innerHeight;
    const titleSize = parseFloat(getComputedStyle(title).fontSize);
    distance = Math.max(1, vh - px("--peek") - px("--story-top"));
    startY = vh / 2 - 30 - 1.26 * titleSize;
    endScale = px("--end-scale");
    update();
  };

  // Writes only transform and opacity, which the browser can update without
  // re-laying out the page.
  const update = () => {
    const p = Math.min(1, Math.max(0, window.scrollY / distance));
    const s = 1 - (1 - endScale) * p;
    title.style.transform = `translate3d(-50%, ${(1 - p) * startY}px, 0) scale(${s})`;
    band.style.opacity = p;
  };

  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", measure);
  document.fonts.ready.then(measure);
  measure();
}
