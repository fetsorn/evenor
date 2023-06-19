import React from 'react';
import cn from 'classnames';
import { useTranslation } from 'react-i18next';
import styles from './itinerary_waypoint.module.css';
import { WaypointEntries } from '/src/renderer/layout/overview/components/overview_itinerary/components/index';

export function listingItem({
  data: listing,
  onEntrySelect,
  onEntryCreate,
  isLast,
  ...others
}) {
  const { t } = useTranslation();
  return (
    <section className={cn} {...others}>
      <div>
        AAaaaa
      </div>
    </section>
  );
}
