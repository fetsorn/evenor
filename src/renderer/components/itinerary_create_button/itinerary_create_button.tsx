import React from "react";
import { useTranslation } from "react-i18next";
import styles from "./itinerary_create_button.module.css";

interface IItineraryCreateButtonProps {
  onEntryCreate: any;
  date: any;
  index: any;
}

export default function ItineraryCreateButton({
  onEntryCreate,
  date,
  index,
}: IItineraryCreateButtonProps) {
  const { t } = useTranslation();

  return (
    <>
      <button
        className={styles.star}
        type="button"
        onClick={() => onEntryCreate(date, index)}
        title={t("line.button.add")}
        key="addevent"
      >
        +
      </button>
    </>
  );
}
