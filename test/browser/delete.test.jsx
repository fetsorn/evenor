import { testDelete } from "../common/index.js";
import { setup } from "./setup.js";
import { cleanup } from "./cleanup.js";

// NOTE separate test file for each case to isolate state
describe("delete", () => {
  before(async () => {
    await setup()
  });

  testDelete();

  afterEach(async () => {
    //await browser.debug();

    await cleanup();
  });
});
