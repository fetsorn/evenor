export function onSevenTap(callback) {
  const REQUIRED = 7;
  const WINDOW = 3000;
  let taps = [];

  document.addEventListener("click", (e) => {
    if (!e.target.closest("footer")) return;

    const now = Date.now();
    taps = taps.filter((t) => now - t < WINDOW);
    taps.push(now);
    if (taps.length >= REQUIRED) {
      taps = [];
      callback();
    }
  });
}
