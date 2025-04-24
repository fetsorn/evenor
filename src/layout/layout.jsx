import history from "history/hash";
import { onMount, useContext } from "solid-js";
import { StoreContext, store, onRepoChange } from "@/store/index.js";
import {
  NavigationBack,
  NavigationAdd,
  NavigationRevert,
  NavigationSave,
} from "./components/index.js";
import { Overview } from "./overview/overview.jsx";
import { Profile } from "./profile/profile.jsx";
import { Filter } from "./filter/filter.jsx";
import styles from "./layout.module.css";

export function LayoutOverview() {
  return (
    <div className={styles.overview}>
      <div className={styles.buttonbar}>
        <NavigationBack />

        <span></span>

        <NavigationAdd />
      </div>

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
            <div className={styles.buttonbar}>
              <NavigationRevert />

              <span></span>

              <NavigationSave />
            </div>

            <Profile />
          </div>
        </div>
      </div>
    </Show>
  );
}

export function App() {
  onMount(() =>
    onRepoChange(history.location.pathname, history.location.search),
  );

  return (
    <StoreContext.Provider value={{ store }}>
      {/*<h1>Hello world!</h1>*/}
      <div className={styles.main}>
        <LayoutOverview />

        <LayoutProfile />
      </div>

      <span style={{ display: "none" }}>{__COMMIT_HASH__}</span>
    </StoreContext.Provider>
  );
}

export default App;
