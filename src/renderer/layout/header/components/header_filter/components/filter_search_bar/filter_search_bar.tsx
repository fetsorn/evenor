import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { SearchBarDropdown, SearchBarForm } from "..";
import { Button } from "../../../../../../components";
import styles from "./filter_search_bar.module.css";

export default function FilterSearchBar() {
  const { t } = useTranslation();

  return (
    <div className={styles.search}>
      <SearchBarDropdown />

      <SearchBarForm />

      <Button
        type="button"
        title={t("header.button.search")}
        onClick={onQueryAdd}
      >
        🔎
      </Button>
    </div>
  );
}
