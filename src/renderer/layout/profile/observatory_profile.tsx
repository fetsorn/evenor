import React, { useState } from "react";
import {
  ProfileBatchEdit,
  ProfileBatchView,
  ProfileSingleEdit,
  ProfileSingleView,
} from "./components";

interface IObservatoryProfileProps {
  schema: any;
  entry: any;
  index: any;
  group: any;
  isBatch: any;
  isEdit: any;
  onSave: any;
  onEdit: any;
  onClose: any;
  onRevert: any;
  onDelete: any;
  onAddProp: any;
  onInputChange: any;
  onInputRemove: any;
  onInputUpload: any;
  onInputUploadElectron: any;
}

export default function ObservatoryProfile({
  schema,
  entry,
  index,
  group,
  isBatch,
  isEdit,
  onSave,
  onEdit,
  onClose,
  onRevert,
  onDelete,
  onAddProp,
  onInputChange,
  onInputRemove,
  onInputUpload,
  onInputUploadElectron,
}: IObservatoryProfileProps) {
  return (
    <>
      {isBatch ? (
        isEdit ? (
          <ProfileBatchEdit />
        ) : (
          <ProfileBatchView />
        )
      ) : isEdit ? (
        <ProfileSingleEdit
          {...{
            schema,
            group,
            onAddProp,
            entry,
            index,
            onSave,
            onRevert,
            onInputChange,
            onInputRemove,
            onInputUpload,
            onInputUploadElectron,
          }}
        />
      ) : (
        <ProfileSingleView
          {...{ schema, entry, index, group, onEdit, onClose, onDelete }}
        />
      )}
    </>
  );
}
