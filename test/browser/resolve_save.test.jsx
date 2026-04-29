import { testResolveSave } from "../common/index.js";
import { setup } from "./setup.js";
import { cleanup } from "./cleanup.js";

// NOTE separate test file for each case to isolate state
describe("resolve save", () => {
  before(async () => {
    await setup()
  });

  testResolveSave();

  afterEach(async () => {
    //await browser.debug();

    await cleanup();
  });
});
