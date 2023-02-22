import React, { useEffect } from 'react';
import {
  HashRouter as Router,
  Routes,
  Route,
  useLocation,
  useParams,
} from 'react-router-dom';
import styles from './root.module.css';
import { Header } from './header';
import { Overview } from './overview';
import { Profile } from './profile';
import { Footer } from './footer';
import { useStore } from '@/store';

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

  const location = useLocation();

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
