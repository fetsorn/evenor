import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./header.module.css";
import { useStore, queriesToParams } from "@/store";
import {
  Button
} from "@/components";
import {
  HeaderFilter,
  HeaderGroupByDropdown,
  HeaderOverviewTypeDropdown,
} from "./components";

export default function Header() {
  const { t } = useTranslation();

  const { repoRoute } = useParams();

  const navigate = useNavigate();

  const [
    queries,
    groupBy,
    overviewType,
    onQueries,
    isInitialized
  ] = useStore((state) => [
    state.queries,
    state.groupBy,
    state.overviewType,
    state.onQueries,
    state.isInitialized
  ])

  useEffect(() => {
    if (isInitialized) {
      const searchParams = queriesToParams(queries);

      if (groupBy !== "") {
        searchParams.set("groupBy", groupBy);
      }

      searchParams.set("overviewType", overviewType);

      navigate({
        pathname: location.pathname,
        search: "?" + searchParams.toString(),
      });
    }
  }, [queries, groupBy, overviewType])

  useEffect(() => {
    onQueries(repoRoute);
  }, [queries])

  return (
    <header className={styles.header}>
      <Button
        type="button"
        title={t("header.button.back")}
        onClick={() => navigate(-1)}
      >
        &lt;=
      </Button>

      <div className={styles.dropdowns}>
        <HeaderOverviewTypeDropdown />

        <HeaderGroupByDropdown />
      </div>

      <HeaderFilter />

      <div></div>

      <div></div>

      <div></div>
    </header>
  );
}
