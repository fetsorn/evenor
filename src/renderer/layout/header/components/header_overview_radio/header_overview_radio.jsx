import React from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '@/store/index.js';
import styles from './header_overview_radio.module.css';

export function HeaderOverviewRadio() {
  const { t } = useTranslation();

  const [
    onChangeOverviewType,
  ] = useStore((state) => {
    return [
      state.onChangeOverviewType,
    ]
  });

  return (
    <div className={styles.container}>
      <label
        htmlFor="radio_itinerary"
        title={t('header.button.itinerary')}
        className={styles.radiobutton}
      >
        <input
          type="radio"
          id="radio_itinerary"
          name="overview_type"
          value="itinerary"
          onChange={({ target: { value } }) => onChangeOverviewType(value)}
        />
        {/* dango 🍡 grapes 🍇 corn 🌽 herb 🌿 cactus 🌵 wood 🪵 seedling 🌱 */}
        {/* ladder 🪜 vertical traffic light 🚦 clock 🕔 */}
        {/* yarn 🧶 level slider 🎚 chains ⛓ infinity ♾ */}
        🌿
      </label>
      <label
        htmlFor="radio_graph"
        title={t('header.button.graph')}
        className={styles.radiobutton}
      >
        <input
          type="radio"
          id="radio_graph"
          name="overview_type"
          value="graph"
          onChange={({ target: { value } }) => onChangeOverviewType(value)}
        />
        🌳
      </label>
      <label
        htmlFor="radio_book"
        title={t('header.button.book')}
        className={styles.radiobutton}
      >
        <input
          type="radio"
          id="radio_book"
          name="overview_type"
          value="listing"
          onChange={({ target: { value } }) => onChangeOverviewType(value)}
        />
        {/* open book 📖 closed book 📕 green book 📗 blue book 📘 orange book 📙 books 📚 */}
        📗
      </label>
    </div>
  );
}
