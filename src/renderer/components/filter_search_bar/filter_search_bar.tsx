import { useEffect, useState, useMemo } from "react";

export default function SearchBar() {
  return (
    <div className={styles.search}>
      <SearchBarDropdown {...{ selected, value, notAddedFields }} />
      <SearchBarForm {...{ searched, selected, options }} />
      <SearchBarButton onSearch={addQuery} />
    </div>
  );
}
