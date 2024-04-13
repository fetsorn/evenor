import React from "react";
import { API } from "../../../../../api/index.js";

export const schemaRSS = {
  rss_tag: {
    trunk: "repo",
    task: "dispenser",
    description: {
      en: "Rss git tag",
      ru: "Тег удаленного RSS git репозитория",
    },
  },
  rss_tag_search: {
    trunk: "rss_tag",
    description: {
      en: "Search query",
      ru: "Поисковый запрос",
    },
  },
  rss_tag_target: {
    trunk: "rss_tag",
    description: {
      en: "Name of database to sync",
      ru: "Название базы данных для синхронизации",
    },
  },
  rss_tag_token: {
    trunk: "rss_tag",
    description: {
      en: "Authentication token",
      ru: "Токен для синхронизации",
    },
  },
  rss_tag_title: {
    trunk: "rss_tag",
    description: {
      en: "Title of RSS feed",
      ru: "Название RSS ленты",
    },
  },
  rss_tag_description: {
    trunk: "rss_tag",
    description: {
      en: "Description of RSS feed",
      ru: "Описание RSS ленты",
    },
  },
  rss_tag_creator: {
    trunk: "rss_tag",
    description: {
      en: "Creator of RSS feed",
      ru: "Создатель RSS ленты",
    },
  },
  rss_tag_item_title: {
    trunk: "rss_tag",
    description: {
      en: "Branch for post title",
      ru: "Ветка для названия поста",
    },
  },
  rss_tag_item_attribution: {
    trunk: "rss_tag",
    description: {
      en: "Branch for post attribution",
      ru: "Ветка для авторов поста",
    },
  },
  rss_tag_item_description: {
    trunk: "rss_tag",
    description: {
      en: "Branch for post description",
      ru: "Ветка для описания поста",
    },
  },
  rss_tag_item_pubdate: {
    trunk: "rss_tag",
    description: {
      en: "Branch for post pubdate",
      ru: "Ветка для даты публикации поста",
    },
  },
  rss_tag_item_category: {
    trunk: "rss_tag",
    description: {
      en: "Branch for post category",
      ru: "Ветка для категории поста",
    },
  },
  rss_tag_item_link: {
    trunk: "rss_tag",
    description: {
      en: "Branch for post link",
      ru: "Ветка для ссылки поста",
    },
  },
};

function generateXML(branchRecord, entries, mimetypes, downloadUrls, sizes) {
  const {
    rss_tag_title: feedTitle,
    rss_tag_description: feedDescription,
    // rss_tag_creator: creator,
    rss_tag_item_title: itemTitle,
    rss_tag_item_creator: itemCreator,
    rss_tag_item_description: itemDescription,
    rss_tag_item_attribution: itemAttribution,
    rss_tag_item_pubdate: itemPubdate,
    rss_tag_item_category: itemCategory,
    // rss_tag_item_link: itemLink,
  } = branchRecord;

  const header = `<?xml version="1.0" encoding="utf-8"?>
<rss version="2.0"
xmlns:content="http://purl.org/rss/1.0/modules/content/"
xmlns:wfw="http://wellformedweb.org/CommentAPI/"
xmlns:dc="http://purl.org/dc/elements/1.1/"
xmlns:atom="http://www.w3.org/2005/Atom"
xmlns:sy="http://purl.org/rss/1.0/modules/syndication/"
xmlns:slash="http://purl.org/rss/1.0/modules/slash/">
`;

  const lastBuildDate = new Date().toGMTString();

  const channelHeader = `
    <title>${feedTitle ?? ""}</title>
    <atom:link href="" rel="self"
    type="application/rss+xml" />
    <link></link>
    <description>${feedDescription}</description>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <language>en-US</language>
`;

  function generateAttachment(mimetype, downloadUrl) {
    if (mimetype.includes("audio")) {
      return `<audio controls><source src="${downloadUrl}" type="${mimetype}" /></audio>`;
    }

    if (mimetype.includes("video")) {
      return `<video controls><source src="${downloadUrl}" type="${mimetype}" /></video>`;
    }

    return `<object type="${mimetype}" data="${downloadUrl}" />`;
  }

  function generateItem(record, mimetype, downloadUrl, size) {
    return `
    <item>
      <title>${record[itemTitle]}</title>
      <dc:creator>
        <![CDATA[${record[itemCreator] ?? "unknown"}]]>
      </dc:creator>
      <pubDate>${record[itemPubdate]}</pubDate>
      <category>
        <![CDATA[${record[itemCategory]}]]>
      </category>
      <guid isPermaLink="false">${record.UUID}</guid>
      <description>
        <![CDATA[
           <div>${record[itemAttribution] ?? ""}</div>
           ${mimetype && downloadUrl ? generateAttachment(mimetype, downloadUrl) : ""}
           <div>${record[itemDescription] ?? ""}</div>
        ]]>
      </description>
      ${mimetype && downloadUrl && size ? `<enclosure url="${downloadUrl}" length="${size}" type="${mimetype}" />` : ""}
    </item>`;
  }

  const items = entries
    .map((record, index) =>
      generateItem(record, mimetypes[index], downloadUrls[index], sizes[index]),
    )
    .join("\n");

  const xml = `${header}
<channel>
${channelHeader}
${items}
</channel>
</rss>
`;

  return xml;
}

export function RSS({ baseRecord, branchRecord }) {
  async function onRSSsync() {
    const { digestMessage } = await import("@fetsorn/csvs-js");

    const rssUUID = await digestMessage(branchRecord.rss_tag_target);

    const rssAPI = new API(rssUUID);

    const baseAPI = new API(baseRecord.UUID);

    const searchParams = new URLSearchParams(branchRecord.rss_tag_search);

    // get array of entries from repo
    const entries = await baseAPI.select(searchParams);

    // clone to ephemeral repo
    await rssAPI.cloneView(
      branchRecord.rss_tag_target,
      branchRecord.rss_tag_token,
    );

    // find all filenames in the record
    const fileEntries = entries.map((record) => {
      if (record[branchRecord.rss_tag_item_link]?.items) {
        return record[branchRecord.rss_tag_item_link].items[0];
      }
    });

    const mime = await import("mime");

    const mimetypes = fileEntries.map((fileRecord) => {
      if (fileRecord?.filename) {
        const mimetype = mime.getType(fileRecord.filename);

        return mimetype;
      }
    });

    const files = await Promise.all(
      fileEntries.map(async (fileRecord) => {
        // const files = [];
        // for (const fileRecord of fileEntries) {
        if (fileRecord?.filehash) {
          const content = await baseAPI.fetchAsset(fileRecord.filehash);

          await rssAPI.putAsset(fileRecord.filehash, content);

          // files.push(content);

          return content;
        }

        return undefined;
        // }
      }),
    );

    const sizes = files.map((file) => (file ? file.length : undefined));

    // push will try to upload blobs, but we upload them
    // manually here first to get download actions for the template
    if (files.filter(Boolean).length > 0) {
      await rssAPI.uploadBlobsLFS("origin", files.filter(Boolean));
    }

    const { buildPointerInfo } = await import("@fetsorn/isogit-lfs");

    // download actions for rssAPI
    const downloadUrls = await Promise.all(
      files.map(async (file) => {
        if (file) {
          const pointerInfo = await buildPointerInfo(file);

          return rssAPI.downloadUrlFromPointer(
            branchRecord.rss_tag_target,
            branchRecord.rss_tag_token,
            pointerInfo,
          );
        }

        return undefined;
      }),
    );

    // generate xml
    const xml = generateXML(
      branchRecord,
      entries,
      mimetypes,
      downloadUrls,
      sizes,
    );

    // write file
    await rssAPI.writeFeed(xml);

    await rssAPI.commit();

    await rssAPI.push("origin");
  }

  return (
    <div>
      <p>{branchRecord.rss_tag_search}</p>
      <br />
      <p>{branchRecord.rss_tag_target}</p>
      <br />
      <button type="button" onClick={onRSSsync}>
        🔄️
      </button>
    </div>
  );
}
