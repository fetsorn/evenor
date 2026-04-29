import mindbook from "@fetsorn/mindbook";
import invoke from "./invoke";

export default async function startEvenor() {
  await mindbook(invoke);
}
