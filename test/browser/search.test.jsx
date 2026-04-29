import { testSearch } from "../common/index.js";
import { setup } from "./setup.js";
import { cleanup } from "./cleanup.js";

// NOTE separate test file for each case to isolate state
describe("search", () => {
  before(async () => {
    await setup()
  });

  testSearch();

  afterEach(async () => {
    //await browser.debug();

    await cleanup();
  });
});
