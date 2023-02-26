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
    task: 'date',
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

export function RSS({ baseEntry, branchEntry }) {
  const rssAPI = new API('rss');

  const baseAPI = new API(baseEntry.UUID);

  async function onRSSsync() {
    /* console.log('onRSSsync') */

    const searchParams = new URLSearchParams(branchEntry.rss_tag_search);

    /* console.log('onRSSsync-searchParams', searchParams) */

    // get array of entries from repo
    const entries = await baseAPI.select(searchParams);

    // clone to ephemeral repo
    await rssAPI.clone(branchEntry.rss_tag_target, branchEntry.rss_tag_token);

    // generate xml
    const xml = generateXML(branchEntry, entries);

    // write file
    await rssAPI.writeFile('feed.xml', xml);

    // commit
    await rssAPI.commit();

    // push
    await rssAPI.addRemote(branchEntry.rss_tag_target);

    await rssAPI.push(branchEntry.rss_tag_token);
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

function generateXML(branchEntry, entries) {
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

  // TODO: generate fresh date
  const date = 'Thu, 15 Dec 2022 16:14:04 +0000';

  const channelHeader = `
    <title>${rss_tag_title ?? ''}</title>
    <atom:link href="" rel="self"
    type="application/rss+xml" />
    <link></link>
    <description>${rss_tag_description}</description>
    <lastBuildDate>${date}</lastBuildDate>
    <language>en-US</language>
`;

  function generateItem(entry) {
    return `<item>
      <title>${entry[rss_tag_item_title]}</title>
      <link>${entry[rss_tag_item_link]}</link>
      <dc:creator>
        <![CDATA[${entry[rss_tag_item_creator] ?? 'unknown'}]]>
</dc:creator>
      <pubDate>${entry[rss_tag_item_pubdate]}</pubDate>
      <category>
        <![CDATA[${entry[rss_tag_item_category]}]]>
</category>
      <guid isPermaLink="false">${entry[rss_tag_item_link]}</guid>
      <description>
        <![CDATA[<p>${entry[rss_tag_item_description]}</p>
        ]]>
</description>
    </item>`;
  }

  const items = entries.map(generateItem).join('\n');

  const xml = `${header}
<channel>
${channelHeader}
${items}
</channel>
</rss>
`;

  return xml;
}
