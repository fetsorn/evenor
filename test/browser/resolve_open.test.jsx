import { testResolveOpen } from "../common/index.js";
import { setup } from "./setup.js";
import { cleanup } from "./cleanup.js";

// NOTE separate test file for each case to isolate state
describe("resolve open", () => {
  before(async () => {
    await setup()
  });

  testResolveOpen();

  afterEach(async () => {
    //await browser.debug();

    await cleanup();
  });
});
