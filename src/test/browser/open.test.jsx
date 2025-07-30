import { render } from "@solidjs/testing-library";
import "../setup.js";
import App from "../../layout/layout.jsx";
import { testOpen } from "../common/index.js";
import { cleanup } from "./cleanup.js";

// NOTE separate test file for each case to isolate state
describe("open", () => {
  beforeEach(() => {
    render(() => <App />);
  });

  testOpen();

  afterEach(async () => {
    //await browser.debug();

    await cleanup();
  });
});
