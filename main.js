// Shrinks the title from the middle of the screen to the top as the page scrolls,
// then keeps it fixed there. --p (0 → 1) also fades in the band behind the title,
// so the page content fades out as it scrolls up underneath.
const root = document.documentElement;
const title = document.getElementById("title");

const DOCK_TOP = 30;   // title's top edge once docked
const SMALL_SIZE = 24; // docked font size in px

let vh = 0;
let width = 0;
let distance = 1;
let bigHeight = 0;
let endScale = 0.5;

function measure() {
  // Only re-measure the height when the width changes, so the mobile address bar
  // showing and hiding doesn't make the layout jump.
  if (window.innerWidth !== width || !vh) {
    width = window.innerWidth;
    vh = window.innerHeight;
    root.style.setProperty("--vh", `${vh}px`);
  }

  const styles = getComputedStyle(root);
  const peek = parseFloat(styles.getPropertyValue("--peek"));
  const storyTop = parseFloat(styles.getPropertyValue("--story-top"));
  const bigSize = parseFloat(getComputedStyle(title).fontSize);

  bigHeight = title.offsetHeight;
  endScale = SMALL_SIZE / bigSize;
  distance = Math.max(1, vh - peek - storyTop);
  update();
}

function update() {
  const p = Math.min(1, Math.max(0, window.scrollY / distance));
  const startY = vh / 2 - bigHeight / 2 - DOCK_TOP;
  const y = (1 - p) * startY;
  const s = 1 - (1 - endScale) * p;
  title.style.transform = `translate(-50%, ${y}px) scale(${s})`;
  root.style.setProperty("--p", p.toFixed(3));
}

let ticking = false;
window.addEventListener("scroll", () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    update();
    ticking = false;
  });
}, { passive: true });

window.addEventListener("resize", measure);
document.fonts.ready.then(measure);
measure();
