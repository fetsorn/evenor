import { testCreateMind } from "../common/index.js";
import { setup } from "./setup.js";
import { cleanup } from "./cleanup.js";

// NOTE separate test file for each case to isolate state
describe("create mind", () => {
  before(async () => {
    await setup()
  });

  testCreateMind();

  afterEach(async () => {
    //await browser.debug();

    await cleanup();
  });
});
