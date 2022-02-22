import LightningFS from '@isomorphic-git/lightning-fs';
import http from 'isomorphic-git/http/web'
import { queryMetadir } from '@utils'
import { fetchDataMetadir } from '@utils/tbn2'

jest.mock('@utils/tbn2')

const event1 = {
  "DATUM": "value1",
  "FILE_PATH": "path/to/1",
  "GUEST_DATE": "2001-01-01",
  "HOST_DATE": "2001-01-01",
  "HOST_NAME": "name1",
  "UUID": "8260502525153a8775ecb052f41e4e908aba4c94b07ef90263fff77195392704",
}

const event2 = {
  "DATUM": "value2",
  "FILE_PATH": "path/to/2",
  "GUEST_DATE": "2002-01-01",
  "HOST_DATE": "2002-01-01",
  "HOST_NAME": "name2",
  "UUID": "b52dc2b8884fc396c108c095da157d8607ee7d61a1e6b4b501b660d42f93c58e",
}

const event3 = {
  "DATUM": "",
  "FILE_PATH": "",
  "GUEST_DATE": "2003-01-01",
  "HOST_DATE": "2003-01-01",
  "HOST_NAME": "name3",
  "UUID": "f35d45c3ee3e68cf9e36ee10df3edb02104c22b2d47ab17e64114ffb9c208265",
}

async function fetchDataMetadirMock(path, fs) {
  switch(path) {
    case "metadir/pairs/datum-guestname.csv":
      return `8260502525153a8775ecb052f41e4e908aba4c94b07ef90263fff77195392704,9367417d63903350aeb7e092bca792263d4fd82d4912252e014e073a8931b4c1
b52dc2b8884fc396c108c095da157d8607ee7d61a1e6b4b501b660d42f93c58e,069587dcb8f8b63329ae53051ba79ba34ba0deb41c7a1e044280d7b6bb15e4f0
f35d45c3ee3e68cf9e36ee10df3edb02104c22b2d47ab17e64114ffb9c208265,b218ca013905fc528204bdadf9e104acd87d646a2d90ef834526fbf85b17e690`

    case "metadir/pairs/datum-hostname.csv":
      return `8260502525153a8775ecb052f41e4e908aba4c94b07ef90263fff77195392704,9367417d63903350aeb7e092bca792263d4fd82d4912252e014e073a8931b4c1
b52dc2b8884fc396c108c095da157d8607ee7d61a1e6b4b501b660d42f93c58e,069587dcb8f8b63329ae53051ba79ba34ba0deb41c7a1e044280d7b6bb15e4f0
f35d45c3ee3e68cf9e36ee10df3edb02104c22b2d47ab17e64114ffb9c208265,b218ca013905fc528204bdadf9e104acd87d646a2d90ef834526fbf85b17e690`

    case "metadir/pairs/datum-guestdate.csv":
      return `8260502525153a8775ecb052f41e4e908aba4c94b07ef90263fff77195392704,4935b73812dd87780ee8deae03d0bbcb125bbcdc05271066ca527ab029e4e79d
b52dc2b8884fc396c108c095da157d8607ee7d61a1e6b4b501b660d42f93c58e,161c6b3d37ba3341b7775b10730b2ded837c3d84d77fb1a046fa198e9db8cbbc
f35d45c3ee3e68cf9e36ee10df3edb02104c22b2d47ab17e64114ffb9c208265,28a15dd418a2eed8bc7c2133b21bf942182cc58160dfea0c9dd98f155d80ea10`

    case "metadir/pairs/datum-hostdate.csv":
      return `8260502525153a8775ecb052f41e4e908aba4c94b07ef90263fff77195392704,4935b73812dd87780ee8deae03d0bbcb125bbcdc05271066ca527ab029e4e79d
b52dc2b8884fc396c108c095da157d8607ee7d61a1e6b4b501b660d42f93c58e,161c6b3d37ba3341b7775b10730b2ded837c3d84d77fb1a046fa198e9db8cbbc
f35d45c3ee3e68cf9e36ee10df3edb02104c22b2d47ab17e64114ffb9c208265,28a15dd418a2eed8bc7c2133b21bf942182cc58160dfea0c9dd98f155d80ea10`

    case "metadir/pairs/datum-filepath.csv":
      return `8260502525153a8775ecb052f41e4e908aba4c94b07ef90263fff77195392704,01f8dafeb2559c983006156763f9c3b951b64688b3b41a9e5ad7cb695110e8ee
b52dc2b8884fc396c108c095da157d8607ee7d61a1e6b4b501b660d42f93c58e,424bd3271c0c940304ec6e9f4412a422735caeeb9638038bf509e36ae5d4f865`

    case "metadir/props/name/index.csv":
      return `9367417d63903350aeb7e092bca792263d4fd82d4912252e014e073a8931b4c1,name1
069587dcb8f8b63329ae53051ba79ba34ba0deb41c7a1e044280d7b6bb15e4f0,name2
b218ca013905fc528204bdadf9e104acd87d646a2d90ef834526fbf85b17e690,name3`

    case "metadir/props/date/index.csv":
      return `4935b73812dd87780ee8deae03d0bbcb125bbcdc05271066ca527ab029e4e79d,2001-01-01
161c6b3d37ba3341b7775b10730b2ded837c3d84d77fb1a046fa198e9db8cbbc,2002-01-01
28a15dd418a2eed8bc7c2133b21bf942182cc58160dfea0c9dd98f155d80ea10,2003-01-01`

    case "metadir/props/filepath/index.csv":
      return `01f8dafeb2559c983006156763f9c3b951b64688b3b41a9e5ad7cb695110e8ee,"path/to/1"
424bd3271c0c940304ec6e9f4412a422735caeeb9638038bf509e36ae5d4f865,"path/to/2"
1e8251d0c0cfed1944735156e09c934976ece0bf6b89f75e0ba16f372ec9aa05,"path/to/3"`

    case "metadir/props/datum/index.csv":
      return `8260502525153a8775ecb052f41e4e908aba4c94b07ef90263fff77195392704,"value1"
b52dc2b8884fc396c108c095da157d8607ee7d61a1e6b4b501b660d42f93c58e,"value2"
f35d45c3ee3e68cf9e36ee10df3edb02104c22b2d47ab17e64114ffb9c208265,""`

    default:
      return ""
  }
}

function sortObject(a) {
  return Object.keys(a).sort().reduce(
    (obj, key) => {
      obj[key] = a[key];
      return obj;
    },
    {}
  )
}

beforeEach(() => {
  fetchDataMetadir.mockImplementation(fetchDataMetadirMock)
});

test('queryMetadir', () => {
  var searchParams = new URLSearchParams()
  searchParams.set('hostname', 'name1')
  return queryMetadir(searchParams, {}).then(data => {
    expect(data).toStrictEqual([sortObject(event1)])
  });
  searchParams.set('hostname', 'name2')
  return queryMetadir(searchParams, {}).then(data => {
    expect(data).toStrictEqual([sortObject(event2)])
  });
  searchParams.set('hostname', 'name3')
  return queryMetadir(searchParams, {}).then(data => {
    expect(data).toStrictEqual([sortObject(event3)])
  });
});
