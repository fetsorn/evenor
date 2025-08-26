import { render } from "@solidjs/testing-library";
import "../setup.js";
import App from "../../layout/layout.jsx";
import { testSearch } from "../common/index.js";
import { cleanup } from "./cleanup.js";

// NOTE separate test file for each case to isolate state
describe("search", () => {
  beforeEach(() => {
    render(() => <App />);
  });

  testSearch();

  afterEach(async () => {
    //await browser.debug();

    await cleanup();
  });
});
