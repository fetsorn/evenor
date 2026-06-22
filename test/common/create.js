import { click, setValue } from "./actions.js";
import { open } from "./open.js";

export async function draft() {
  await (await $("aria/new")).waitForExist({ timeout: 5000 });

  // check that no records in the overview
  await click(await $("aria/new"));

  await (await $("aria/save")).waitForExist({ timeout: 5000 });
}

export async function save() {
  await click(await $("aria/save"));

  try {
    await (await $("aria/save")).waitForExist({ reverse: true, timeout: 5000 });
  } catch {
    await save();
  }
}

export async function createMind() {
  await draft();

  // input name in profile
  await setValue(await $("aria/Name of the mind -"), "foobar");

  await save();
}

export function testCreateMind() {
  it("should create a mind", async () => {
    await createMind();

    const element = await $("aria/found");

    // check that one record in the overview
    await expect(element).toHaveText("found 1");
  });
}

export async function createEvent() {
  // check that no records in the overview
  await draft();

  // open the "add..." spoiler
  await (await $(".spoiler-add")).waitForExist({ timeout: 5000 });

  await click(await $(".spoiler-add"));

  // click locale prose button (e.g. "English") — use class to avoid
  // matching the language selector option
  await (
    await $("button.profileAddNew=English")
  ).waitForExist({ timeout: 5000 });

  await click(await $("button.profileAddNew=English"));

  // prose spoiler auto-opens in edit mode, input prose
  await (await $("aria/English -")).waitForExist({ timeout: 5000 });

  await setValue(await $("aria/English -"), "baz");

  await save();
}

export function testCreateEvent() {
  it("should create an event", async () => {
    await createMind();

    await open();

    await createEvent();

    // prose is inside a closed spoiler, open it
    await (await $(".spoiler-is")).waitForExist({ timeout: 5000 });

    await click(await $(".spoiler-is"));

    // check that prose is displayed
    const element = await $("aria/baz");

    await expect(element).toBeDisplayed();
  });
}
