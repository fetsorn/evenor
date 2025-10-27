import { render } from "@solidjs/testing-library";
import "../setup.js";
import App from "../../layout/layout.jsx";
import { testSyncOpen } from "../common/index.js";
import { cleanup } from "./cleanup.js";

// NOTE separate test file for each case to isolate state
describe("sync open", () => {
  beforeEach(() => {
    render(() => <App />);
  });

  testSyncOpen();

  afterEach(async () => {
    //await browser.debug();

    await cleanup();
  });
});
