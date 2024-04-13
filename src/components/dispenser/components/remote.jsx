import React from "react";
import { API } from "../../../api/index.js";

export const schemaRemote = {
  remote_tag: {
    trunk: "repo",
    task: "dispenser",
    description: {
      en: "Remote git tag",
      ru: "Тег удаленного git репозитория",
    },
  },
  remote_name: {
    trunk: "remote_tag",
    description: {
      en: "Name of git remote",
      ru: "Название remote .git",
    },
  },
  remote_url: {
    trunk: "remote_tag",
    description: {
      en: "Name of database to sync",
      ru: "Название базы данных для синхронизации",
    },
  },
  remote_token: {
    trunk: "remote_tag",
    description: {
      en: "Authentication token",
      ru: "Токен для синхронизации",
    },
  },
};

export function Remote({ baseRecord, branchRecord }) {
  const api = new API(baseRecord.UUID);

  async function onPullRepo() {
    await api.commit();

    await api.pull(branchRecord.remote_name);
  }

  async function onPushRepo() {
    await api.commit();

    await api.push(branchRecord.remote_name);
  }

  async function onRemoteSync() {
    await api.commit();

    await api.addRemote(
      branchRecord.remote_name,
      branchRecord.remote_url,
      branchRecord.remote_token,
    );

    await api.pull(branchRecord.remote_name);

    await api.push(branchRecord.remote_name);
  }

  return (
    <div>
      <p>Remote git</p>
      <p>{branchRecord.remote_url}</p>
      <br />
      <button type="button" onClick={onPullRepo}>
        ⬇️
      </button>
      <button type="button" onClick={onPushRepo}>
        ⬆️
      </button>
      <button type="button" onClick={onRemoteSync}>
        🔄️
      </button>
    </div>
  );
}
