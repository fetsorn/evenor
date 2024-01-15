import React from 'react';
import cn from 'classnames';
import { useTranslation } from 'react-i18next';
import styles from './chat_item.module.css';
import { useWindowSize } from '../../../../../../../components/index.js';

export function ChatItem({
  data: entry,
  onEntrySelect,
  onEntryCreate,
  isLast,
  ...others
}) {
  const { t } = useTranslation();

  const { width: viewportHeight } = useWindowSize();
  return (
    <section className={styles.row} {...others} style={{ height: (viewportHeight / 10) + (entry.datum.length / 80 * 10) }}>
      {entry.actdate}
      <div className={entry.actname === "you" ? styles.left : styles.right}>
        {entry.datum} {entry.category}
      </div>
    </section>
  );
}
