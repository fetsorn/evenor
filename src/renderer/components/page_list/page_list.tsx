import * as React from "react";
import { useEffect } from "react";
import { Main, Footer } from "../../components";
import { inUseEffect } from "./List";
import { FormRepoCreate, Repos } from "./components";

const List = () => {

    const [repoNames, setRepoNames] = useState([])

    const onRepoCreate = () => {

        await createRepo();

        setRepoNames(await listRepos());
    }

    const onRepoDelete = () => {

        await deleteRepo();

        setRepoNames(await listRepos())
    }

    useEffect(() => {

        (async () => {

            setRepoNames(await listRepos())

        })

    }, [])

    return (
        <Main>

            <FormRepoCreate repoCreate={onRepoCreate}/>

            <Repos repoNames={repoNames} repoDelete={onRepoDelete}/>

        </Main>
    );
};

export default List;
