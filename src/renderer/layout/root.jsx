import React, { useEffect } from 'react';
import {
  HashRouter as Router,
  Routes,
  Route,
  useParams,
} from 'react-router-dom';
import { useStore } from '@/store/index.js';
import { Header } from './header/index.js';
import { Overview } from './overview/index.js';
import { Profile } from './profile/index.js';
import { Footer } from './footer/index.js';
import styles from './root.module.css';

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

function Page() {
  const { repoRoute } = useParams();

  const location = window.location;

  const initialize = useStore((state) => state.initialize);

  useEffect(() => {
    initialize(repoRoute, location.search);
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
