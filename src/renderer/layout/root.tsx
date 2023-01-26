import React, { useEffect, useState } from "react";
import { HashRouter as Router, Routes, Route, useNavigate, useLocation, useParams } from "react-router-dom";
import styles from "./root.module.css";
import { default as Header } from "./header";
import { default as Overview } from "./overview";
import { default as Profile } from "./profile";
import { default as Footer } from "./footer";

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
