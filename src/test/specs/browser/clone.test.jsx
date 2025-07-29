import { render } from "@solidjs/testing-library";
import "../../setup.js";
import App from "../../../layout/layout.jsx";
import { testClone } from "../integration.test.js";
import { cleanup } from "./cleanup.js";

describe("clone", () => {
  beforeEach(() => {
    render(() => <App />);
  });

  testClone();

  afterEach(async () => {
    //await browser.debug();

    await cleanup();
  });
});
