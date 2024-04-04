import React from "react";
import smalltalk from "smalltalk";
//import { TelegramClient } from "telegram";
//import { StringSession } from "telegram/sessions";
import MP3Tag from "mp3tag.js";
import { API } from "../../../../../api/index.js";

export const schemaTG = {
  tg_tag: {
    trunk: "repo",
    description: {
      en: "Tag TG channel",
      ru: "Тег TG канала",
    },
  },
  tg_tag_api_id: {
    trunk: "tg_tag",
    description: {
      en: "Authentication api ID",
      ru: "API ID токен",
    },
  },
  tg_tag_api_hash: {
    trunk: "tg_tag",
    description: {
      en: "Authentication api hash",
      ru: "API хэш",
    },
  },
  tg_tag_phone: {
    trunk: "tg_tag",
    description: {
      en: "Телефонный номер",
      ru: "Phone number",
    },
  },
  tg_tag_password: {
    trunk: "tg_tag",
    description: {
      en: "Password",
      ru: "Пароль",
    },
  },
  tg_tag_otp: {
    trunk: "tg_tag",
    description: {
      en: "Verification code",
      ru: "Код подтверждения",
    },
  },
  tg_tag_session: {
    trunk: "tg_tag",
    description: {
      en: "Session string",
      ru: "Токен сессии",
    },
  },
  tg_tag_search: {
    trunk: "tg_tag",
    description: {
      en: "Search query",
      ru: "Поисковый запрос",
    },
  },
  tg_tag_channel_id: {
    trunk: "tg_tag",
    description: {
      en: "TG channel handle",
      ru: "Адрес TG канала",
    },
  },
};

async function postRecord(client, baseAPI, isPublished, channelID, record) {
  let recordID;

  let fileHandle;

  if (record.files?.items) {
    // TODO support multiple files
    const fileRecord = record.files.items[0];

    recordID = fileRecord.filehash;
  } else {
    const { digestMessage } = await import("@fetsorn/csvs-js");

    recordID = await digestMessage(record.datum);
  }

  if (!isPublished.get(recordID)) {
    let params = { silent: true };

    if (record.files?.items) {
      const fileRecord = record.files.items[0];

      // send text for each unpublished record
      let contents = await baseAPI.fetchAsset(fileRecord.filehash);

      const mime = await import("mime");

      const mimetypeNew = mime.getType(fileRecord.filename);

      const ext = fileRecord.filename.split(".").pop().trim();

      if (ext == "mp3") {
        const mp3tag = new MP3Tag(contents.buffer, false);

        mp3tag.read();

        if (mp3tag.error !== "") throw new Error(mp3tag.error);

        mp3tag.remove();

        mp3tag.tags.title = recordID;
        mp3tag.tags.artist = record.actname ?? undefined;

        contents = mp3tag.save();
      }

      const blob = new Blob([contents], { type: mimetypeNew });

      const file = new File([blob], `${recordID}.${ext}`);

      fileHandle = await client.uploadFile({ file });

      if (fileHandle) {
        params.file = fileHandle;
      }

      params.message = `${record.attribution}\n${record.actdate ?? "0000-00-00"}`;
    } else {
      params.message = `${record.datum}\n${record.actdate ?? "0000-00-00"}`;
    }

    await client.sendMessage(`@${channelID}`, params);
  }
}

export function TG({ baseRecord, branchRecord }) {
  //  async function onTGsync() {
  //    const stringSession = new StringSession(branchRecord.tg_tag_session ?? "");

  //    const client = new TelegramClient(
  //      stringSession,
  //      parseInt(branchRecord.tg_tag_api_id),
  //      branchRecord.tg_tag_api_hash,
  //      { connectionRetries: 5, useWSS: true }
  //    );
  //
  //    // if no session token, login and save session token
  //    // TODO check if session token expired
  //    if (branchRecord.tg_tag_session === undefined) {
  //      await client.start({
  //        phoneNumber: branchRecord.tg_tag_phone,
  //        password: async () => branchRecord.tg_tag_password,
  //        phoneCode: async () => smalltalk.prompt("Please enter the code you received: ", "OTP code", 1),
  //        onError: (err) => console.log(err),
  //      });
  //
  //      const session = client.session.save()
  //
  //      const rootAPI = new API('root');
  //
  //      const baseRecordNew = JSON.parse(JSON.stringify(baseRecord))
  //
  //      const itemsNew = baseRecordNew.tags.items.filter((i) => i.UUID != branchRecord)
  //
  //      itemsNew.push({tg_tag_session: session, ...branchRecord})
  //
  //      baseRecordNew.tags.items = itemsNew;
  //
  //      await rootAPI.updateRecord(baseRecordNew)
  //    }
  //
  //    await client.connect()
  //
  //    const isPublished = new Map()
  //
  //    const chat = await client.getEntity(`@${branchRecord.tg_tag_channel_id}`);
  //
  //    for await (const message of client.iterMessages(chat,{})) {
  //      let recordID;
  //
  //      // read recordID from attachment name or text hash
  //      if (message.file) {
  //        recordID = message.file.name
  //
  //        recordID = recordID.replace(/\.[^/.]+$/, "")
  //      } else {
  //        const { digestMessage } = await import('@fetsorn/csvs-js');
  //
  //        const datum = message.text.substring(0, message.text.length - 11)
  //
  //        recordID = await digestMessage(datum);
  //      }
  //
  //      isPublished.set(recordID, true)
  //    }
  //
  //    const searchParams = new URLSearchParams(branchRecord.tg_tag_search);
  //
  //    const baseAPI = new API(baseRecord.UUID);
  //
  //    const entries = await baseAPI.select(searchParams);
  //
  //    return Promise.all(
  //      entries.map(async (record) => postRecord(
  //        client,
  //        baseAPI,
  //        isPublished,
  //        branchRecord.tg_tag_channel_id,
  //        record
  //      ))
  //    )
  //  }

  return (
    <div>
      <a>{branchRecord.tg_tag_search}</a>
      <br />
      <a>{branchRecord.tg_tag_channel_id}</a>
      <br />
      <a onClick={onTGsync}>🔄️</a>
    </div>
  );
}
