import { click } from "./actions.js";
import { createMind } from "./create.js";

async function spoiler() {
  await (await $("aria/.")).waitForExist({ timeout: 5000 });

  await click(await $("aria/."));

  await (await $("aria/open")).waitForExist({ timeout: 5000 });

  await click(await $("aria/open"));

  try {
    await (await $("aria/Foobar")).waitForExist({ timeout: 5000 });
  } catch {
    await spoiler();
  }
}

export async function open() {
  await spoiler();
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
