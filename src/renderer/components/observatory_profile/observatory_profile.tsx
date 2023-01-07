import React, { useState } from "react";
import {
  /* ProfileBatchEdit,
   * ProfileBatchView,
   * ProfileSingleEdit, */
  ProfileSingleView,
} from "..";

interface IObservatoryProfileProps {
  entry: any;
  index: any;
  group: any;
  isBatch: any;
  onSave: any;
}

export default function ObservatoryProfile({
  entry,
  index,
  group,
  isBatch,
  onSave,
}: IObservatoryProfileProps) {
  const [isEdit, setIsEdit] = useState(false);

  function onEdit() {
    setIsEdit(true);
  }

  function onRevert() {
    setIsEdit(false);
  }

  return <ProfileSingleView {...{ entry, index, group, onEdit }} />;
}

/*
 *   isBatch ? (
 *     isEdit ? (
 *       <ProfileBatchEdit {...{ onRevert }} />
 *     ) : (
 *       <ProfileBatchView {...{ onEdit }} />
 *     )
 *   ) : isEdit ? (
 *     <ProfileSingleEdit {...{ onRevert }} />
 *   ) : (
 *     <ProfileSingleView {...{ schema, entry, index, waypoint, onEdit }} />
 *   ); */
