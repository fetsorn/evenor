import { createStore } from "solid-js/store";
import { StoreContext } from "@/store.js";
import styles from "./layout.module.css";
import { Overview } from "./overview/overview.jsx";
import { ProfileEdit } from "./profile_edit/profile_edit.jsx";
import { ProfileView } from "./profile_view/profile_view.jsx";

export function App() {
  const [store, setStore] = createStore({
    record: undefined,
    records: Array.from({ length: 30 }, (_, i) => `Item ${i}`),
  });

  return (
    <StoreContext.Provider value={{ store, setStore }}>
      <div class={styles.App}>
        <Overview />
        {store.isEdit ? <ProfileEdit /> : <ProfileView />}
      </div>
    </StoreContext.Provider>
  );
}

export default App;
