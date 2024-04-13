import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { create } from "zustand";

const useSpoilerStore = create()((set, get) => ({
  mapIsOpen: { _: true },

  openIndex: (index, isOpen) => {
    const { mapIsOpen } = get();

    mapIsOpen[index] = isOpen;

    set({ mapIsOpen });
  },
}));

export function Spoiler({ index, title, description, children, onRemove }) {
  const { t } = useTranslation();

  const [mapIsOpen, openIndex] = useSpoilerStore((state) => [
    state.mapIsOpen,
    state.openIndex,
  ]);

  const [isOpen, setIsOpen] = useState(mapIsOpen[index]);

  function open() {
    openIndex(index, true);

    setIsOpen(true);
  }

  function close() {
    openIndex(index, false);

    setIsOpen(false);
  }

  return isOpen ? (
    <div key={`${index}spoiler`}>
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
