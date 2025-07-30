import { click } from "./actions.js";
import { createMind } from "./create.js";

export async function wipe() {
  await (await $("aria/delete")).waitForExist({ timeout: 5000 });

  await click(await $("aria/delete"));

  await (await $("aria/Yes")).waitForExist({ timeout: 5000 });

  await click(await $("aria/Yes"));

  await (await $("aria/delete")).waitForExist({ reverse: true, timeout: 5000 });
}

export function testDelete() {
  it("should delete a mind", async () => {
    await createMind();

    await wipe();

    const element = await $("aria/found");

    await expect(element).toHaveText("found 0");
  });
}
