import { click } from "./actions.js";
import { createMind } from "./create.js";
import { search } from "./search.js";

async function spoiler() {
  await (await $("aria/.")).waitForExist({ timeout: 5000 });

  await click(await $("aria/."));

  await (await $("aria/open")).waitForExist({ timeout: 5000 });

  await click(await $("aria/open"));
}

export async function open() {
  await spoiler();
}

export async function back() {
  // click button "back"
  await browser.back();
}

export function testOpen() {
  it("should open a mind", async () => {
    await expect(browser).toHaveUrl(expect.stringContaining("#?_=mind"));

    await createMind();

    // check that one record in the overview
    await open();

    // url is updated on search
    await search();

    // check that url changed
    await expect(browser).toHaveUrl(expect.stringContaining("_=event"));

    await back();

    await expect(browser).toHaveUrl(expect.stringContaining("#?_=mind"));
  });
}
