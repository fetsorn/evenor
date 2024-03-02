import React from 'react';
import smalltalk from 'smalltalk';
//import { TelegramClient } from "telegram";
//import { StringSession } from "telegram/sessions";
import MP3Tag from "mp3tag.js"
import { API } from '../../../../../api/index.js';

export const schemaTG = {
  tg_tag: {
    trunk: 'tags',
    type: 'object',
    description: {
      en: 'Tag TG channel',
      ru: 'Тег TG канала',
    },
  },
  tg_tag_api_id: {
    trunk: 'tg_tag',
    type: 'string',
    description: {
      en: 'Authentication api ID',
      ru: 'API ID токен',
    },
  },
  tg_tag_api_hash: {
    trunk: 'tg_tag',
    type: 'string',
    description: {
      en: 'Authentication api hash',
      ru: 'API хэш',
    },
  },
  tg_tag_phone: {
    trunk: 'tg_tag',
    type: 'string',
    description: {
      en: 'Телефонный номер',
      ru: 'Phone number',
    },
  },
  tg_tag_password: {
    trunk: 'tg_tag',
    type: 'string',
    description: {
      en: 'Password',
      ru: 'Пароль',
    },
  },
  tg_tag_otp: {
    trunk: 'tg_tag',
    type: 'string',
    description: {
      en: 'Verification code',
      ru: 'Код подтверждения',
    },
  },
  tg_tag_session: {
    trunk: 'tg_tag',
    type: 'string',
    description: {
      en: 'Session string',
      ru: 'Токен сессии',
    },
  },
  tg_tag_search: {
    trunk: 'tg_tag',
    type: 'string',
    description: {
      en: 'Search query',
      ru: 'Поисковый запрос',
    },
  },
  tg_tag_channel_id: {
    trunk: 'tg_tag',
    type: 'string',
    description: {
      en: 'TG channel handle',
      ru: 'Адрес TG канала',
    },
  },
};

async function postEntry(client, baseAPI, isPublished, channelID, entry) {
  let entryID;

  let fileHandle;

  if (entry.files?.items) {
    // TODO support multiple files
    const fileEntry = entry.files.items[0];

    entryID = fileEntry.filehash;
  } else {
    const { digestMessage } = await import('@fetsorn/csvs-js');

    entryID = await digestMessage(entry.datum);
  }

  if (!isPublished.get(entryID)) {
    let params = { silent: true };

    if (entry.files?.items) {
      const fileEntry = entry.files.items[0];

      // send text for each unpublished entry
      let contents = await baseAPI.fetchAsset(fileEntry.filehash);

      const mime = await import('mime');

      const mimetypeNew = mime.getType(fileEntry.filename);

      const ext = fileEntry.filename.split('.').pop().trim();

      if (ext == "mp3") {
        const mp3tag = new MP3Tag(contents.buffer, false)

        mp3tag.read()

        if (mp3tag.error !== '') throw new Error(mp3tag.error)

        mp3tag.remove()

        mp3tag.tags.title = entryID
        mp3tag.tags.artist = entry.actname ?? undefined

        contents = mp3tag.save()
      }

      const blob = new Blob([contents], { type: mimetypeNew });

      const file = new File([blob], `${entryID}.${ext}`)

      fileHandle = await client.uploadFile({file})

      if (fileHandle) { params.file = fileHandle };

      params.message = `${entry.attribution}\n${entry.actdate ?? "0000-00-00"}`;
    } else {
      params.message = `${entry.datum}\n${entry.actdate ?? "0000-00-00"}`;
    }

    await client.sendMessage(
      `@${channelID}`,
      params
    );
  }
}

export function TG({ baseEntry, branchEntry }) {
//  async function onTGsync() {
//    const stringSession = new StringSession(branchEntry.tg_tag_session ?? "");

//    const client = new TelegramClient(
//      stringSession,
//      parseInt(branchEntry.tg_tag_api_id),
//      branchEntry.tg_tag_api_hash,
//      { connectionRetries: 5, useWSS: true }
//    );
//
//    // if no session token, login and save session token
//    // TODO check if session token expired
//    if (branchEntry.tg_tag_session === undefined) {
//      await client.start({
//        phoneNumber: branchEntry.tg_tag_phone,
//        password: async () => branchEntry.tg_tag_password,
//        phoneCode: async () => smalltalk.prompt("Please enter the code you received: ", "OTP code", 1),
//        onError: (err) => console.log(err),
//      });
//
//      const session = client.session.save()
//
//      const rootAPI = new API('root');
//
//      const baseEntryNew = JSON.parse(JSON.stringify(baseEntry))
//
//      const itemsNew = baseEntryNew.tags.items.filter((i) => i.UUID != branchEntry)
//
//      itemsNew.push({tg_tag_session: session, ...branchEntry})
//
//      baseEntryNew.tags.items = itemsNew;
//
//      await rootAPI.updateEntry(baseEntryNew)
//    }
//
//    await client.connect()
//
//    const isPublished = new Map()
//
//    const chat = await client.getEntity(`@${branchEntry.tg_tag_channel_id}`);
//
//    for await (const message of client.iterMessages(chat,{})) {
//      let entryID;
//
//      // read entryID from attachment name or text hash
//      if (message.file) {
//        entryID = message.file.name
//
//        entryID = entryID.replace(/\.[^/.]+$/, "")
//      } else {
//        const { digestMessage } = await import('@fetsorn/csvs-js');
//
//        const datum = message.text.substring(0, message.text.length - 11)
//
//        entryID = await digestMessage(datum);
//      }
//
//      isPublished.set(entryID, true)
//    }
//
//    const searchParams = new URLSearchParams(branchEntry.tg_tag_search);
//
//    const baseAPI = new API(baseEntry.UUID);
//
//    const entries = await baseAPI.select(searchParams);
//
//    return Promise.all(
//      entries.map(async (entry) => postEntry(
//        client,
//        baseAPI,
//        isPublished,
//        branchEntry.tg_tag_channel_id,
//        entry
//      ))
//    )
//  }

  return (
    <div>
      <a>{branchEntry.tg_tag_search}</a>
      <br />
      <a>{branchEntry.tg_tag_channel_id}</a>
      <br />
      <a onClick={onTGsync}>🔄️</a>
    </div>
  );
}
