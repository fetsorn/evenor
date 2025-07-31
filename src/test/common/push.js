import { click, setValue } from "./actions.js";
import { pull } from "./pull.js";
import { clone } from "./clone.js";
import { save } from "./create.js";

export async function push(url) {
  // edit
  await click(await $("aria/edit"));

  await setValue(await $("aria/origin_url -"), url);

  await click(await $("aria/push"));

  await (
    await $("aria/Loading...")
  ).waitForExist({ reverse: true, timeout: 5000 });

  await save();
}

export function testPush() {
  it("should push a mind", async () => {
    await clone("http://localhost:8174/test-mind1.git");

    await pull("http://localhost:8174/test-mind2.git");

    await push("http://localhost:8174/test-mind1.git");

    // NOTE: git-http-mock-server calls fixturez which calls tempy
    // which creates a temp directory on push, check /tmp or /private
  });
}
