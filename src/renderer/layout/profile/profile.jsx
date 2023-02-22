import React from "react";
import {
  ProfileBatchEdit,
  ProfileBatchView,
  ProfileSingleEdit,
  ProfileSingleView,
} from "./components";
import { useStore } from "@/store";

export function Profile() {
  const [isBatch, isEdit] = useStore((state) => [state.isBatch, state.isEdit])

  return (
    <>
      {isBatch ? (
        isEdit ? (
          <ProfileBatchEdit />
        ) : (
          <ProfileBatchView />
        )
      ) : isEdit ? (
        <ProfileSingleEdit />
      ) : (
        <ProfileSingleView />
      )}
    </>
  );
}
