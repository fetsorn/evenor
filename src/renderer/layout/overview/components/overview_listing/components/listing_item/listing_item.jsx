import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './listing_item.module.css';
import { useStore } from '@/store/index.js';
import {
	Button,
  } from '@/components/index.js';
import cn from 'classnames';
import { groupBy } from 'telegram/Helpers';

export function ListingItem({
  data: listing,
  onEntrySelect,
  onEntryCreate,
  isLast,
  ...others
}) {
  const {i18n, t } = useTranslation();

  const [
    repoUUID,
    setRepoName,
	onEntryEdit,
	groupBy,
	schema,
  ] = useStore((state) => [
    state.repoUUID,
    state.setRepoName,
	state.onEntryEdit,
	state.groupBy,
	state.schema,
  ]);

  const addFirstTooltip = repoUUID === 'root'? t('line.button.add-project') : t('line.button.add')

  const groupByField = listing[groupBy]

  const isObject = typeof groupByField == "object"

  const listingLabel = isObject ? groupByField.UUID : groupByField
  
  const {key:_, ...listingWithoutkey} = listing

  const lang = i18n.resolvedLanguage;


  function listingFortext(listing) {
	const keys = Object.keys(listing)

	const keysWithoutnames = keys.filter((branch) => (branch !== "_" && branch !== "UUID" && branch !== "key"))

	const textPairs = keysWithoutnames.map((branch) => {

		const description = schema?.[branch]?.description?.[lang] ?? branch;
		
		const value = listing[branch]
		
		const textPair = `${description}:${value}`
		return textPair
	})	
	const text = textPairs.join(", ")
	return text
  }

  const selectTooltip = listingFortext(listing)

  return (
    <section>
      <div>
        <div className={styles.date}>
			{listingLabel}
          <button
            className={styles.star}
            type="button"
            onClick={() => onEntrySelect(listingWithoutkey)}
            title={selectTooltip}
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
