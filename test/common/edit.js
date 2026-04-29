import { click, setValue } from "./actions.js";
import { createMind, save } from "./create.js";

export async function edit() {
  await (await $("aria/.")).waitForExist({ timeout: 5000 });

  await click(await $("aria/."));

  await (await $("aria/edit")).waitForExist({ timeout: 5000 });

  await click(await $("aria/edit"));
}

export function testEdit() {
  it("should edit", async () => {
    await createMind();

    await edit();

    await setValue(await $("aria/name -"), "foobaz");

    await save();

    const element = await $("aria/foobaz");

    await expect(element).toBeDisplayed();
  });
}
