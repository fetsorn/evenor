import * as React from "react";
import { useEffect } from "react";

const Repo = ({idx, repo, repoDelete}) => {

    return (
        <div key={idx}>

            <Link to={repo + "/"}>{repo}</Link>

            <ButtonRepoDelete repoDelete={repoDelete}/>

            <ButtonRepoDownload/>

        </div>
    );
};

export default Repo;
