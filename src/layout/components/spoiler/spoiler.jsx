import React from "react";
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
    <span key={`${index}-spoiler`}>
      <a onClick={close}>{description}:</a>

      {children}
    </span>
  ) : (
    <a onClick={open}>{description}...</a>
  );
}
