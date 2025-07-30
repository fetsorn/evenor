import { click, setValue } from "./actions.js";
import { back } from "./open.js";
import { pull } from "./pull.js";
import { clone } from "./clone.js";
import { draft, save } from "./create.js";

export async function push() {
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

  await setValue(await $("aria/url -"), "http://localhost:8174/test-mind1.git");

  await click(await $("aria/push"));

  await save();
}

export function testPush() {
  it("should push a mind", async () => {
    await clone();

    await pull();

    await push();

    await draft();

    await click(await $("aria/add"));

    await click(await $("aria/datum"));

    // input name in profile
    await setValue(await $("aria/datum -"), "baz");

    await save();

    await back();

    await push();
    // TODO check that remote mind changed
    const element = await $("aria/found");

    await expect(element).toHaveText("found 6");
  });
}
