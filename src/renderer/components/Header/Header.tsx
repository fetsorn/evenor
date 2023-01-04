import styles from "./Header.module.css";

import { Panel } from "./components";

interface IHeaderProps {
  schema?: any;
  groupBy?: any;
  setGroupBy?: any;
  queryWorker?: any;
  options?: any;
  reloadPage?: any;
  exportPage?: any;
}

export default function Header(props: IHeaderProps) {
  const { schema, exportPage, groupBy, setGroupBy, options, reloadPage } =
    props;

  return (
    <header className={styles.header}>
      <ButtonBack />

      <LabelRepo />

      <Panel schema={schema} options={options} reloadPage={reloadPage} />

      <DropdownGroupBy
        groupBy={groupBy}
        setGroupBy={setGroupBy}
        schema={schema}
      />

      <ButtonExport onExport={exportPage} />
    </header>
  );
}
