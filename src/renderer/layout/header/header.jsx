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
    repoUUID,
    setRepoRoute,
    onSettingsOpen,
  ] = useStore((state) => [
    state.queries,
    state.groupBy,
    state.overviewType,
    state.onQueries,
    state.isInitialized,
    state.repoUUID,
    state.setRepoRoute,
    state.onSettingsOpen,
  ]);

  // useEffect(() => {
  // TODO: fix
  // if (isInitialized && __BUILD_MODE__ !== "electron") {
  //   const searchParams = queriesToParams(queries);

  //   if (groupBy !== "") {
  //     searchParams.set("groupBy", groupBy);
  //   }

  //   searchParams.set("overviewType", overviewType);

  //   let pathname = repoRoute;

  //   if (repoRoute === "store/root" || repoRoute === "store/view") {
  //     pathname = "/";
  //   } else {
  //     pathname = "/" + repoRoute.replace(/^repos\, '')
  //   }

  //   navigate({
  //     pathname,
  //     search: "?" + searchParams.toString(),
  //   });
  // }
  // }, [queries, groupBy, overviewType, repoRoute]);

  useEffect(() => {
    onQueries();
  }, [queries, repoUUID]);

  return (
    <header className={styles.header}>
      { repoUUID !== 'view'
         && repoUUID !== 'root'
        ? (
          <Button
            type="button"
            title={t('header.button.back')}
            onClick={() => setRepoRoute('store/root')}
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

      { repoUUID !== 'root' && repoUUID !== 'view' && (
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
