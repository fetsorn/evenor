import { click, setValue } from "./actions.js";
import { createMind, save } from "./create.js";

export async function edit() {
  const editBtn = await $("aria/edit");

  if (!(await editBtn.isDisplayed())) {
    await (await $("aria/…")).waitForExist({ timeout: 5000 });

    await click(await $("aria/…"));

    await editBtn.waitForDisplayed({ timeout: 5000 });
  }

  await click(editBtn);
}

export function testEdit() {
  it("should edit", async () => {
    await createMind();

    await edit();

    await setValue(await $("aria/Name of the mind -"), "foobaz");

    await save();

    const element = await $("aria/foobaz");

    await expect(element).toBeDisplayed();
  });
}
