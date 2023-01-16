import styles from "./header.module.css";

import {
  HeaderBackButton,
  HeaderFilter,
  HeaderGroupByDropdown,
  HeaderOverviewTypeDropdown,
} from "..";

interface IHeaderProps {
  isLoaded: boolean;
  schema: any;
  groupBy: any;
  onChangeGroupBy: any;
  overviewType: any;
  onChangeOverviewType: any;
  onChangeQuery: any;
}

export default function Header({
  isLoaded,
  schema,
  groupBy,
  onChangeGroupBy,
  overviewType,
  onChangeOverviewType,
  onChangeQuery,
}: IHeaderProps) {
  return (
    <header className={styles.header}>
      <HeaderBackButton />

      <HeaderOverviewTypeDropdown
        {...{
          overviewType,
          onChangeOverviewType,
        }}
      />

      <HeaderFilter {...{ isLoaded, schema, onChangeQuery }} />

      <HeaderGroupByDropdown {...{ schema, groupBy, onChangeGroupBy }} />
      <div></div>
    </header>
  );
}
