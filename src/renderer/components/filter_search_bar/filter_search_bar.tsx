import React, { useEffect, useState } from "react";
import { SearchBarDropdown, SearchBarForm, SearchBarButton } from "..";
import styles from "./filter_search_bar.module.css";

interface IFilterSearchBarProps {
  notAddedFields: any;
  onQueryAdd: any;
}

export default function FilterSearchBar({
  notAddedFields,
  onQueryAdd,
}: IFilterSearchBarProps) {
  const [selected, setSelected] = useState(false);

  const [searched, setSearched] = useState(false);

  useEffect(() => {
    setSelected(notAddedFields?.[0]?.name);
  }, [notAddedFields]);

  return (
    <div className={styles.search}>
      <SearchBarDropdown {...{ selected, setSelected, notAddedFields }} />

      <SearchBarForm {...{ selected, searched, setSearched }} />

      <SearchBarButton {...{ onQueryAdd }} />
    </div>
  );
}
