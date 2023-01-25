import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import styles from "./header.module.css";
import {
  Button
} from "../../components";
import {
  HeaderFilter,
  HeaderGroupByDropdown,
  HeaderOverviewTypeDropdown,
} from "./components";

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
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <header className={styles.header}>
      <Button
        type="button"
        title={t("header.button.back")}
        onClick={() => navigate(-1)}
      >
        &lt;=
      </Button>

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
