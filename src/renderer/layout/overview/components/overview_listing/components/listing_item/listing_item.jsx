import React from 'react';
import cn from 'classnames';
import { useTranslation } from 'react-i18next';
import styles from './itinerary_waypoint.module.css';

// TODO: replace with Day.js
function isDate(title) {
  return true;
}

// TODO: replace with Day.js
function formatDate(title) {
  return title;
}

export function listingItem({
  data: waypoint,
  onEntrySelect,
  onEntryCreate,
  isLast,
  ...others
}) {
  const { t } = useTranslation();
  return (
    <section className={cn(styles.row, { [styles.last]: isLast })} {...others}>
      <div>
        {isDate(waypoint.date) ? ( // try to parse as date, otherwise render as is
          <time className={styles.date} dateTime={listing.date.slice(1, -1)}>
            {formatDate(listing.date)}
          </time>
        ) : (
          <div className={styles.date}>{listing.date}</div>
        )}

        <button
          className={styles.add}
          type="button"
          onClick={() => onEntryCreate(listing.date, listing.events.length + 1)}
          title={t('line.button.add')}
          key="addevent"
        >
          +
        </button>
      </div>

    </section>
  );
}
