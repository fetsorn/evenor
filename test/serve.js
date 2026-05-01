import http from "http";
import path from "path";
import factory from "git-http-mock-server/middleware.js";
import cors from "git-http-mock-server/cors.js";

var config = {
    root: path.resolve(import.meta.dirname, "fixtures/bare"),
    glob: "*",
    route: "/",
};

const gitServer = http.createServer(cors(factory(config)));

gitServer.listen(8174);
