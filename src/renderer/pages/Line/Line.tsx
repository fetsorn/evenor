import React from "react";
import { Header, Main, Footer } from "../../components";
import { Timeline, Sidebar } from "./components";

const Line = () => {

  return (
    <>
      <Header />
      <Main>
        <Timeline/>
        <Sidebar/>
      </Main>
      <Footer />
    </>
  );
};

export default Line;
