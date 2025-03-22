import { onMount } from "solid-js";
import { StoreContext, store, onLaunch } from "@/store/index.js";
import styles from "./layout.module.css";
import { Overview } from "./overview/overview.jsx";
import { Profile } from "./profile/profile.jsx";

export function App() {
  onMount(onLaunch);

  return (
    <StoreContext.Provider value={{ store }}>
      <div class={styles.main}>
        <Overview />

        <Show when={store.record !== undefined} fallback={<></>}>
          <Profile />
        </Show>
      </div>
    </StoreContext.Provider>
  );
}

export default App;
