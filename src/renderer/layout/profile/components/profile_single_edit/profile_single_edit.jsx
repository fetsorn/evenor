import React from 'react';
import cn from 'classnames';
import { useTranslation } from 'react-i18next';
import { create } from 'zustand';
import { schemaRoot } from 'lib/api';
import {
  AssetView,
  Button,
  Title,
} from '@/components/index.js';
import { useStore } from '@/store/index.js';
import {
  EditInput,
} from './components/index.js';
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

  const schema = isSettings ? schemaRoot : useStore((state) => state.schema);


  const title = formatDate(group);

  return (
    <div className={cn(styles.sidebar, { [styles.invisible]: !entry }, "profile-edit__sidebar edit-sidebar" )}>
      {entry && schema && (
        <div className={cn(styles.container, "edit-sidebar__container")}>
          <div id="scrollcontainer" className={cn(styles.sticky, "edit-sidebar__sticky")}>
            <Title>
              {title}
              {' '}
              {index}
            </Title>

            <div className={cn( styles.buttonbar,'edit-sidebar__btn-bar')}>
              <Button type="button" title={t('line.button.save')} onClick={() => onEntrySave()}>
                💾
              </Button>

              <Button  type="button" title={t('line.button.revert')} onClick={onEntryRevert}>
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
          </div>
        </div>
      )}
    </div>
  );
}
