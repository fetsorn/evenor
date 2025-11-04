import { createSignal, createEffect } from "solid-js";
import { MenuSortQuery, MenuBaseQuery } from "./components/index.js";
import styles from "./navigation_menu.module.css";

export function NavigationMenu() {
  const [isOpen, setIsOpen] = createSignal(false);

  function close(e) {
    // NOTE: can't check for document.getElementById('menu').contains
    // because by the time this triggers a button is no longer in the menu
    // so we list ids that can be clicked, and close menu on others
    const ids = [
      "selectSort",
      "selectBase",
      "sortDirectionFirst",
      "sortDirectionLast",
      "menuSort",
      "menuBase",
      "labelSort",
      "labelBase",
    ];

    if (ids.includes(e.target.id)) {
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
        window.addEventListener("click", close);
      }, 1);
    } else {
      window.removeEventListener("click", close);
    }
  });

  return (
    <div className="container">
      <button onClick={() => setIsOpen(!isOpen())}>...</button>

      <div
        id="menu"
        className={styles.menu + " " + (isOpen() ? styles.opened : "")}
      >
        {/*base query dropdown*/}
        <MenuBaseQuery />

        {/*sort query dropdown*/}
        <MenuSortQuery />
      </div>
    </div>
  );
}
