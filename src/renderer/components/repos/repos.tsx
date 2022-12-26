
import * as React from "react";
import { useEffect } from "react";
import { listRepos } from "./repos";

const Repos = ({repoNames, repoDelete}) => {

    return (
        <div>
            {repoNames.map((repo: any, idx: any) => (
                <Repo repo={repo} idx={idx}, repoDelete={repoDelete}/>
            ))}
        </div>
    );
};

export default Repos;
