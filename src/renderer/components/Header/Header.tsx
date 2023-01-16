import styles from "./header.module.css";

import { HeaderBackButton, HeaderFilter, HeaderExportButton } from "..";

interface IHeaderProps {
  schema?: any;
  /* groupBy?: any;
   * setGroupBy?: any;
   * setOverview?: any; */
}

export default function Header({ schema }: IHeaderProps) {
  return (
    <header className={styles.header}>
      <HeaderBackButton />

      <HeaderFilter {...{ schema }} />

      <div></div>
    </header>
  );
}
