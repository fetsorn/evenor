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

export default function Header() {
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

      <HeaderOverviewTypeDropdown />

      <HeaderFilter />

      <HeaderGroupByDropdown />

      <div></div>
    </header>
  );
}
