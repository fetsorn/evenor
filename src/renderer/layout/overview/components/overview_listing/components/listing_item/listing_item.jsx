import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './listing_item.module.css';

export function ListingItem({
  data: listing,
  onEntrySelect,
  onEntryCreate,
  isLast,
  ...others
}) {
  const { t } = useTranslation();
  return (
    <section>
      <div>
        <div className={styles.date}>{listing.reponame}</div>
      </div>
    </section>
  );
}
