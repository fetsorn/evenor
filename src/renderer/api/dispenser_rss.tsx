import { clone, push, gitcommit, addRemote } from './dispenser_repo';
import { fs, searchRepo } from './api';

interface IRSSProps {
  baseEntry: any;
  branchEntry: any;
}

async function writeFile(dir: string, xml: string) {
  console.log('writeFile', dir + "/" + "feed.xml", xml);

  const pfs = fs.promises;

  await pfs.writeFile(dir + "/" + "feed.xml", xml, "utf8");

  console.log('writeFile-finish')
}

export function RSS({baseEntry, branchEntry}: IRSSProps) {

    async function onRSSsync() {
      /* console.log('onRSSsync') */

      const searchParams = new URLSearchParams(branchEntry.rss_tag_search);

      /* console.log('onRSSsync-searchParams', searchParams) */

      // get array of entries from repo
      const entries = await searchRepo(`repos/${baseEntry.reponame}`, searchParams);

      // clone to ephemeral repo
      await clone(branchEntry.rss_tag_target, branchEntry.rss_tag_token, '/store/rss');

      // generate xml
      const xml: string = generateXML(branchEntry, entries);

      /* console.log('generateXML-finish', xml) */

      // write file
      await writeFile(`/store/rss`, xml);

      // commit
      await gitcommit(`/store/rss`);

      // push
      await addRemote(`/store/rss`, branchEntry.rss_tag_target);

      await push(`/store/rss`, branchEntry.rss_tag_token);
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

function generateXML(branchEntry: any, entries: any[]) {

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
    <atom:link href="https://static.fetsorn.website/" rel="self"
    type="application/rss+xml" />
    <link>https://static.fetsorn.website</link>
    <description>${rss_tag_description}</description>
    <lastBuildDate>${date}</lastBuildDate>
    <language>en-US</language>
`

  function generateItem(entry: any) {
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
