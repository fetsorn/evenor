import { render } from "@solidjs/testing-library";
import "../../setup.js";
import App from "../../../layout/layout.jsx";
import { testPush } from "../integration.test.js";
import { cleanup } from "./cleanup.js";

describe("push", () => {
  beforeEach(() => {
    render(() => <App />);
  });

  //testPush();

  afterEach(async () => {
    //await browser.debug();

    await cleanup();
  });
});
