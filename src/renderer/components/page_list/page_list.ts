
    async function repoCreate(repoName, url, token) {

        const git = new Git();

        await git.init(repoName);

        if (url) {

            await git.addRemote(repoName, url);

            await git.fetch(repoName, token);

        }
    }

    async function listRepos() {

        // get paths of all repos
        const repoNames = await gitListRepos();

        // filter out read-only repos
        const repoNamesFiltered = repoNames.filter(

            (name: any) => name !== "show"

        );

        return repoNames
    }
