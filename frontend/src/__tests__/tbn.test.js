import LightningFS from '@isomorphic-git/lightning-fs';
import http from 'isomorphic-git/http/web'
import { queryMetadir } from '@utils'
import { fetchDataMetadir } from '@utils/tbn2'

jest.mock('@utils/tbn2');

test('', () => {
  var searchParams = new URLSearchParams();
  searchParams.set('hostname', 'name')

  fetchDataMetadir.mockResolvedValue("")

  return queryMetadir(searchParams, {}).then(data => {
    expect(data).toStrictEqual([]);
  });
});
