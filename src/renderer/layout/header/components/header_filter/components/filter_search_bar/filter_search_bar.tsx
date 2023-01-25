import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { SearchBarDropdown, SearchBarForm } from "..";
import { Button } from "../../../../../../components";
import styles from "./filter_search_bar.module.css";

interface IFilterSearchBarProps {
  isLoaded: boolean;
  notAddedFields: any;
  searched: any;
  selected: any;
  onChangeSelected: any;
  onChangeSearched: any;
  onQueryAdd: any;
}

export default function FilterSearchBar({
  isLoaded,
  notAddedFields,
  searched,
  selected,
  onChangeSelected,
  onChangeSearched,
  onQueryAdd,
}: IFilterSearchBarProps) {
  const { t } = useTranslation();

  return (
    <div className={styles.search}>
      <SearchBarDropdown {...{ notAddedFields, selected, onChangeSelected }} />

      <SearchBarForm {...{ isLoaded, selected, searched, onChangeSearched }} />

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
