import { onRecordEdit } from "@/store/index.js";

export function NavigationRevert() {
  return (
    <a title={""} onClick={() => onRecordEdit(["record"], undefined)}>
      revert
    </a>
  );
}
