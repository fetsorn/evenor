import { setValue } from "./actions.js";
import { search } from "./search.js";

export function testClone() {
  it("should clone a mind", async () => {
    // NOTE can't test the url clone
    // because webdriverio also uses
    // search string and ignores url

    await setValue(
      await $("aria/query"),
      "http://localhost:1420/#?~=http://localhost:8174/test-mind1.git",
    );

    await search();

    await (await $("aria/back")).waitForExist({ timeout: 5000 });

    await search();

    // should find 7 events in the cloned mind
    await (
      await $("aria/found")
    ).waitUntil(
      async function () {
        return (await this.getText()) === "found 20";
      },
      {
        timeout: 5000,
      },
    );
  });
}
