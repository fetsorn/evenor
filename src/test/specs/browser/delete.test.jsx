import { render } from "@solidjs/testing-library";
import "../../setup.js";
import App from "../../../layout/layout.jsx";
import { testDelete } from "../integration.test.js";
import { cleanup } from "./cleanup.js";

describe("delete", () => {
  beforeEach(() => {
    render(() => <App />);
  });

  testDelete();

  afterEach(async () => {
    //await browser.debug();

    await cleanup();
  });
});
