import {
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

export function t() {
  it("should create a mind", async () => {
    await make();

    // input name in profile
    setValue(await $("aria/name -"), "foobar");

    await save();

    const element = await $("aria/found");

    // check that one record in the overview
    await expect(element).toHaveText("found 1");
  });

  //it("should delete a mind", async () => {
  //  await newMind();

  //  await wipe();

  //  const element = await $("aria/found");

  //  await expect(element).toHaveText("found 0");
  //});

  //it("should open a mind", async () => {
  //  await expect(browser).toHaveUrl(
  //    expect.stringContaining("#?_=mind&.sortBy=mind"),
  //  );

  //  await newMind();

  //  // check that one record in the overview
  //  await open();

  //  // check that url changed
  //  await expect(browser).toHaveUrl(
  //    expect.stringContaining("_=event&.sortBy=actdate"),
  //  );

  //  await close();

  //  await expect(browser).toHaveUrl(
  //    expect.stringContaining("#?_=mind&.sortBy=mind"),
  //  );
  //});

  //it("should create an event", async () => {
  //  await newMind();

  //  await open();

  //  // check that no records in the overview
  //  await make();

  //  await click(await $("aria/add"));

  //  await click(await $("aria/datum"));

  //  // input name in profile
  //  await setValue(await $("aria/datum -"), "baz");

  //  await save();

  //  // check that one record in the overview
  //  const element = await $("aria/baz");

  //  // check that one record in the overview
  //  await expect(element).toBeDisplayed();
  //});

  //it("should clone a mind", async () => {
  //  // check that no records in the overview

  //  await clone();

  //  await open();

  //  const element = await $("aria/found");

  //  await expect(element).toHaveText("found 7");
  //});

  //it("should pull a mind", async () => {
  //  await clone();

  //  await pull();

  //  // check that record changed in the overview
  //  await open();

  //  const element = await $("aria/found");

  //  await expect(element).toHaveText("found 6");
  //});

  //it("should push a mind", async () => {
  //  await clone();

  //  await pull();

  //  await push();

  //  await make();

  //  await click(await $("aria/add"));

  //  await click(await $("aria/datum"));

  //  // input name in profile
  //  await setValue(await $("aria/datum -"), "baz");

  //  await save();

  //  await close();

  //  await push();

  //  // check that remote mind changed
  //});
}
