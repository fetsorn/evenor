import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './listing_item.module.css';
import { useStore } from '@/store/index.js';

export function ListingItem({
  data: listing,
  onEntrySelect,
  onEntryCreate,
  isLast,
  ...others
}) {
  const { t } = useTranslation();

  const [
    entry,
    repoUUID,
    setRepoName,
  ] = useStore((state) => [
    state.entry,
    state.repoUUID,
    state.setRepoName,
  ]);

  return (
    <section>
      <div>
        <div className={styles.date}>{listing.reponame}
          <button
            className={styles.star}
            type="button"
            onClick={() => onEntrySelect(listing)}
            title={listing?.FILE_PATH}
            id={listing?.UUID}
          >
          </button>
          {repoUUID === 'root' && __BUILD_MODE__ !== 'server' && (
            <button
              type="button"
              title={t('line.button.open')}
              onClick={() => setRepoName(listing.reponame)}
            >
              {t('line.button.open')}
            </button>
          )}
		  <button
          className={styles.add}
          type="button"
          onClick={() => onEntryCreate()}
          title={t('line.button.add')}
          key="addevent"
        >
          +
        </button>
        </div>
      </div>
    </section>
  );
}
