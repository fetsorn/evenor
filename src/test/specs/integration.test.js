import {
  click,
  make,
  save,
  setValue,
  newMind,
  wipe,
  open,
  close,
  clone,
  pull,
  push,
} from "./actions.js";

export function testCreateMind() {
  it("should create a mind", async () => {
    await newMind();

    const element = await $("aria/found");

    // check that one record in the overview
    await expect(element).toHaveText("found 1");
  });
}

export function testDelete() {
  it("should delete a mind", async () => {
    await newMind();

    await wipe();

    const element = await $("aria/found");

    await expect(element).toHaveText("found 0");
  });
}

export function testOpen() {
  it("should open a mind", async () => {
    await expect(browser).toHaveUrl(
      expect.stringContaining("#?_=mind&.sortBy=mind"),
    );

    await newMind();

    // check that one record in the overview
    await open();

    // check that url changed
    await expect(browser).toHaveUrl(
      expect.stringContaining("_=event&.sortBy=actdate"),
    );

    await close();

    await expect(browser).toHaveUrl(
      expect.stringContaining("#?_=mind&.sortBy=mind"),
    );
  });
}

export function testCreateEvent() {
  it("should create an event", async () => {
    await newMind();

    await open();

    // check that no records in the overview
    await make();

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

export function testClone() {
  it("should clone a mind", async () => {
    await click(await $("aria/new"));
    await (await $("aria/name -")).waitForExist({ timeout: 5000 });
    await setValue(await $("aria/name -"), "foobar");
    await (await $("aria/add")).waitForExist({ timeout: 5000 });
    await click(await $("aria/add"));
    await (await $("aria/origin_url")).waitForExist({ timeout: 5000 });
    await click(await $("aria/origin_url"));
    await setValue(
      await $("aria/origin_url -"),
      "http://localhost:8174/test-mind1.git",
    );
    await (await $("aria/clone...")).waitForExist({ timeout: 5000 });
    await click(await $("aria/clone..."));
    await (await $("aria/Yes")).waitForExist({ timeout: 5000 });
    await click(await $("aria/Yes"));
    await (await $("aria/Yes")).waitForExist({ reverse: true, timeout: 5000 });
    await (await $("aria/save")).waitForExist({ timeout: 5000 });
    await click(await $("aria/save"));
    try {
      await (
        await $("aria/save")
      ).waitForExist({ reverse: true, timeout: 5000 });
    } catch {
      await click(await $("aria/save"));
    }
    await (await $("aria/save")).waitForExist({ reverse: true, timeout: 5000 });
    await (await $("aria/open")).waitForExist({ timeout: 5000 });
    await click(await $("aria/open"));

    await (await $("aria/open").nextElement()).waitForExist({ timeout: 5000 });
    //await click(await $("aria/open").nextElement());
    await (await $("aria/event")).waitForExist({ timeout: 5000 });
    await await $("aria/event").click();
    //await browser.execute("arguments[0].click();", await $("aria/event"));

    await (await $("aria/back")).waitForExist({ timeout: 5000 });
    const element = await $("aria/found");
    await element.waitUntil(
      async function () {
        return (await this.getText()) === "found 7";
      },
      {
        timeout: 5000,
      },
    );
  });
}

export function testPull() {
  it("should pull a mind", async () => {
    await clone();

    await pull();

    // TODO check that record changed in the overview

    await open();

    const element = await $("aria/found");

    await expect(element).toHaveText("found 6");
  });
}

export function testPush() {
  it("should push a mind", async () => {
    await clone();

    await pull();

    await push();

    await make();

    await click(await $("aria/add"));

    await click(await $("aria/datum"));

    // input name in profile
    await setValue(await $("aria/datum -"), "baz");

    await save();

    await close();

    await push();
    // TODO check that remote mind changed
    const element = await $("aria/found");

    await expect(element).toHaveText("found 6");
  });
}
