import React from "react";
import {
  /* ProfileBatchEdit,
   * ProfileBatchView,
   * ProfileSingleEdit, */
  ProfileSingleView,
} from "..";

interface IObservatoryProfileProps {
  schema: any;
  entry: any;
  index: any;
  waypoint: any;
  isBatch: any;
  isEdit: any;
  onEdit: any;
  onRevert: any;
}

export default function ObservatoryProfile({
  schema,
  entry,
  index,
  waypoint,
  isBatch,
  isEdit,
  onEdit,
  onRevert,
}: IObservatoryProfileProps) {
  return <ProfileSingleView {...{ schema, entry, index, waypoint, onEdit }} />;
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
