//import { click, setValue } from "./actions.js";
import { clone } from "./clone.js";
import { open } from "./open.js";
//import { save } from "./create.js";
import { search } from "./search.js";

// clone
// edit
// check

export function testSync() {
  it("should push a mind", async () => {
    await clone("http://localhost:8174/test-mind1.git");

    // TODO add remote
    // await pull("http://localhost:8174/test-mind2.git");

    // TODO add remote
    // await push("http://localhost:8174/test-mind1.git");

    // NOTE: git-http-mock-server calls fixturez which calls tempy
    // which creates a temp directory on push, check /tmp or /private
  });

  it("should pull a mind", async () => {
    await clone("http://localhost:8174/test-mind1.git");

    // set remote
    // await pull("http://localhost:8174/test-mind2.git");

    await open();

    await search();

    const element = await $("aria/found");

    await expect(element).toHaveText("found 6");
  });
}
