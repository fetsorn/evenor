import { render } from "@solidjs/testing-library";
import "../../setup.js";
import App from "../../../layout/layout.jsx";
import { testOpen } from "../integration.test.js";
import { cleanup } from "./cleanup.js";

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
