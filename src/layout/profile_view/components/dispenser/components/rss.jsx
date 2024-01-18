import React from 'react';
import { API } from '../../../../../api/index.js';

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
  rss_tag_item_attribution: {
    trunk: 'rss_tag',
    type: 'string',
    description: {
      en: 'Branch for post attribution',
      ru: 'Ветка для авторов поста',
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
    <title>${feedTitle ?? ''}</title>
    <atom:link href="" rel="self"
    type="application/rss+xml" />
    <link></link>
    <description>${feedDescription}</description>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <language>en-US</language>
`;

  function generateAttachment(mimetype, downloadUrl) {
    if (mimetype.includes('audio')) {
      return `<audio controls><source src="${downloadUrl}" type="${mimetype}" /></audio>`;
    }

    if (mimetype.includes('video')) {
      return `<video controls><source src="${downloadUrl}" type="${mimetype}" /></video>`;
    }

    return `<object type="${mimetype}" data="${downloadUrl}" />`;
  }

  function generateItem(entry, mimetype, downloadUrl, size) {
    return `
    <item>
      <title>${entry[itemTitle]}</title>
      <dc:creator>
        <![CDATA[${entry[itemCreator] ?? 'unknown'}]]>
      </dc:creator>
      <pubDate>${entry[itemPubdate]}</pubDate>
      <category>
        <![CDATA[${entry[itemCategory]}]]>
      </category>
      <guid isPermaLink="false">${entry.UUID}</guid>
      <description>
        <![CDATA[
           <div>${entry[itemAttribution] ?? ''}</div>
           ${mimetype && downloadUrl ? generateAttachment(mimetype, downloadUrl) : ''}
           <div>${entry[itemDescription] ?? ''}</div>
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
    const fileEntries = entries.map((entry) => {
      if (entry[branchEntry.rss_tag_item_link]?.items) {
        return entry[branchEntry.rss_tag_item_link].items[0];
      }
    });

    const mime = await import('mime');

    const mimetypes = fileEntries.map((fileEntry) => {
      if (fileEntry?.filename) {
        const mimetype = mime.getType(fileEntry.filename);

        return mimetype;
      }
    });

    const files = await Promise.all(fileEntries.map(async (fileEntry) => {
    // const files = [];
    // for (const fileEntry of fileEntries) {
      if (fileEntry?.filehash) {
        const content = await baseAPI.fetchAsset(fileEntry.filehash);

        await rssAPI.putAsset(fileEntry.filehash, content);

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
        'origin',
        files.filter(Boolean),
      );
    }

    const { buildPointerInfo } = await import('@fetsorn/isogit-lfs');

    // download actions for rssAPI
    const downloadUrls = await Promise.all(files.map(async (file) => {
      if (file) {
        const pointerInfo = await buildPointerInfo(file);

        return rssAPI.downloadUrlFromPointer(
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

    await rssAPI.push('origin');
  }

  return (
    <div>
      <p>{branchEntry.rss_tag_search}</p>
      <br />
      <p>{branchEntry.rss_tag_target}</p>
      <br />
      <button type="button" onClick={onRSSsync}>🔄️</button>
    </div>
  );
}
