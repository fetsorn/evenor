import React from 'react';
import cn from 'classnames';
import { useTranslation } from 'react-i18next';
import { create } from 'zustand';
import { manifestRoot } from 'lib/api';
import {
  AssetView,
  Button,
  Title,
} from '@/components';
import { useStore } from '@/store';
import {
  EditInput,
} from './components';
import styles from './profile_single_edit.module.css';

// TODO: replace with Day.js
function isDate(title) {
  return true;
}

// TODO: replace with Day.js
function formatDate(title) {
  return isDate(title) ? title : title;
}

export const useEditStore = create()((set, get) => ({
  mapIsOpen: {},
  openIndex: (index, isOpen) => {
    const { mapIsOpen } = get();

    mapIsOpen[index] = isOpen;

    set({ mapIsOpen });
  },
}));

export function ProfileSingleEdit() {
  const { t } = useTranslation();

  const [
    entry,
    group,
    index,
    isSettings,
    onEntryRevert,
    onEntrySave,
    onEntryChange,
  ] = useStore((state) => [
    state.entry,
    state.group,
    state.index,
    state.isSettings,
    state.onEntryRevert,
    state.onEntrySave,
    state.onEntryChange,
  ]);

  const schema = isSettings ? JSON.parse(manifestRoot) : useStore((state) => state.schema);

  const title = formatDate(group);

  return (
    <div className={cn(styles.sidebar, { [styles.invisible]: !entry })}>
      {entry && schema && (
        <div className={styles.container}>
          <div id="scrollcontainer" className={styles.sticky}>
            <Title>
              {title}
              {' '}
              {index}
            </Title>

            <div className={styles.buttonbar}>
              <Button type="button" title={t('line.button.save')} onClick={() => onEntrySave()}>
                💾
              </Button>

              <Button type="button" title={t('line.button.revert')} onClick={onEntryRevert}>
                ↩
              </Button>
            </div>

            <EditInput
              {...{
                index: entry.UUID,
                entry,
                schema,
                onFieldChange: onEntryChange,
                isBaseObject: true,
              }}
            />

            <AssetView filepath={entry?.FILE_PATH} />
          </div>
        </div>
      )}
    </div>
  );
}
