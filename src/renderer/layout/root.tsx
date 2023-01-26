import React, { useEffect } from "react";
import { HashRouter as Router, Routes, Route, useLocation, useParams } from "react-router-dom";
import styles from "./root.module.css";
import { default as Header } from "./header";
import { default as Overview } from "./overview";
import { default as Profile } from "./profile";
import { default as Footer } from "./footer";
import { useStore } from "../store";

export default function Root() {
  return (
    <Router>
      <Routes>
        <Route index element={<Page />} />
        <Route path=":repoRoute" element={<Page />} />
      </Routes>
    </Router>
  );
}

function Page() {
  const { repoRoute } = useParams();

  const location = useLocation();

  const onLocation = useStore((state) => state.onLocation)

  const onFirstRender = useStore((state) => state.onFirstRender)

  useEffect(() => {
    onLocation(location.search);
  }, [location]);

  useEffect(() => {
    onFirstRender(repoRoute, location.search);
  }, []);

  return (
    <>
      <Header />

      <main className={styles.main}>
        <Overview />

        <Profile />
      </main>

      <Footer />
    </>
  );
}
