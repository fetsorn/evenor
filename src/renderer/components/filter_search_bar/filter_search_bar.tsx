import React, { useEffect, useState } from "react";
import { SearchBarDropdown, SearchBarForm, SearchBarButton } from "..";
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
  return (
    <div className={styles.search}>
      <SearchBarDropdown {...{ notAddedFields, selected, onChangeSelected }} />

      <SearchBarForm {...{ isLoaded, selected, searched, onChangeSearched }} />

      <SearchBarButton {...{ onQueryAdd }} />
    </div>
  );
}
