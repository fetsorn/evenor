import { onMount } from "solid-js";
import { StoreContext, store, onLaunch } from "@/store/index.js";
import styles from "./layout.module.css";
import { Overview } from "./overview/overview.jsx";
import { Profile } from "./profile/profile.jsx";

import { Buffer } from "buffer";
window.Buffer = window.Buffer || Buffer;

export function App() {
  onMount(onLaunch);

  return (
    <StoreContext.Provider value={{ store }}>
      <h1>Hello world!</h1>
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
