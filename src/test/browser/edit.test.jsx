import { render } from "@solidjs/testing-library";
import "../setup.js";
import App from "../../layout/layout.jsx";
import { testEdit } from "../common/index.js";
import { cleanup } from "./cleanup.js";

// NOTE separate test file for each case to isolate state
describe("edit", () => {
  beforeEach(() => {
    render(() => <App />);
  });

  testEdit();

  afterEach(async () => {
    //await browser.debug();

    await cleanup();
  });
});
