import React, { useEffect, Suspense } from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  useParams,
} from "react-router-dom";
import { useStore } from "../store/index.js";
import { Overview } from "./overview/index.js";
import styles from "./root.module.css";
import { API } from "../api";

export function Root() {
  return (
    <Router>
      <Routes>
        <Route index element={<Page />} />
        <Route path=":repoRoute" element={<Page />} />
      </Routes>
    </Router>
  );
}

const ProfileEdit = React.lazy(() => import("./profile_edit/index.js"));
const ProfileView = React.lazy(() => import("./profile_view/index.js"));

function Page() {
  const { repoRoute } = useParams();

  const location = window.location;

  const [initialize, isEdit] = useStore((state) => [
    state.initialize,
    state.isEdit,
  ]);

  useEffect(() => {
    initialize(repoRoute, location.search);
  }, []);

  return (
    <>
      <main className={styles.main}>
        <Overview />

        <Suspense>{isEdit ? <ProfileEdit /> : <ProfileView />}</Suspense>
      </main>
    </>
  );
}
