import { createSignal, createEffect } from "solid-js";
import cn from "classnames";
import styles from "./navigation_menu.module.css";
import { MenuSortDirection } from "./components/index.js";

export function NavigationMenu() {
  const [isOpen, setIsOpen] = createSignal(false)

  function close(e) {
    // NOTE: can't check for document.getElementById('menu').contains
    // because by the time this triggers a button is no longer in the menu
    if (e.target.className == styles.menuButton) {
      // Clicked in box
    } else {
      // Clicked outside the box
      setIsOpen(false);
    }
  }

  createEffect(() => {
    // after opening wait for any other click to close
    if (isOpen() === true) {
      // wait to ignore the opening click
      setTimeout(() => {
        window.addEventListener('click', close);
      }, 1);
    } else {
      window.removeEventListener('click', close);
    }
  });


  return (
    <div className="container">
      <button onClick={() => setIsOpen(!isOpen())}>...</button>

      <div id="menu" className={cn(styles.menu, { [styles.opened]: isOpen() })}>
        {/*sort direction toggle*/}
        <MenuSortDirection className={styles.menuButton} />

        {/*sort query dropdown*/}
        <button
          className={styles.menuButton}
        >
          sort
          </button>
        {/*base query dropdown*/}
        <button
          className={styles.menuButton}
        >
          sort
          </button>
      </div>
    </div>
  );
}
