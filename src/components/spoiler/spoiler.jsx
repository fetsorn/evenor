import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { create } from "zustand";

const useSpoilerStore = create()((set, get) => ({
  mapIsOpen: {},

  isOpen: (index) => {
    const { mapIsOpen } = get();

    return mapIsOpen[index];
  },

  setIsOpen: (index, isOpen) => {
    const { mapIsOpen } = get();

    set({ mapIsOpen: { ...mapIsOpen, [index]: isOpen } });
  },
}));

export function Spoiler({
  index,
  title,
  description,
  children,
  onRemove,
  isIgnored,
  isOpenDefault = false,
  ...other
}) {
  const { t } = useTranslation();

  const [isOpen, setIsOpen] = useSpoilerStore((state) => [
    state.isOpen,
    state.setIsOpen,
  ]);

  if (isOpen(index) === undefined) {
    setIsOpen(index, isOpenDefault);
  }

  function open() {
    setIsOpen(index, true);
  }

  function close() {
    setIsOpen(index, false);
  }

  if (isIgnored) {
    return <div>{children}</div>;
  }

  return isOpen(index) ? (
    <div key={`${index}-spoiler`}>
      <button type="button" onClick={close}>
        🔽️
      </button>

      {description}

      {onRemove && (
        <button
          type="button"
          title={t("line.button.remove", { field: title })}
          onClick={() => onRemove()}
        >
          X
        </button>
      )}

      {children}
    </div>
  ) : (
    <div>
      <button type="button" onClick={open}>
        ▶️
      </button>

      {description}

      {onRemove && (
        <button
          type="button"
          title={t("line.button.remove", { field: title })}
          onClick={() => onRemove()}
        >
          X
        </button>
      )}
    </div>
  );
}
