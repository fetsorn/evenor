import { render } from "@solidjs/testing-library";
import "../../setup.js";
import App from "../../../layout/layout.jsx";
import { testPull } from "../integration.test.js";
import { cleanup } from "./cleanup.js";

describe("pull", () => {
  beforeEach(() => {
    render(() => <App />);
  });

  //testPull();

  afterEach(async () => {
    //await browser.debug();

    await cleanup();
  });
});
