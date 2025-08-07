import { createSignal, createEffect } from "solid-js";
import { useContext } from "solid-js";
import { StoreContext } from "@/store/index.js";
import cn from "classnames";
import styles from "./navigation_menu.module.css";
import { MenuSortDirection, MenuSortQuery, MenuBaseQuery } from "./components/index.js";

export function NavigationMenu() {
  const { store } = useContext(StoreContext);

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
        <MenuSortDirection />

        {/*sort query dropdown*/}
        <MenuSortQuery field={".sortBy"} value={new URLSearchParams(store.searchParams).get(".sortBy")} />

        {/*base query dropdown*/}
        <MenuBaseQuery field={"_"} value={new URLSearchParams(store.searchParams).get("_")} />
      </div>
    </div>
  );
}
