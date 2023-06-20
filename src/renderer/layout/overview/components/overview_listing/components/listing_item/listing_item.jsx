import React from 'react';
import cn from 'classnames';
import { useTranslation } from 'react-i18next';
import styles from './itinerary_waypoint.module.css';

export function listingItem({
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
