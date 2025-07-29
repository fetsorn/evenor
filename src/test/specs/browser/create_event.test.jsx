import { render } from "@solidjs/testing-library";
import "../../setup.js";
import App from "../../../layout/layout.jsx";
import { testCreateEvent } from "../integration.test.js";
import { cleanup } from "./cleanup.js";

describe("create event", () => {
  beforeEach(() => {
    render(() => <App />);
  });

  testCreateEvent();

  afterEach(async () => {
    //await browser.debug();

    await cleanup();
  });
});
