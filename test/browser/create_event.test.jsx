import { testCreateEvent } from "../common/index.js";
import { setup } from "./setup.js";
import { cleanup } from "./cleanup.js";

// NOTE separate test file for each case to isolate state
describe("create event", () => {
  before(async () => {
    await setup();
  });

  testCreateEvent();

  afterEach(async () => {
    //await browser.debug();

    await cleanup();
  });
});
