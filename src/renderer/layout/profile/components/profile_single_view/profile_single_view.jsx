import React from 'react';
import { useTranslation } from 'react-i18next';
import cn from 'classnames';
import { schemaRoot } from 'lib/api';
import {
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
    // onEntryCommit,
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
    // state.onEntryCommit,
    state.isSettings,
    state.schema,
  ]);

  const title = formatDate(group);

  const schema = isSettings ? schemaRoot : schemaRepo;
  console.log(entry);
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

              {/* {(isSettings || repoUUID === 'root') && ( */}
              {/*   <Button type="button" title={t('line.button.commit')} onClick={() => onEntryCommit(entry.UUID)}> */}
              {/*     ⬆️ */}
              {/*   </Button> */}
              {/* )} */}

              <Button type="button" title={t('line.button.delete')} onClick={onEntryDelete}>
                🗑️
              </Button>

              <Button type="button" title={t('line.button.close')} onClick={onEntryClose}>
                X
              </Button>
            </div>

            {repoUUID === 'root' && __BUILD_MODE__ !== 'server' && (
              <button type="button" title={t('line.button.edit')} onClick={() => setRepoName(entry.reponame)}>{t('line.button.open')}</button>
            )}
            <ViewField
              {...{
                entry,
                schema,
                isBaseObject: true,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
