import * as React from "react";
import { useEffect} from "react";
import { Main, Footer } from "../../components";
import { inUseEffect } from "./List";
import { RepoForm, RepoList } from "./components";

const List = () => {

    useEffect(() => {
        inUseEffect()
    }, []);

    return (
        <>
            <Main>
                <RepoForm/>
                <RepoList/>
            </Main>
            <Footer />
        </>
    );
};

export default List;
