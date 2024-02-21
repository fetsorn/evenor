import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './overview_chat.module.css';
import { VirtualScroll } from '/src/renderer/components/virtual_scroll/virtual_scroll';
import { useStore } from '/src/renderer/store/store';
import {
  ChatItem
} from './components/chat_item/index';

export function OverviewChat() {
  const [itinerary, setItinerary] = useState([]);

  const { t } = useTranslation();

  const [
    entry,
    records,
    sortBy,
    onEntrySelect,
    onEntryCreate,
    onBatchSelect,
  ] = useStore((state) => [
    state.entry,
    state.records,
    state.sortBy,
    state.onEntrySelect,
    state.onEntryCreate,
    state.onBatchSelect,
  ]);

  const chatHistory = records.sort((a, b) => a[sortBy].localeCompare(b[sortBy]))

  return (
    <div className={styles.timeline}>
      {!records.length ? (
        <button
          className={styles.star}
          type="button"
          onClick={() => onEntryCreate('', '1')}
          title={t('line.button.add')}
          key="addevent"
        >
          +
        </button>
      ) : (
        <VirtualScroll
          {...{ onEntrySelect, onEntryCreate, onBatchSelect }}
          data={chatHistory}
          rowComponent={ChatItem}
        />
      )}
    </div>
  );
}
