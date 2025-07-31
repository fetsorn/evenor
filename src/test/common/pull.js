import { click, setValue } from "./actions.js";
import { clone } from "./clone.js";
import { open } from "./open.js";
import { save } from "./create.js";

export async function pull(url) {
  // edit
  await click(await $("aria/edit"));

  await setValue(await $("aria/origin_url -"), url);

  await click(await $("aria/pull"));

  await (
    await $("aria/Loading...")
  ).waitForExist({ reverse: true, timeout: 5000 });

  await save();
}

export function testPull() {
  it("should pull a mind", async () => {
    await clone("http://localhost:8174/test-mind1.git");

    await pull("http://localhost:8174/test-mind2.git");

    await open();

    const element = await $("aria/found");

    await expect(element).toHaveText("found 6");
  });
}
