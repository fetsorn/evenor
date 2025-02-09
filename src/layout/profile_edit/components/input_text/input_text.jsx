import React, { useState } from "react";
import { API } from "@/api/index.js";
import { useStore } from "@/store/index.js";
import styles from "./input_text.module.css";

export function InputText({ branch, value, onFieldChange }) {
  const [repo, queries] = useStore((state) => [state.repo, state.queries]);

  const { repo: repoUUID } = repo;

  const [options, setOptions] = useState([]);

  const api = new API(repoUUID);

  async function onFocus(branch) {
    setOptions([]);

    const optionsNew = await api.select({ _: branch });

    const optionValues = optionsNew.map((record) => record[branch]);

    setOptions([...new Set(optionValues)]);

    const sortedOptions = [...new Set(optionValues)].sort();

    const queryValue = queries[branch];

    const updatedOptions = [queryValue].concat(
      sortedOptions.filter((option) => option !== queryValue),
    );

    setOptions(updatedOptions);
  }

  return (
    <span>
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
    </span>
  );
}
