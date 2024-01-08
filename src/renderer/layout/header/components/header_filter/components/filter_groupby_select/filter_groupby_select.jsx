import React from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '@/store/index.js';
import styles from './filter_groupby_select.module.css';


export function FilterGroupBySelect({
  
}) {
  const { i18n, t } = useTranslation();

  const [
		groupBy,
    schema,
		base,
		setGroupBy,
  ] = useStore((state) => [
		state.groupBy,
    state.schema,
		state.base,
		state.setGroupBy,
  ]);

	function foo(schema, base) {
		console.log(`filter_query_plus: foo-base-${base}`);
		// when base undefined then return empty array
		// if (base === undefined) {
		// 	return []
		// }
		// pass to fields of schema and find fields where trunk == base
		// return [leaf, leaf, leaf ]
		//когда на сайте в base выбран reponame, плюс должен возвращать schema, category, tags
		// if (base === "reponame") {
		// 	return ["schema", "category", "tags"]
		// }
		//когда на сайте в base выбран tags, плюс должен возвращать sync_tag, remote_tag, rss_tag, local_tag, zip_tag, tg_tag
		// if (base === "tags") {
		// 	return ["sync_tag", "remote_tag", "rss_tag", "local_tag","zip_tag", "tg_tag"]
		// }
		// как найти все листочки base. Когда на сайте выбран base плюс должен возвращать все ветки у которых trunk === base.
		return Object.keys(schema).filter((branch) => schema[branch].trunk === base)
		
	}
	const options = foo(schema, base)
	
	
// const options = Object.keys(schema)
console.log(schema);

  return (
		<label htmlFor={`selectGroupBy`}>
			{t('header.dropdown.groupby')}
		<select
					id={`selectGroupBy`}
          value={groupBy}
          onChange={({ target: { value } }) => {
						setGroupBy(value)					
          }}
        >
          {options.map((field) => (
            <option key={crypto.getRandomValues(new Uint32Array(10)).join('')} value={field}>
              {field}
            </option>
          ))}
        </select>
				</label>
  );
}
