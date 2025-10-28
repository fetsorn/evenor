import { setValue } from "./actions.js";
import { open, back } from "./open.js";
import { clone } from "./clone.js";
import { edit } from "./edit.js";
import { createEvent, save } from "./create.js";
import { search } from "./search.js";

export async function setRemote(url) {
  await edit();

  await setValue(await $("aria/origin_url -"), url);

  await save();
}

export function testResolveSave() {
  it("should resolve on commit", async () => {
    // clone
    await clone("http://localhost:8174/test-mind1.git");

    await (await $("aria/back")).waitForExist({ timeout: 5000 });

    // TODO schema doesn't change from root for some reason

    await createEvent();
    // NOTE: git-http-mock-server calls fixturez which calls tempy
    // which creates a temp directory on push, check /tmp or /private
  });
}

export function testResolveOpen() {
  it("should resolve on open", async () => {
    await clone("http://localhost:8174/test-mind1.git"); // has 7

    await back();

    await setRemote("http://localhost:8174/test-mind2.git"); // has 6

    await open();

    await search();

    const element = await $("aria/found");

    await expect(element).toHaveText("found 6");
  });
}
