import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { FilterSearchBar, FilterQueryList } from "..";
import { paramsToObject, objectToParams } from "./tbn";
import styles from "./header_filter.module.css";

interface IHeaderFilterProps {
  schema?: any;
}

export default function HeaderFilter({
  schema: rawSchema,
}: IHeaderFilterProps) {
  const [params, setParams]: any[] = useState({});
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  function onQueryAdd(_selected: string, _searched: string) {
    if (_searched) {
      const _params = { ...params, [_selected]: _searched };
      setParams(_params);
    }
  }

  function onQueryRemove(_removed: string) {
    const _params: any = { ...params };
    delete _params[_removed];
    setParams(_params);
  }

  async function search(_params: any) {
    const searchParams = objectToParams(_params);

    navigate({
      pathname: location.pathname,
      search: "?" + searchParams.toString(),
    });
  }

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
    search(params);
  }, []);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const _params = paramsToObject(searchParams);
    setParams(_params);
  }, [location]);

  return (
    <div className={styles.panel}>
      <FilterSearchBar {...{ notAddedFields, onQueryAdd }} />

      <FilterQueryList {...{ params, onQueryRemove }} />
    </div>
  );
}
