import React, { Suspense } from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  // useParams,
} from "react-router-dom";
import { Overview } from "./overview/index.js";
import styles from "./root.module.css";

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

const Profile = React.lazy(() => import("./profile/index.js"));

function Page() {
  return (
    <>
      <main className={styles.main}>
        <Overview />

        <Suspense>
          <Profile />
        </Suspense>
      </main>
    </>
  );
}
