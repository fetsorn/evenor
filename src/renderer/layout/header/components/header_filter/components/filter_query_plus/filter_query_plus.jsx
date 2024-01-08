import React from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '@/store/index.js';
import styles from './filter_query_plus.module.css';
import {
  Dropdown,
} from '@/components/index.js';

/**
	* return leaves of base
	* @name foo
	* @function 
	* @param {object} schema - structure data base.
	* @param {string} base - field of schema.
	* @returns {string[]} - list of lieaves of base
	*/
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

/**
 * This tells if a branch is connected to base branch.
 * @name isConnected
 * @function
 * @param {object} schema - Database schema.
 * @param {string} base - Base branch name.
 * @param {string} branch - Branch name.
 * @returns {Boolean}
 */
function isConnectedOld(schema, base, branch) {
  const { trunk } = schema[branch];

  if (trunk === undefined) {
    // if schema root is reached, leaf is connected to base
    return false;
  } if (trunk === base) {
    // if trunk is base, leaf is connected to base
    return true;
  } if (schema[trunk].type === 'object' || schema[trunk].type === 'array') {
    // if trunk is object or array, leaf is not connected to base
    // because objects and arrays have their own leaves
    return false;
  } if (isConnectedOld(schema, base, trunk)) {
    // if trunk is connected to base, leaf is also connected to base
    return true;
  }

  // if trunk is not connected to base, leaf is also not connected to base
  return false;
}

/**
 * This finds all branches that are connected to the base branch.
 * @name findCrown
 * @function
 * @param {object} schema - Database schema.
 * @param {string} base - Base branch name.
 * @returns {string[]} - Array of leaf branches connected to the base branch.
 */
export function findCrown(schema, base) {
  return Object.keys(schema).filter((branch) => isConnectedOld(schema, base, branch));
}

export function FilterQueryPlus({
  
}) {
  const { i18n, t } = useTranslation();

  const [
		base,
		queries,
    schema,
    onQueryAdd,
  ] = useStore((state) => [
		state.base,
		state.queries,
    state.schema,
    state.onQueryAdd,
  ]);
	

	// find all fields name
	const leafFields = foo(schema, base).concat([base])
	console.log(`filter_query_plus: ${leafFields}`);
	// const leafFields = Object.keys(schema)
	// find field name which added to filterqueries
	const addedFields = Object.keys(queries)
	// find name fields which is not added to filterqueries
	const notAddedFields = leafFields.filter(key => !addedFields.includes(key))
	// transform list of fieldnames(array of strings) to list of objects in dropdown
	const menuItems = notAddedFields.map(key => ({
    onClick: () => {
      onQueryAdd(key, "");
    },
    label: key
  }));

  return (
    <div className={styles.search}>
			<Dropdown {...{
        label:"+",
  			title:"title",
				menuItems,
      }}/>
    </div>
  );
}
