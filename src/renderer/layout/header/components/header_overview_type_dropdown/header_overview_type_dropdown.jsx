import React from 'react';
import { useTranslation } from 'react-i18next';
import { OverviewType, useStore } from '@/store/index.js';

export function HeaderOverviewTypeDropdown() {
  const { t } = useTranslation();

  const [
    overviewType,
    onChangeOverviewType,
  ] = useStore((state) => [
    state.overviewType,
    state.onChangeOverviewType,
  ]);

  return (
    <select
      name="HeaderOverviewTypeDropdown"
      value={overviewType}
      title={t('header.dropdown.overview', { field: overviewType })}
      onChange={({ target: { value } }) => onChangeOverviewType(value)}
    >
      {(Object.keys(OverviewType)).map(
        (field, idx) => (
          <option key={`overviewType${Math.random()}`} value={OverviewType[field]}>
            {field}
          </option>
        ),
      )}
    </select>
  );
}
