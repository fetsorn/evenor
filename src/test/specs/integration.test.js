import { $, expect, browser } from "@wdio/globals";
import {
  make,
  save,
  edit,
  wipe,
  open,
  close,
  clone,
  pull,
  push,
} from "./actions.js";

export function t() {
  it("should create a repo", async () => {
    // check that no records in the overview
    await $("aria/new").click();

    // open spoiler in profile
    await $("aria/with").click();

    // input reponame in profile
    await $("aria/reponame -").setValue("foobar");

    // save profile
    await $("aria/save").click();

    // wait for record to save
    await new Promise((resolve) => setTimeout(resolve, 500));

    const element = await $("aria/foobar");

    // check that one record in the overview
    await expect(element).toHaveText("foobar");
  });

  //it("should edit a repo", async () => {
  //  // check name of record in the overview
  //  edit();
  //  save();
  //  // check name of record in the overview
  //});

  //it("should delete a repo", async () => {
  //  // check that one record in the overview
  //  // check name of record in the overview
  //  wipe();
  //  // check that no records in the overview
  //});

  //it("should open a repo", async () => {
  //  // check that one record in the overview
  //  open();
  //  // check that url changed
  //});

  //it("should close a repo", async () => {
  //  // check that repo is opened
  //  close();
  //  // check that url changed
  //});

  //it("should create an event", async () => {
  //  // check that one record in the overview
  //  open();
  //  // check that no records in the overview
  //  make();
  //  save();
  //  // check that one record in the overview
  //});

  //it("should clone a repo", async () => {
  //  // check that no records in the overview
  //  make();
  //  clone();
  //  // check that one record in the overview
  //});

  //it("should pull a repo", async () => {
  //  open();
  //  // check that one record in the overview
  //  close();
  //  pull();
  //  open();
  //  // check that record changed in the overview
  //});

  //it("should push a repo", async () => {
  //  open();
  //  edit();
  //  close();
  //  push();
  //  // check that remote repo changed
  //});
}
