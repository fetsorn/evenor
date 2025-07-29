import { render } from "@solidjs/testing-library";
import "../../setup.js";
import App from "../../../layout/layout.jsx";
import { testCreateMind } from "../integration.test.js";
import { cleanup } from "./cleanup.js";

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
