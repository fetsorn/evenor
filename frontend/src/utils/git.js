import http from 'isomorphic-git/http/web'
import LightningFS from '@isomorphic-git/lightning-fs';
import git from 'isomorphic-git'
import mime from 'mime'

export function gitInit() {
  window.fs = new LightningFS('fs')
  window.pfs = window.fs.promises
  window.dir = "/git/"
}

export async function fetchDataMetadir(path) {

  var restext = undefined

  try {
    // check if path exists in the repo
    var path_elements = path.split('/')
    var root = window.dir
    for (var i=0; i < path_elements.length; i++) {
      let path_element = path_elements[i]
      var files = await window.pfs.readdir(root);
      // console.log(files)
      if (files.includes(path_element)) {
        root += '/' + path_element
        // console.log(`${root} has ${path_element}`)
      } else {
        console.error(`Cannot load file. Ensure there is a file called ${path_element} in ${root}.`);
        break
      }
    }
    restext = new TextDecoder().decode(await window.pfs.readFile(window.dir + '/' + path));
    // console.log("fetch file:", path, restext)
  } catch (e) {
    console.error(e)
  }

  return restext

}

export async function writeDataMetadir(path, content) {
  await window.pfs.writeFile(window.dir + path,
                             content,
                             'utf8')
}

const SPEC_URL = 'https://git-lfs.github.com/spec/v1';
const LFS_POINTER_PREAMBLE = `version ${SPEC_URL}\n`;
function pointsToLFS(content) {
  return (
    content[0] === 118) // 'v'
    // && content.subarray(0, 100).indexOf(LFS_POINTER_PREAMBLE) === 0);
    // tries to find preamble at the start of the pointer, fails for some reason
}

async function bodyToBuffer(body) {
  const buffers = [];
  let offset = 0;
  let size = 0;
  for await (const chunk of body) {
    buffers.push(chunk);
    size += chunk.byteLength;
  }

  const result = new Uint8Array(size);
  for (const buffer of buffers) {
    result.set(buffer, offset);
    offset += buffer.byteLength;
  }
  return Buffer.from(result.buffer);
}

export async function resolveLFS(path, url, token) {

  var restext = await fetchDataMetadir(path);
  var lines = restext.split('\n')
  var oid = lines[1].slice(11)
  var size = parseInt(lines[2].slice(5))

  const lfsInfoRequestData = {
    operation: 'download',
    objects: [{oid, size}],
    transfers: ['basic'],
    ref: { name: "refs/heads/main" },
  }

  var lfsInfoBody
  if (token != "") {
    const { body } = await http.request({
      url: `${url}/info/lfs/objects/batch`,
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${token}:`).toString('base64')}`,
        'Accept': 'application/vnd.git-lfs+json',
        'Content-Type': 'application/vnd.git-lfs+json',
      },
      body: [Buffer.from(JSON.stringify(lfsInfoRequestData))],
    });
    lfsInfoBody = body
  } else {
    const { body } = await http.request({
      url: `${url}/info/lfs/objects/batch`,
      method: 'POST',
      headers: {
        'Accept': 'application/vnd.git-lfs+json',
        'Content-Type': 'application/vnd.git-lfs+json',
      },
      body: [Buffer.from(JSON.stringify(lfsInfoRequestData))],
    });
    lfsInfoBody = body
  }

  var lfsInfoResponseRaw = (await bodyToBuffer(lfsInfoBody)).toString()
  var lfsInfoResponse = JSON.parse(lfsInfoResponseRaw)
  console.log("resolveLFS")
  console.log(lfsInfoRequestData)
  console.log(lfsInfoResponse)
  var downloadAction = lfsInfoResponse.objects[0].actions.download
  const lfsObjectDownloadURL = downloadAction.href;
  const lfsObjectDownloadHeaders = downloadAction.header ?? {};

  const { body: lfsObjectBody } = await http.request({
    url: lfsObjectDownloadURL,
    method: 'GET',
    headers: lfsObjectDownloadHeaders,
  });

  var lfsObjectBuffer = await bodyToBuffer(lfsObjectBody)

  const mimetype = mime.getType(path)

  const blob = new Blob([lfsObjectBuffer], { type: mimetype });

  return URL.createObjectURL(blob, { type: mimetype })

}

export async function clone(url, token) {
  console.log("clone", url, token)

  console.log(await window.pfs.readdir("/"))
  if ((await window.pfs.readdir("/")).includes("git")) {
    // presume that the repo is fine if /git exists
    console.log("repo exists")
  } else {
    await window.pfs.mkdir(window.dir);
    // attempt to clone a public repo if no token is provided
    if (token === "") {
      await git.clone({
        fs: window.fs,
        http,
        dir: window.dir,
        url,
        singleBranch: true,
        depth: 10
      })
    } else {
      await git.clone({
        fs: window.fs,
        http,
        dir: window.dir,
        url,
        singleBranch: true,
        depth: 10,
        onAuth: () => ({
          username: token
        })
      })
    }
    console.log("repo cloned")
  }
}

export async function commit(token, ref) {
  const message = []
  const statusMatrix = await git.statusMatrix({
    fs: window.fs,
    dir: window.dir
  })
  for (let [
    filePath,
    HEADStatus,
    workingDirStatus,
    stageStatus,
  ] of statusMatrix) {
    if (HEADStatus === workingDirStatus && workingDirStatus === stageStatus) {
      await git.resetIndex({
        fs: window.fs,
        dir: window.dir,
        filepath: filePath
      });
      [filePath, HEADStatus, workingDirStatus, stageStatus] = (
        await git.statusMatrix({
          fs: window.fs,
          dir: window.dir,
          filepaths: [filePath]
        })
      )
      if (
        HEADStatus === workingDirStatus &&
        workingDirStatus === stageStatus
      ) {
        continue
      }
    }
    if (workingDirStatus !== stageStatus) {
      let status
      if (workingDirStatus === 0) {
        status = 'deleted'
        await git.remove({
          fs: window.fs,
          dir: window.dir,
          filepath: filePath
        })
      } else {
        await git.add({
          fs: window.fs,
          dir: window.dir,
          filepath: filePath
        })
        if (HEADStatus === 1) {
          status = 'modified'
        } else {
          status = 'added'
        }
      }
      message.push(`${filePath} ${status}`)
    }
  }
  if (message.length !== 0) {
    const commitRef = await git.commit({
      fs: window.fs,
      dir: window.dir,
      author: {
        name: 'name',
        email: 'name@mail.com'
      },
      message: message.toString()
    })
    let pushResult = await git.push({
      fs: window.fs,
      http,
      dir: window.dir,
      remote: 'origin'
    })
  }
}
  // let sha = await git.commit({
  //   fs: window.fs,
  //   dir: window.dir,
  //   message: 'antea edit',
  //   author: {
  //     name: 'name',
  //     email: 'name@mail.com'
  //   }
  // })

export async function wipe() {
  new LightningFS('fs', {wipe: true})
}
