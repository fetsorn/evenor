import React, { useEffect, Suspense } from 'react';
import {
  HashRouter as Router,
  Routes,
  Route,
  useParams,
} from 'react-router-dom';
import { useStore } from '../store/index.js';
import { Header } from '../renderer/layout/header/index.js';
import { Overview } from '../renderer/layout/overview/index.js';
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

const ProfileSingleEdit = React.lazy(() => import('../renderer/layout/profile/components/profile_single_edit/index.js'));
const ProfileSingleView = React.lazy(() => import('../renderer/layout/profile/components/profile_single_view/index.js'));

function Page() {
  const { repoRoute } = useParams();

  const location = window.location;

  const [initialize, isEdit] = useStore((state) => [state.initialize,  state.isEdit]);

  useEffect(() => {
    initialize(repoRoute, location.search);
  }, []);

  
  return (
    <>
      <Header />

      <main className={styles.main}>
        <Overview />

		<Suspense>
      { isEdit ? (
        <ProfileSingleEdit />
      ) : (
        <ProfileSingleView />
      )}
    </Suspense>
      </main>

    </>
  );
}
