import { click } from "./actions.js";
import { createMind } from "./create.js";

async function spoiler() {
  await click(await $("aria/open"));

  try {
    await (await $("aria/event")).waitForExist({ timeout: 5000 });
  } catch {
    await spoiler();
  }
}

export async function query() {
  // click button "open event"
  await click(await $("aria/event"));

  try {
    await (await $("aria/back")).waitForExist({ timeout: 5000 });
  } catch {
    await query();
  }
}

export async function open() {
  await spoiler();

  await query();
}

export async function back() {
  // click button "back"
  await click(await $("aria/back"));
}

export function testOpen() {
  it("should open a mind", async () => {
    await expect(browser).toHaveUrl(
      expect.stringContaining("#?_=mind&.sortBy=mind"),
    );

    await createMind();

    // check that one record in the overview
    await open();

    // check that url changed
    await expect(browser).toHaveUrl(
      expect.stringContaining("_=event&.sortBy=actdate"),
    );

    await back();

    await expect(browser).toHaveUrl(
      expect.stringContaining("#?_=mind&.sortBy=mind"),
    );
  });
}
