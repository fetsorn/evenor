import * as React from "react";

import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Main, Footer, Button } from "../../components";
import {
  gitInit,
  wipe,
  clone,
  gitListRepos,
  gitCreate,
  /* getRemote, */
  rimraf,
  /* gitpush,
   * gitpull,
   * gitcommit, */
  zip,
} from "../../utils";

import styles from "./List.module.css";

const List = () => {
  const [formUrl, setUrl] = useState("");
  const [formToken, setToken] = useState("");
  const [repoNames, setRepoNames] = useState<string[]>([]);
  /* const [remotes, setRemotes] = useState<any>({}); */
  const location = useLocation();
  const [showPrompt, setShowPrompt] = useState(false);
  /* const [callback, setCallback] = useState<(token: string) => Promise<void>>(
   *   () => async () => {
   *     return;
   *   }
   * ); */
  const navigate = useNavigate();
  const { t } = useTranslation();

  async function listRepos() {
    const _repoNames: string[] = await gitListRepos();
    const _repoNamesFiltered = _repoNames.filter(
      (name: any) => name !== "show"
    );
    console.log("repos", _repoNamesFiltered);
    setRepoNames(_repoNamesFiltered);

    /* const _remotes: any = {};
     * for (const repo of _repoNames) {
     *   const remote = await getRemote(repo);
     *   _remotes[repo] = remote;
     * }
     * console.log("remotes", _remotes);
     * setRemotes(_remotes); */
  }

  // clone git repo and hide authorization
  async function authorize(_formUrl = formUrl) {
    try {
      // check if path is a url
      new URL(_formUrl);
      console.log("is url", _formUrl);
    } catch {
      console.log("is not url", _formUrl);
      await gitCreate(_formUrl);
      await listRepos();
      return;
    }
    try {
      await clone(_formUrl, formToken);
    } catch (e) {
      console.log(e);
      if (e == "HttpError: HTTP Error: 401 Unauthorized") {
        setShowPrompt(true);
        return;
      } else {
        console.log("clone failed", e);
        return;
      }
    }

    setUrl("");
    setShowPrompt(false);
    await listRepos();
  }

  /* const pull = async (repo: string) => {
   *   setCallback(() => async (token: string) => await gitpull(repo, token));
   *   setShowPrompt(true);
   * };

   * const push = async (repo: string) => {
   *   await gitcommit(repo);
   *   setCallback(() => async (token: string) => await gitpush(repo, token));
   *   setShowPrompt(true);
   * }; */

  useEffect(() => {
    (async () => {
      if (__BUILD_MODE__ === "server") {
        try {
          navigate("server/");
        } catch {
          return;
        }
      }

      gitInit(location.pathname);

      // read url from path
      const searchParams = new URLSearchParams(location.search);
      if (searchParams.has("url")) {
        const barUrl = searchParams.get("url");
        const barToken = searchParams.get("token") ?? "";
        // remove url from address bar
        /* window.history.replaceState(null, null, "/"); */
        const tryShow = async () => {
          try {
            // check if path is a url
            new URL(barUrl);
          } catch (e) {
            console.log("not a url", barUrl, e);
            return
          }

          try {
            await clone(barUrl, barToken, "show");
          } catch (e) {
            await rimraf("/show");
            console.log("couldn't clone from url", barUrl, e);
            return
          }

          navigate("show/");
        }
        // try to login read-only to a public repo from address bar
        await tryShow();
      }

      await listRepos();
    })();
  }, []);

  return (
    <>
      <Main>
        <div>
          <div className={styles.container}>
            <form>
              <div>
                <input
                  className={styles.input}
                  type="text"
                  value={formUrl}
                  title={t("list.field.url")}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
              {/* <div>
                  <input
                  className={styles.input}
                  type="password"
                  value={formToken}
                  placeholder="key"
                  onChange={(e) => setToken(e.target.value)}
                  />
                  </div> */}
              {showPrompt && (
                <div>
                  <div>
                    <input
                      className={styles.input}
                      type="password"
                      value={formToken}
                      title={t("list.field.token")}
                      onChange={(e) => setToken(e.target.value)}
                    />
                  </div>
                  {/* <Button
                      type="button"
                      onClick={async () => {
                      await callback(formToken);
                      setShowPrompt(false);
                      }}
                      >
                      Confirm
                      </Button> */}
                </div>
              )}
            </form>
            <Button
              type="button"
              title={t("list.button.new")}
              onClick={() => authorize()}
            ></Button>
          </div>
          <br />
          <div>
            {repoNames.map((repo: any, idx: any) => (
              <div key={idx}>
                <div>
                  <Link to={repo + "/"}>{repo}</Link>
                  <button
                    type="button"
                    title={t("list.button.delete")}
                    onClick={async () => {
                      await rimraf("/" + repo);
                      setRepoNames(
                        repoNames.filter((name: any) => name !== repo)
                      );
                    }}
                  >
                    X
                  </button>
                  <button
                    type="button"
                    title={t("list.button.download")}
                    onClick={async () => {
                      await zip(repo);
                    }}
                  >
                    ⬇
                  </button>
                </div>
                {/* {remotes[repo] && (
                    <div>
                    remote: <Link to={remotes[repo]}>{remotes[repo]}</Link>
                    </div>
                    )} */}
                <br />
              </div>
            ))}
          </div>
          <Button type="button" onClick={() => wipe()}>
            Wipe
          </Button>
        </div>
      </Main>
      <Footer />
    </>
  );
};

export default List;
