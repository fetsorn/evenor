export function FilterScroll() {
  // TODO only show after scrolling up, hide on scrolling down
  // TODO only show on desktop
  return <button onClick={() => window.scrollTo(0, 0)}>scroll to top</button>;
}
