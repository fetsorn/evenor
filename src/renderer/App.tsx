import * as React from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { List, Tree, Line } from "./components";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route index element={<List />} />
        <Route path=":repoName/q" element={<Line />} />
        <Route path=":repoName" element={<Tree />} />
      </Routes>
    </Router>
  );
}


// TODO: if build mode is server, navigate to server/
// but do not just always navigate to server/ to allow for custom server URLs
function redirectToServer() {
            if (__BUILD_MODE__ === "server") {
                try {
                    navigate("server/");
                } catch {
                    return;
                }
            }
}

// try to login read-only to a public repo from address bar
function tryShow() {

    // remove url from address bar
    /* window.history.replaceState(null, null, "/"); */
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

function redirectToBarURL() {

    // read url from path
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.has("url")) {
        const barUrl = searchParams.get("url");
        const barToken = searchParams.get("token") ?? "";

        // try to login read-only to a public repo from address bar
        await tryShow();
    }
}
