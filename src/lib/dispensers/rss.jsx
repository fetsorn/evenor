import React from 'react';
import { API } from '../api/index.js';

export const schemaRSS = {
  rss_tag: {
    trunk: 'tags',
    type: 'object',
    description: {
      en: 'Rss git tag',
      ru: 'Тег удаленного RSS git репозитория',
    },
  },
  rss_tag_search: {
    trunk: 'rss_tag',
    type: 'string',
    description: {
      en: 'Search query',
      ru: 'Поисковый запрос',
    },
  },
  rss_tag_target: {
    trunk: 'rss_tag',
    type: 'string',
    description: {
      en: 'Name of database to sync',
      ru: 'Название базы данных для синхронизации',
    },
  },
  rss_tag_token: {
    trunk: 'rss_tag',
    type: 'string',
    description: {
      en: 'Authentication token',
      ru: 'Токен для синхронизации',
    },
  },
  rss_tag_title: {
    trunk: 'rss_tag',
    type: 'string',
    description: {
      en: 'Title of RSS feed',
      ru: 'Название RSS ленты',
    },
  },
  rss_tag_description: {
    trunk: 'rss_tag',
    type: 'string',
    description: {
      en: 'Description of RSS feed',
      ru: 'Описание RSS ленты',
    },
  },
  rss_tag_creator: {
    trunk: 'rss_tag',
    type: 'string',
    description: {
      en: 'Creator of RSS feed',
      ru: 'Создатель RSS ленты',
    },
  },
  rss_tag_item_title: {
    trunk: 'rss_tag',
    type: 'string',
    description: {
      en: 'Branch for post title',
      ru: 'Ветка для названия поста',
    },
  },
  rss_tag_item_description: {
    trunk: 'rss_tag',
    type: 'string',
    description: {
      en: 'Branch for post description',
      ru: 'Ветка для описания поста',
    },
  },
  rss_tag_item_pubdate: {
    trunk: 'rss_tag',
    type: 'string',
    description: {
      en: 'Branch for post pubdate',
      ru: 'Ветка для даты публикации поста',
    },
  },
  rss_tag_item_category: {
    trunk: 'rss_tag',
    description: {
      en: 'Branch for post category',
      ru: 'Ветка для категории поста',
    },
  },
  rss_tag_item_link: {
    trunk: 'rss_tag',
    description: {
      en: 'Branch for post link',
      ru: 'Ветка для ссылки поста',
    },
  },
};

function generateXML(branchEntry, entries, mimetypes, downloadUrls, sizes) {
  const {
    rss_tag_title,
    rss_tag_description,
    rss_tag_creator,
    rss_tag_item_title,
    rss_tag_item_creator,
    rss_tag_item_description,
    rss_tag_item_pubdate,
    rss_tag_item_category,
    rss_tag_item_link,
  } = branchEntry;

  const header = `<?xml version="1.0" encoding="utf-8"?>
<rss version="2.0"
xmlns:content="http://purl.org/rss/1.0/modules/content/"
xmlns:wfw="http://wellformedweb.org/CommentAPI/"
xmlns:dc="http://purl.org/dc/elements/1.1/"
xmlns:atom="http://www.w3.org/2005/Atom"
xmlns:sy="http://purl.org/rss/1.0/modules/syndication/"
xmlns:slash="http://purl.org/rss/1.0/modules/slash/">
`;

  const lastBuildDate = (new Date()).toGMTString();

  const channelHeader = `
    <title>${rss_tag_title ?? ''}</title>
    <atom:link href="" rel="self"
    type="application/rss+xml" />
    <link></link>
    <description>${rss_tag_description}</description>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <language>en-US</language>
`;

  function foo(mimetype, downloadUrl) {
    if (mimetype.includes('audio')) {
      return `<audio controls><source src="${downloadUrl}" type="${mimetype}" /></audio>`;
    }

    if (mimetype.includes('video')) {
      return `<video controls><source src="${downloadUrl}" type="${mimetype}" /></video>`;
    }

    return `<object type="${mimetype}" data="${downloadUrl}" />`;
  }

  function generateItem(entry, mimetype, downloadUrl, size) {
    return `<item>
      <title>${entry[rss_tag_item_title]}</title>
      <dc:creator>
        <![CDATA[${entry[rss_tag_item_creator] ?? 'unknown'}]]>
      </dc:creator>
      <pubDate>${entry[rss_tag_item_pubdate]}</pubDate>
      <category>
        <![CDATA[${entry[rss_tag_item_category]}]]>
      </category>
      <guid isPermaLink="false">${entry.UUID}</guid>
      <description>
        <![CDATA[
           <div>${entry[rss_tag_item_description]}</div>
           ${mimetype && downloadUrl ? foo(mimetype, downloadUrl) : ''}
        ]]>
      </description>
      ${mimetype && downloadUrl && size ? `<enclosure url="${downloadUrl}" length="${size}" type="${mimetype}" />` : ''}
    </item>`;
  }

  const items = entries.map((entry, index) => generateItem(entry, mimetypes[index], downloadUrls[index], sizes[index])).join('\n');

  const xml = `${header}
<channel>
${channelHeader}
${items}
</channel>
</rss>
`;

  return xml;
}

export function RSS({ baseEntry, branchEntry }) {
  async function onRSSsync() {
    const { digestMessage } = await import('@fetsorn/csvs-js');

    const rssUUID = await digestMessage(branchEntry.rss_tag_target);

    const rssAPI = new API(rssUUID);

    const baseAPI = new API(baseEntry.UUID);

    const searchParams = new URLSearchParams(branchEntry.rss_tag_search);

    // get array of entries from repo
    const entries = await baseAPI.select(searchParams);

    // clone to ephemeral repo
    await rssAPI.cloneView(branchEntry.rss_tag_target, branchEntry.rss_tag_token);

    // find all filenames in the entry
    const filenames = entries.map((entry) => entry[branchEntry.rss_tag_item_link]);

    const mime = await import('mime');

    const mimetypes = filenames.map((filename) => (
      filename ? mime.getType(filename) : undefined
    ));

    const files = await Promise.all(filenames.map(async (filename) => {
    // const files = [];
    // for (const filename of filenames) {
      if (filename) {
        const content = await baseAPI.fetchAsset(filename);

        await rssAPI.putAsset(filename, content);

        // files.push(content);

        return content;
      }

      return undefined;
      // }
    }));

    const sizes = files.map((file) => (file ? file.length : undefined));

    // push will try to upload blobs, but we upload them
    // manually here first to get download actions for the template
    if (files.filter(Boolean).length > 0) {
      await rssAPI.uploadBlobsLFS(
        branchEntry.rss_tag_target,
        branchEntry.rss_tag_token,
        files.filter(Boolean),
      );
    }

    const { buildPointerInfo, downloadUrlFromPointer } = await import('@fetsorn/isogit-lfs');

    // download actions for rssAPI
    const downloadUrls = await Promise.all(files.map(async (file) => {
      if (file) {
        const pointerInfo = await buildPointerInfo(file);

        return downloadUrlFromPointer(
          branchEntry.rss_tag_target,
          branchEntry.rss_tag_token,
          pointerInfo,
        );
      }

      return undefined;
    }));

    // generate xml
    const xml = generateXML(branchEntry, entries, mimetypes, downloadUrls, sizes);

    // write file
    await rssAPI.writeFeed(xml);

    await rssAPI.commit();

    await rssAPI.push(branchEntry.rss_tag_target, branchEntry.rss_tag_token);
  }

  return (
    <div>
      <a>{branchEntry.rss_tag_search}</a>
      <br />
      <a>{branchEntry.rss_tag_target}</a>
      <br />
      <a onClick={onRSSsync}>🔄️</a>
    </div>
  );
}
