import { useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "../../../";
import { paramsToObject, objectToParams } from "./panel";
import styles from "./Panel.module.css";
import { useTranslation } from "react-i18next";

interface IPanelProps {
  schema?: any;
  reloadPage?: any;
  options?: any;
}

export default function Panel({
  schema: rawSchema,
  reloadPage,
  options,
}: IPanelProps) {
  const [params, setParams]: any[] = useState({});
  const [selected, setSelected] = useState(undefined);
  const [searched, setSearched] = useState(undefined);
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const addQuery = async () => {
    if (searched) {
      const _params = { ...params, [selected]: searched };
      setParams(_params);
      await search(_params);
    }
  };

  const removeQuery = async (prop: any) => {
    const _params: any = { ...params };
    delete _params[prop];
    setParams(_params);
    await search(_params);
  };

  const search = async (_params: any) => {
    const searchParams = objectToParams(_params);

    /* console.log("search", params, searchParams, location.pathname); */
    navigate({
      pathname: location.pathname,
      search: "?" + searchParams.toString(),
    });

    await reloadPage(searchParams);
    /* navigate(0); */
  };

  const schema = useMemo(
    () =>
      rawSchema
        ? Object.keys(rawSchema).reduce(
            (acc, key) =>
              Object.prototype.hasOwnProperty.call(rawSchema[key], "parent") // without root of schema
                ? [...acc, { ...rawSchema[key], name: key }]
                : acc,
            []
          )
        : [],
    [rawSchema]
  );

  const notAddedFields = useMemo(
    () =>
      schema.filter(
        (item: any) => !Object.prototype.hasOwnProperty.call(params, item.name)
      ),
    [schema, params]
  );

  useEffect(() => {
    setSelected(notAddedFields?.[0]?.name);
  }, [rawSchema]);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const _params = paramsToObject(searchParams);
    setParams(_params);
    reloadPage(searchParams).catch(console.error);
  }, [location]);

  return (
    <div className={styles.panel}>
      <SearchBar />
      <QueryList />
    </div>
  );
}
