import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './header.module.css';
import { useStore } from '@/store/index.js';
import {
  Button,
} from '@/components/index.js';
import {
  HeaderFilter,
  HeaderOverviewRadio,
} from './components/index.js';

export function Header() {
  const { t } = useTranslation();

  const [
    onChangeOverviewType,
    isView,
    repoUUID,
    repoName,
    setRepoUUID,
    onSettingsOpen,
  ] = useStore((state) => [
    state.onChangeOverviewType,
    state.isView,
    state.repoUUID,
    state.repoName,
    state.setRepoUUID,
    state.onSettingsOpen,
  ]);

  function onHome(overviewType) {
    if (onChangeOverviewType !== ('itinerary')) {
        overviewType = 'listing'; 
    }

    setRepoUUID('root');
    return overviewType; 
}

  return (
    <header className={styles.header}>
      { (!isView)
         && repoUUID !== 'root'
        ? (
          <Button
            type="button"
            title={t('header.button.back')}
            onClick={() => {
                onHome()}}
          >
            {/* &lt;= */}
            🏠
            {repoName}
          </Button>
        )
        : <div />}

      <HeaderOverviewRadio />

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
