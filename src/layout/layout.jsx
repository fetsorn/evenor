import { onMount } from "solid-js";
import history from "history/hash";
import { StoreContext, store, onRepoChange } from "@/store/index.js";
import styles from "./layout.module.css";
import { Overview } from "./overview/overview.jsx";
import { Profile } from "./profile/profile.jsx";

export function App() {
  onMount(() =>
    onRepoChange(history.location.pathname, history.location.search),
  );

  return (
    <StoreContext.Provider value={{ store }}>
      {/*<h1>Hello world!</h1>*/}
      <div class={styles.main}>
        <Overview />

        <Show when={store.record !== undefined} fallback={<></>}>
          <Profile />
        </Show>
      </div>
      <span style={{ display: "none" }}>{__COMMIT_HASH__}</span>
    </StoreContext.Provider>
  );
}

export default App;
