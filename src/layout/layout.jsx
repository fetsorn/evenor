import history from "history/hash";
import { onMount, useContext } from "solid-js";
import { StoreContext, store, onMindChange, onStartup } from "@/store/index.js";
import {
  NavigationBack,
  NavigationNew,
  NavigationRevert,
  NavigationSave,
  NavigationLoader,
} from "./components/index.js";
import { Overview } from "./overview/overview.jsx";
import { Profile } from "./profile/profile.jsx";
import { Filter } from "./filter/filter.jsx";
import styles from "./layout.module.css";

export function LayoutOverview() {
  return (
    <div className={styles.overview}>
      <nav className={styles.buttonbar} title="navigationOverview">
        <NavigationBack />

        <NavigationLoader />

        <NavigationNew />
      </nav>

      <Filter />

      <Overview />
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

              <NavigationLoader />

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
      {/*<h1>Hello world!</h1>*/}
      <main className={styles.main}>
        <LayoutOverview />

        <LayoutProfile />
      </main>

      <span style={{ display: "none" }}>{__COMMIT_HASH__}</span>
    </StoreContext.Provider>
  );
}

export default App;
