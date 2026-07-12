import { click, setValue } from "./actions.js";
import { open } from "./open.js";
import { search } from "./search.js";
import { draft, save } from "./create.js";

export async function pull() {
  const pullBtn = await $("aria/pull");

  if (!(await pullBtn.isDisplayed())) {
    await (await $("aria/…")).waitForExist({ timeout: 5000 });

    await click(await $("aria/…"));

    await pullBtn.waitForDisplayed({ timeout: 5000 });
  }

  await click(pullBtn);

  // wait for fetch
  // TODO: replace with wait for Success
  await browser.pause(3000);

  // search to reload new uuid
  await search();
}

export async function clone(url) {
  await draft();

  // input name in profile
  await setValue(await $('[contenteditable][aria-label="Name of the mind"]'), "foobar");

  await (await $("aria/add")).waitForExist({ timeout: 5000 });

  await click(await $("aria/add"));

  await (
    await $("button=URL to remote git repository")
  ).waitForExist({ timeout: 5000 });

  await click(await $("button=URL to remote git repository"));

  await setValue(await $('[contenteditable][aria-label="URL to remote git repository"]'), url);

  // save remote — induct + settle clones the remote content,
  // including the remote UUID, so no pull needed afterward
  await save();

  // settle may have replaced the throwaway UUID with the remote one;
  // search to reload, then wait for the list to render
  await search();

  await (
    await $("aria/found")
  ).waitForExist({ timeout: 5000 });
}

export function testCloneUrl() {
  it("should clone a mind from url search params", async () => {
    // the hash was set to #?~=<remote>&-= before mount, so the initial
    // popstate triggers the url clone flow and opens the cloned mind —
    // poll search until the cloned view is active and yields its 7 events
    await browser.waitUntil(
      async () => {
        await search();

        const found = await $("aria/found");

        if (!(await found.isExisting())) return false;

        return (await found.getText()) === "found 7";
      },
      {
        timeout: 15000,
        interval: 1000,
        timeoutMsg: "expected cloned mind to open and search to find 7",
      },
    );

    // the url should carry the uuid adopted from the remote .csvs.csv
    await expect(browser).toHaveUrl(
      expect.stringContaining("524e6a8d-6046-4346-a094-e7771054e0ee"),
    );
  });
}

export function testClone() {
  it("should clone a mind", async () => {
    // NOTE can't test the url clone
    // because webdriverio also uses
    // search string and ignores url
    await clone("http://127.0.0.1:8174/test-mind1.git");

    await open();

    await search();

    // should find 7 events in the cloned mind
    await (
      await $("aria/found")
    ).waitUntil(
      async function () {
        return (await this.getText()) === "found 7";
      },
      {
        timeout: 5000,
      },
    );
  });
}
