import { useEffect } from "react";
import { Header } from "../../components";
import { TreeGraph, TreeControl } from "./components";
import { inUseEffect } from "./Tree";

const Tree = () => {

  useEffect(() => {
    inUseEffect();
  }, []);

  return (
    <>
      <Header />
      <TreeGraph/>
      <TreeControl/>
    </>
  );
};

export default Tree;
