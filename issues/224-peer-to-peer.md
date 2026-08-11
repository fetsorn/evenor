# Document Title
| capability\instance | git hosting | soft-serve | device | browser |
|---------------------|-------------|------------|--------|---------|
| has an id           | public URL  | ip+port    | uuid   | uuid    |
| receive pushes      | V           | V          | V      | X       |
| serve fetches       | V           | V          | V      | X       |
| reachable           | V           | V          | V      | X       |
| broadcast           | X           | X          | V      | X       |
| push                | X           | X          | V      | V       |
| fetch               | X           | X          | V      | V       |
| listen to broadcast | X           | X          | V      | V       |

 * maybe browser can be reachable over libp2p proxy

this is separate from git
evenor won't broadcast to the network because security
requests for wrong token should return nothing same as requests for wrong address

show peers as a list, and requests as a list
register a protocol link in apple/android
insert link in the search bar or address bar

- mobile is a guest, desktop is a host.
- both listen on the network but do not broadcast or announce themselves
- guest generates a public link which allows to dial a dataset.
- host opens the link.
- guest adds the host to peers of the dataset.
- host adds the guest as peer in the dataset.
- host gives permission to update.
- guest asks to update, host sees a request to update, confirms.
- host is updated with entries from guest.
- host gives permission to select.
- guest asks to select, host sees a request and approves.
- guest selects entries from host.
- host can remove the public link and the guest won't even be able to dial the host

- root
  - haven
     - id
     - mind
       - id
       - schema

for local peer, list of minds comes from the filesystem
for other peers, minds come over the network as a select call
by default, a dataset is private, and dialing guests can't see it.
a peer can give a public link to another peer with a multiaddr and some temporary token
if user sets dataset as public, dialing guests can see it.
use multiaddr for addressing in the public link.
when a guest requests some action from the dialed host, host must approve
there is no stateful authorization framework other than a public link that allows dialing, and direct approval of requests

there are various types of havens - git, peer, tg channel, rss. you could consider a haven anything that can be seen as a list of csvs datasets


right now every time user clones a repo it gets a new uuid. instead the uuid should persist between distributed instances unless user explicitly changes uuid post-clone
take uuid from .csvs on clone
take from schema after 0.0.3 spec change

this could be
 - nfs
 - libp2p
 - embedded git binary with fastcgi over http-git-backend

let's talk about servers that can serve csvs. each has a list of capabilities
 - has an id
 - receive pushes
 - reply to fetches
 - broadcast itself to the network
 - be reachable over the network
 - can push
 - can fetch
 - can listen to broadcasts of others on the network

a git hosting server
 - has an id as a URL
 - can receive pushes
 - can reply to 
...

a desktop and phone instance
 - an id 
 - can push

a browser instance 
 - cannot be pushed to
 - doesn't broadcast (unless over proxy?)

a local csvs server
 - can push
 - cannot receive
