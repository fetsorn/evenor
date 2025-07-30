import { click, setValue } from "./actions.js";
import { clone } from "./clone.js";
import { open } from "./open.js";
import { save } from "./create.js";

export async function pull() {
  // edit
  await click(await $("aria/edit"));

  // with
  await click(
    await $("aria/origin_url -")
      .nextElement()
      .nextElement()
      .nextElement()
      .nextElement(),
  );

  await setValue(
    await $("aria/origin_url -"),
    "http://localhost:8174/test-mind2.git",
  );

  await click(await $("aria/pull"));

  await (
    await $("aria/Loading")
  ).waitUntil(() => {}, { reverse: true, timeout: 5000 });

  await save();
}

export function testPull() {
  it("should pull a mind", async () => {
    await clone();

    await pull();

    // TODO check that record changed in the overview

    await open();

    const element = await $("aria/found");

    await expect(element).toHaveText("found 6");
  });
}
