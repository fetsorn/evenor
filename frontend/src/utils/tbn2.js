import http from 'isomorphic-git/http/web'
import LightningFS from '@isomorphic-git/lightning-fs';
import git from 'isomorphic-git'

export async function fetchDataMetadir(path, fs) {

  var pfs = fs.promises

  var restext = ""

  try {

    const { REACT_APP_BUILD_MODE } = process.env;

    if (REACT_APP_BUILD_MODE === "local") {
      // fetch cache
      var res = await fetch(`/api/` + path)
      restext = await res.text()
    } else {
      // check if path exists in the repo
      var path_elements = path.split('/')
      var root = window.dir
      for (var i=0; i < path_elements.length; i++) {
        let path_element = path_elements[i]
        var files = await pfs.readdir(root);
        console.log(files)
        if (files.includes(path_element)) {
          root += '/' + path_element
          // console.log(`${root} has ${path_element}`)
        } else {
          console.error(`Cannot load file. Ensure there is a file called ${path_element} in ${root}.`);
          break
        }
      }
      // console.log(window.dir + '/' + path)
      restext = new TextDecoder().decode(await pfs.readFile(window.dir + '/' + path));
      console.log("fetch file:", path, restext)
    }

  } catch (e) {
    console.error(e)
  }

  return restext

}
