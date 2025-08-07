import history from "history/hash";
import cn from "classnames";
import { onMount, useContext } from "solid-js";
import { StoreContext, store, onMindChange, onStartup } from "@/store/index.js";
import {
  NavigationBack,
  NavigationRevert,
  NavigationSave,
  NavigationMenu,
} from "./navigation/index.js";
import {
  BottomCount,
  BottomLoader,
  BottomNew
} from "./bottom/index.js";
import { Overview } from "./overview/overview.jsx";
import { Profile } from "./profile/profile.jsx";
import styles from "./layout.module.css";

export function LayoutOverview() {
  return (
    <div className={cn(styles.overview, store.record !== undefined ? styles.closed : styles.opened )}>
      <nav className={styles.buttonbar} title="navigationOverview">
        <NavigationBack />

        <NavigationMenu />
      </nav>

      <Overview />

      <footer className={styles.bottom}>
        <BottomCount />

        <BottomLoader />

        <BottomNew />
      </footer>
    </div>
  );
}

export function LayoutProfile() {
  const { store } = useContext(StoreContext);

  return (
    <Show when={store.record !== undefined} fallback={<></>}>
      <div className={styles.sidebar}>
        <div className={styles.container}>
          <div className={styles.sticky}>
            <nav className={styles.buttonbar} title="navigationProfile">
              <NavigationRevert />

              <NavigationSave />
            </nav>

            <Profile />
          </div>
        </div>
      </div>
    </Show>
  );
}

export function App() {
  onMount(async () => {
    await onStartup();

    await onMindChange(history.location.pathname, history.location.search);
  });

  return (
    <StoreContext.Provider value={{ store }}>
      <main className={styles.main}>
        <LayoutOverview />

        <LayoutProfile />
      </main>

      <span style={{ display: "none" }}>{__COMMIT_HASH__}</span>
    </StoreContext.Provider>
  );
}

export default App;
