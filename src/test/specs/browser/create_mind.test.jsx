import { render } from "@solidjs/testing-library";
import "../../setup.js";
import App from "../../../layout/layout.jsx";
import { testCreateMind } from "../common/index.js";
import { cleanup } from "./cleanup.js";

// NOTE separate test file for each case to isolate state
describe("create mind", () => {
  beforeEach(() => {
    render(() => <App />);
  });

  testCreateMind();

  afterEach(async () => {
    //await browser.debug();

    await cleanup();
  });
});
