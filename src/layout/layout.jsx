import history from "history/hash";
import { onMount, useContext } from "solid-js";
import { MetaProvider, Title } from "@solidjs/meta";
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
  BottomNew,
  BottomSync,
} from "./bottom/index.js";
import { Overview } from "./overview/overview.jsx";
import { Profile } from "./profile/profile.jsx";
import styles from "./layout.module.css";

export function LayoutOverview() {
  return (
    <div
      className={
        styles.overview +
        " " +
        (store.record !== undefined ? styles.closed : styles.opened)
      }
    >
      <nav
        className={
          __BUILD_MODE__ === "android" ? styles.buttonbarbig : styles.buttonbar
        }
        title="navigationOverview"
      >
        <NavigationBack />

        <NavigationMenu />
      </nav>

      <Overview />

      <footer
        className={
          __BUILD_MODE__ === "android" ? styles.bottombig : styles.bottom
        }
      >
        <BottomCount />

        <BottomSync />

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
            <nav className={__BUILD_MODE__ === "android" ? styles.buttonbarbig : styles.buttonbar} title="navigationProfile">
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
      <MetaProvider>
        <Title>{"evenor – " + store.mind.name}</Title>
      </MetaProvider>

      <main className={styles.main}>
        <LayoutOverview />

        <LayoutProfile />
      </main>

      <span style={{ display: "none" }}>{__COMMIT_HASH__}</span>
    </StoreContext.Provider>
  );
}

export default App;
