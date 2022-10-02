import { useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "../../../";
import { paramsToObject, objectToParams } from "./utils";
import styles from "./Panel.module.css";
import { useTranslation } from "react-i18next";

interface IPanelProps {
  schema?: any;
  reloadPage?: any;
  options?: any;
}

const Panel = ({ schema: rawSchema, reloadPage, options }: IPanelProps) => {
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
  }, []);

  return (
    <div className={styles.panel}>
      <div className={styles.search}>
        {/* <label htmlFor="fields">Choose a prop:</label> */}
        <select
          name="fields"
          value={selected}
          title={t("header.dropdown.search", { field: selected })}
          onChange={({ target: { value } }) => setSelected(value)}
        >
          {notAddedFields.map((field: any, idx: any) => (
            <option key={idx} value={field.name}>
              {field.name}
            </option>
          ))}
        </select>
        <form className={styles.form}>
          <input
            className={styles.input}
            type="text"
            list={`panel_list`}
            value={searched}
            onChange={({ target: { value } }) => {
              setSearched(value);
            }}
          />
          <datalist id={`panel_list`}>
            {options[selected]?.map((option: any, idx: any) => (
              <option key={idx} value={option}></option>
            ))}
          </datalist>
        </form>
        <Button
          type="button"
          title={t("header.button.search")}
          onClick={addQuery}
        >
          🔎
        </Button>
      </div>
      <div className={styles.query}>
        {Object.keys(params).map((prop: any, idx: any) => (
          <div key={idx} className={styles.queries}>
            <div>
              {prop} {params[prop]}
            </div>
            <div
              title={t("header.button.remove", { field: prop })}
              onClick={() => removeQuery(prop)}
            >
              X
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Panel;
