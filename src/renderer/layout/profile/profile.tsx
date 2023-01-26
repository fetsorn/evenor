import React, { useState } from "react";
import {
  ProfileBatchEdit,
  ProfileBatchView,
  ProfileSingleEdit,
  ProfileSingleView,
} from "./components";
import { useStore } from "../../store";

export default function Profile() {
  const isBatch = useStore((state) => state.isBatch)

  const isEdit = useStore((state) => state.isEdit)

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
