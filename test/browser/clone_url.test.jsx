import { testCloneUrl } from "../common/index.js";
import { setup } from "./setup.js";
import { cleanup } from "./cleanup.js";

// NOTE separate test file for each case to isolate state
describe("clone via url", () => {
  before(async () => {
    // set clone search params in the hash BEFORE mount so the initial
    // popstate sees them and triggers the url clone flow
    window.location.hash = "#?~=http://127.0.0.1:8174/test-mind1.git&-=";

    await setup();
  });

  testCloneUrl();

  afterEach(async () => {
    window.location.hash = "";

    await cleanup();
  });
});
