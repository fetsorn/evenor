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
    overview,
    sortBy,
    onEntrySelect,
    onEntryCreate,
    onBatchSelect,
  ] = useStore((state) => [
    state.entry,
    state.overview,
    state.sortBy,
    state.onEntrySelect,
    state.onEntryCreate,
    state.onBatchSelect,
  ]);

  const chatHistory = overview.sort((a, b) => a[sortBy].localeCompare(b[sortBy]))

  console.log(chatHistory)

  return (
    <div className={styles.timeline}>
      {!overview.length ? (
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
