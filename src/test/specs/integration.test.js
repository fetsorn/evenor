import { $, expect, browser } from "@wdio/globals";
import {
  make,
  save,
  edit,
  newRepo,
  updateFixture,
  wipe,
  open,
  close,
  clone,
  pull,
  push,
} from "./actions.js";

export function t() {
  //it("should create a repo", async () => {
  //  await make();

  //  // input reponame in profile
  //  await $("aria/reponame -").setValue("foobar");

  //  await save();

  //  const element = await $("aria/foobar");

  //  // check that one record in the overview
  //  await expect(element).toBeDisplayed();
  //});

  //it("should delete a repo", async () => {
  //  newRepo();

  //  await wipe();

  //  const element = await $("aria/found");

  //  await expect(element).toHaveText("found 0");
  //});

  //it("should open a repo", async () => {
  //  await expect(browser).toHaveUrl(
  //    expect.stringContaining("#?_=repo&.sortBy=repo"),
  //  );

  //  await newRepo();

  //  // check that one record in the overview
  //  await open();

  //  // check that url changed
  //  await expect(browser).toHaveUrl(
  //    expect.stringContaining("#/foobar?_=event&.sortBy=actdate"),
  //  );

  //  await close();

  //  await expect(browser).toHaveUrl(
  //    expect.stringContaining("#?_=repo&.sortBy=repo"),
  //  );
  //});

  //it("should create an event", async () => {
  //  await newRepo();

  //  await open();

  //  // check that no records in the overview
  //  await make();

  //  await $("aria/add").click();

  //  await $("aria/datum").click();

  //  // input reponame in profile
  //  await $("aria/datum -").setValue("baz");

  //  await save();

  //  // check that one record in the overview
  //  const element = await $("aria/baz");

  //  // check that one record in the overview
  //  await expect(element).toBeDisplayed();
  //});

  it("should clone a repo", async () => {
    // check that no records in the overview
    await make();

    await clone();

    //await save();

    // check that one record in the overview
  });

  //it("should pull a repo", async () => {
  //  await make();

  //  await clone();

  //  await save();

  //  await updateFixture();

  //  await pull();

  //  // check that record changed in the overview
  //});

  //it("should push a repo", async () => {
  //  await make();

  //  await clone();

  //  await save();

  //  await open();

  //  await make();

  //  await $("aria/add").click();

  //  await $("aria/datum").click();

  //  // input reponame in profile
  //  await $("aria/datum -").setValue("baz");

  //  await save();

  //  await close();

  //  await push();

  //  // check that remote repo changed
  //});
}
