import { render } from "@solidjs/testing-library";
import App from "../../layout/layout.jsx";
import { t } from "./integration.test.js";

describe("integration", () => {
  beforeEach(() => {
    render(() => <App />);
  });

  t();

  afterEach(async () => {
    //await browser.debug();
  });
});
