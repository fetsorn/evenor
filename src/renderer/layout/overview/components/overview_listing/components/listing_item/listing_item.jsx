import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './listing_item.module.css';
import { useStore } from '@/store/index.js';
import {
	Button,
  } from '@/components/index.js';
import cn from 'classnames';

export function ListingItem({
  data: listing,
  onEntrySelect,
  onEntryCreate,
  isLast,
  ...others
}) {
  const { t } = useTranslation();

  const [
    repoUUID,
    setRepoName,
	onEntryEdit,
  ] = useStore((state) => [
    state.repoUUID,
    state.setRepoName,
	state.onEntryEdit,
  ]);

  const addFirstTooltip = repoUUID === 'root'? t('line.button.add-project') : t('line.button.add')
  
  const {key:_, ...listingWithoutkey} = listing

  return (
    <section>
      <div>
        <div className={styles.date}>{listing.reponame}
          <button
            className={styles.star}
            type="button"
            onClick={() => onEntrySelect(listingWithoutkey)}
            title={listingWithoutkey?.FILE_PATH}
            id={listingWithoutkey?.UUID}
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
          title={addFirstTooltip}
          key="addevent"
        >
          +
        </button>
		<div className={cn(styles.buttonbar,'view-sidebar__btn-bar')}>
			<Button type="button" title={t('line.button.edit')} onClick={() => onEntryEdit(listingWithoutkey)}>
                ✏️
              </Button>
			  </div>
        </div>
      </div>
    </section>
  );
}
