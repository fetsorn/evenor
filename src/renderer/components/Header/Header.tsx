import styles from "./header.module.css";

import { HeaderBackButton, HeaderFilter, HeaderExportButton } from "..";

/* interface IHeaderProps {
 *   schema?: any;
 *   groupBy?: any;
 *   setGroupBy?: any;
 *   setOverview?: any;
 * } */

export default function Header() {
  return (
    <header className={styles.header}>
      <HeaderBackButton />

      <HeaderFilter />

      <div></div>
    </header>
  );
}
