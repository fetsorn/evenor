import React from 'react';
import { useTranslation } from 'react-i18next';
import { OverviewType, useStore } from '@/store';

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
      title={t('header.dropdown.search', { field: overviewType })}
      onChange={({ target: { value } }) => onChangeOverviewType(value)}
    >
      {(Object.keys(OverviewType)).map(
        (field, idx) => (
          <option key={idx} value={OverviewType[field]}>
            {field}
          </option>
        ),
      )}
    </select>
  );
}
