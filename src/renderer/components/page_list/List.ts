import {
    gitInit,
    /* wipe, */
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
            if (e.toString().includes("Unauthorized")) {
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


        function inUseEffect() {

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
                        await rimraf("/show");
                    } catch (e) {
                        console.log("nothing to remove");
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
        }