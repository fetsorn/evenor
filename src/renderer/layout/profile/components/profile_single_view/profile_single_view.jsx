import React from 'react';
import { useTranslation } from 'react-i18next';
import cn from 'classnames';
import { manifestRoot } from 'lib/api';
import {
  AssetView,
  Button,
  Title,
} from '@/components/index.js';
import { useStore } from '@/store/index.js';
import {
  ViewField,
} from './components/index.js';
import styles from './profile_single_view.module.css';

// TODO: replace with Day.js
function isDate(title) {
  return true;
}

// TODO: replace with Day.js
function formatDate(title) {
  return isDate(title) ? title : title;
}

export function ProfileSingleView() {
  const { t } = useTranslation();

  const [
    entry,
    group,
    index,
    repoUUID,
    setRepoName,
    onEntryEdit,
    onEntryClose,
    onEntryDelete,
    isSettings,
    schemaRepo,
  ] = useStore((state) => [
    state.entry,
    state.group,
    state.index,
    state.repoUUID,
    state.setRepoName,
    state.onEntryEdit,
    state.onEntryClose,
    state.onEntryDelete,
    state.isSettings,
    state.schema,
  ]);

  const title = formatDate(group);

  const schema = isSettings ? JSON.parse(manifestRoot) : schemaRepo;

  return (
    <div className={cn(styles.sidebar, { [styles.invisible]: !entry })}>
      {entry && (
        <div className={styles.container}>
          <div id="scrollcontainer" className={styles.sticky}>
            <Title>
              {title}
              {' '}
              {index}
            </Title>

            <div className={styles.buttonbar}>
              <Button type="button" title={t('line.button.edit')} onClick={onEntryEdit}>
                ✏️
              </Button>

              <Button type="button" title={t('line.button.delete')} onClick={onEntryDelete}>
                🗑️
              </Button>

              <Button type="button" title={t('line.button.close')} onClick={onEntryClose}>
                X
              </Button>
            </div>

            {repoUUID === 'root' && (
              <a onClick={() => setRepoName(entry.reponame)}>{entry.reponame}</a>
            )}

            <ViewField
              {...{
                entry,
                schema,
                isBaseObject: true,
              }}
            />

            <AssetView filepath={entry?.FILE_PATH} />
          </div>
        </div>
      )}
    </div>
  );
}
