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
  await setValue(await $("aria/name -"), "foobar");

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

export function testCreateEvent() {
  it("should create an event", async () => {
    await createMind();

    await open();

    // check that no records in the overview
    await draft();

    await click(await $("aria/add"));

    await click(await $("aria/datum"));

    // input name in profile
    await setValue(await $("aria/datum -"), "baz");

    await save();

    // check that one record in the overview
    const element = await $("aria/baz");

    // check that one record in the overview
    await expect(element).toBeDisplayed();
  });
}
