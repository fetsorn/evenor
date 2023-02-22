import { API } from "../api";

export function RSS({ baseEntry, branchEntry }) {

  const rssAPI = new API('/store/rss');

  const baseAPI = new API(`/repos/${baseEntry.reponame}`);

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
    await rssAPI.writeFile("feed.xml", xml);

    // commit
    await rssAPI.commit();

    // push
    await rssAPI.addRemote(branchEntry.rss_tag_target);

    await rssAPI.push(branchEntry.rss_tag_token);
  }

  return (
    <div>
      <a>{branchEntry.rss_tag_search}</a>
      <br/>
      <a>{branchEntry.rss_tag_target}</a>
      <br/>
      <a onClick={onRSSsync}>🔄️</a>
    </div>
  )
}

function generateXML(branchEntry, entries) {

  const { rss_tag_title,
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
`

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
`

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
    </item>`
  }

  const items = entries.map(generateItem).join('\n');

  const xml = `${header}
<channel>
${channelHeader}
${items}
</channel>
</rss>
`

  return xml
}
