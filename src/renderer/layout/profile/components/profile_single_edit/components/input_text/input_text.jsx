import React, { useState } from "react";
import { API } from "lib/api";
import { useStore } from "@/store/index.js";
import styles from './input_text.module.css';

export function InputText({
  branch,
  value,
  onFieldChange,
}) {

	const [
		repoUUID] 
	  = useStore((state) => [
		state.repoUUID
	  ]);

	const [options, setOptions] = useState([]);

	const api = new API(repoUUID);

	async function onFocus(branch) {
		setOptions([])
	
		  const optionsNew = await api.queryOptions(branch);
	
		  const optionValues = optionsNew.map((entry) => entry[branch]);
	
		  setOptions([...new Set(optionValues)]);

		  const sortedOptions = [...new Set(optionValues)].sort()

		  const queryValue = branch[branch];
		  
		  const updatedOptions = sortedOptions.filter(option => option !== queryValue).concat(queryValue);
  
  setOptions(updatedOptions);
	  }


  return (
    <div>
      <input
        className={styles.input}
        type="text"
        list={branch}
        value={value}
		onFocus={() => onFocus(branch)}

        onChange={(e) => onFieldChange(branch, e.target.value)}
      />

      {options?.length > 0 && (
        <datalist id={branch}>
          {options.map((option, idx) => (
            <option key={idx} value={option} />
          ))}
        </datalist>
      )}
    </div>
  );
}
