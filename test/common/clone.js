import { click, setValue } from "./actions.js";
import { open } from "./open.js";
import { search } from "./search.js";
import { draft, save } from "./create.js";

export async function clone(url) {
  await draft();

  // input name in profile
  await setValue(await $("aria/name -"), "foobar");

  await (await $("aria/add")).waitForExist({ timeout: 5000 });

  await click(await $("aria/add"));

  await (await $("button=origin_url")).waitForExist({ timeout: 5000 });

  await click(await $("button=origin_url"));

  await setValue(
    await $("aria/origin_url -"),
    `http://localhost:1420/#?~=${url}`,
  );

  await save();
}

export function testClone() {
  it("should clone a mind", async () => {
    // NOTE can't test the url clone
    // because webdriverio also uses
    // search string and ignores url
    await clone("http://localhost:8174/test-mind1.git");

    await open();

    await (await $("aria/Foobar")).waitForExist({ timeout: 5000 });

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
