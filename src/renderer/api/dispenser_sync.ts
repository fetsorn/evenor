import { editEntry, searchRepo } from "./api";

export async function checkRepo(sourceDir: string, targetDir: string, search: string) {
  const searchParams = new URLSearchParams(search);

  // get array of events by search from source
  const sourceEntries = await searchRepo(sourceDir, searchParams);

  // get array of events by search from target
  const targetEntries = await searchRepo(targetDir, searchParams);

  // return for diff
  return { sourceEntries, targetEntries }
}

export async function syncRepo(sourceDir: string, targetDir: string, entries: any) {
  for (const entry of entries) {
    console.log(entry)
    // write events to sourceDir
    await editEntry(sourceDir, entry);

    // write events to targetDir
    await editEntry(targetDir, entry);
  }
}
