import { Button } from "../";
import { useNavigate } from "react-router-dom";
import styles from "./Header.module.css";
import { useTranslation } from "react-i18next";

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

const Header = (props: IHeaderProps) => {
  const { schema, exportPage, groupBy, setGroupBy, options, reloadPage } =
    props;

  const navigate = useNavigate();
  const { t } = useTranslation();
  /* const [formToken, setToken] = useState(""); */
  /* const [showPrompt, setShowPrompt] = useState(false); */
  /* const [callback, setCallback] = useState<(token: string) => Promise<void>>(
   *   () => async () => {
   *     return;
   *   }
   * ); */

  /* const pull = async () => {
   *   setCallback(
   *     () => async (token: string) => await gitpull(window.dir, token)
   *   );
   *   setShowPrompt(true);
   *   await reloadPage();
   * };

   * const commit = async () => {
   *   await gitcommit(window.dir);
   * };

   * const push = async () => {
   *   setCallback(
   *     () => async (token: string) => await gitpush(window.dir, token)
   *   );
   *   setShowPrompt(true);
   * }; */

  return (
    <header className={styles.header}>
      {/* {showPrompt && (
              <form>
              <div>
              <input
              className={styles.input}
              type="password"
              value={formToken}
              placeholder="token"
              onChange={(e) => setToken(e.target.value)}
              />
              </div>
              <Button
              type="button"
              onClick={async () => {
              await callback(formToken);
              setShowPrompt(false);
              }}
              >
              Confirm
              </Button>
              </form>
              )} */}
      <Button
        type="button"
        title={t("header.button.back")}
        onClick={() => navigate(-1)}
      >
        &lt;=
      </Button>
      <div className={styles.reponame} title={t("header.label.repo")}>
        {window.dir}
      </div>
      {schema && (
        <div className={styles.panel}>
          <Panel schema={schema} options={options} reloadPage={reloadPage} />
        </div>
      )}
      {schema && (
        <select
          name="fields"
          value={groupBy}
          title={t("header.dropdown.groupBy", { field: groupBy })}
          onChange={({ target: { value } }) => setGroupBy(value)}
        >
          {Object.keys(schema).map((prop: any, idx: any) => {
            if (schema[prop]["type"] == "date") {
              return (
                <option key={idx} value={prop}>
                  {prop}
                </option>
              );
            }
          })}
        </select>
      )}
      <Button
        type="button"
        title={t("header.button.export")}
        onClick={exportPage}
      >
        📃
      </Button>
    </header>
  );
};

export default Header;
