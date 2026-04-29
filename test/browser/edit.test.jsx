import { testEdit } from "../common/index.js";
import { setup } from "./setup.js";
import { cleanup } from "./cleanup.js";

// NOTE separate test file for each case to isolate state
describe("edit", () => {
  before(async () => {
    await setup();
  });

  testEdit();

  afterEach(async () => {
    //await browser.debug();

    await cleanup();
  });
});
