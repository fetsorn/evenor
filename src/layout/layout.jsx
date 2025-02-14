import { StoreContext, store } from "@/store.js";
import styles from "./layout.module.css";
import { Overview } from "./overview/overview.jsx";
import { Profile } from "./profile/profile.jsx";

export function App() {
  return (
    <StoreContext.Provider value={{ store }}>
      <div class={styles.main}>
        <Overview />
        <Profile />
      </div>
    </StoreContext.Provider>
  );
}

export default App;
