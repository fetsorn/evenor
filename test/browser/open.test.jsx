import { testOpen } from "../common/index.js";
import { setup } from "./setup.js";
import { cleanup } from "./cleanup.js";

// NOTE separate test file for each case to isolate state
describe("open", () => {
  before(async () => {
    await setup()
  });

  testOpen();

  afterEach(async () => {
    //await browser.debug();

    await cleanup();
  });
});
