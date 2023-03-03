import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styles from './header.module.css';
import { useStore, queriesToParams } from '@/store/index.js';
import {
  Button,
} from '@/components/index.js';
import {
  HeaderFilter,
  HeaderBaseDropdown,
  HeaderGroupByDropdown,
  HeaderOverviewTypeDropdown,
} from './components/index.js';

export function Header() {
  const { t } = useTranslation();

  const navigate = useNavigate();

  const [
    queries,
    groupBy,
    overviewType,
    onQueries,
    isInitialized,
    isView,
    repoUUID,
    repoName,
    setRepoUUID,
    onSettingsOpen,
  ] = useStore((state) => [
    state.queries,
    state.groupBy,
    state.overviewType,
    state.onQueries,
    state.isInitialized,
    state.isView,
    state.repoUUID,
    state.repoName,
    state.setRepoUUID,
    state.onSettingsOpen,
  ]);

  useEffect(() => {
    // eslint-disable-next-line
    if (isInitialized && __BUILD_MODE__ !== 'electron') {
      const searchParams = queriesToParams(queries);

      // if (groupBy !== '') {
      //   searchParams.set('.', groupBy);
      // }

      // searchParams.set('overviewType', overviewType);

      const pathname = repoName === undefined ? '/' : `/${repoName}`;

      navigate({
        pathname,
        search: `?${searchParams.toString()}`,
      });
    }
  }, [queries, groupBy, overviewType, repoName]);

  useEffect(() => {
    onQueries();
  }, [queries, repoUUID]);

  return (
    <header className={styles.header}>
      { (!isView)
         && repoUUID !== 'root'
        ? (
          <Button
            type="button"
            title={t('header.button.back')}
            onClick={() => setRepoUUID('root')}
          >
            {/* &lt;= */}
            🏠
          </Button>
        )
        : <div />}

      <div className={styles.dropdowns}>
        <HeaderOverviewTypeDropdown />

        <HeaderBaseDropdown />

        <HeaderGroupByDropdown />
      </div>

      <HeaderFilter />

      <div />

      { repoUUID !== 'root' && (!isView) && (
        <Button
          type="button"
          title={t('header.button.back')}
          onClick={onSettingsOpen}
        >
          ⚙️
        </Button>
      )}

    </header>
  );
}
