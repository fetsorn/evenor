import styles from "./header.module.css";

import {
  HeaderBackButton,
  HeaderFilter,
  HeaderGroupbyDropdown,
  HeaderExportButton,
} from "..";

interface IHeaderProps {
  schema?: any;
  groupBy?: any;
  setGroupBy?: any;
  setOverview?: any;
}

export default function Header({
  schema,
  groupBy,
  setGroupBy,
  setOverview,
}: IHeaderProps) {
  return (
    <header className={styles.header}>
      <HeaderBackButton />

      <HeaderFilter {...{ schema }} />

      <HeaderGroupbyDropdown {...{ groupBy, setGroupBy, schema }} />
    </header>
  );
}
