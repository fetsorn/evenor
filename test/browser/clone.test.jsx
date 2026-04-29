import { testClone } from "../common/index.js";
import { setup } from "./setup.js";
import { cleanup } from "./cleanup.js";

// NOTE separate test file for each case to isolate state
describe("clone", () => {
  before(async () => {
    await setup();
  });

  testClone();

  afterEach(async () => {
    await browser.debug();

    await cleanup();
  });
});
