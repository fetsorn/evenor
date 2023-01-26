import React, { useState } from "react";
import {
  ProfileBatchEdit,
  ProfileBatchView,
  ProfileSingleEdit,
  ProfileSingleView,
} from "./components";

export default function Profile() {
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
