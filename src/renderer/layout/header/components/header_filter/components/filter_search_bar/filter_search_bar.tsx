import React from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SearchBarDropdown, SearchBarForm } from "..";
import { Button } from "../../../../../../components";
import styles from "./filter_search_bar.module.css";
import { useStore } from "../../../../../../store";
import { useFilterStore } from "../../header_filter_store";

interface IFilterSearchBarProps {
  notAddedFields: any;
}

export default function FilterSearchBar({ notAddedFields }: IFilterSearchBarProps) {
  const { t } = useTranslation();

  const { repoRoute } = useParams();

  const onChangeQuery = useStore((state) => state.onChangeQuery)

  const onQueryAdd = useFilterStore((state) => state.onQueryAdd)

  return (
    <div className={styles.search}>
      <SearchBarDropdown {...{notAddedFields}} />

      <SearchBarForm />

      <Button
        type="button"
        title={t("header.button.search")}
        onClick={() => onQueryAdd(repoRoute, onChangeQuery)}
      >
        🔎
      </Button>
    </div>
  );
}
