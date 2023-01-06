import React, { useState, useEffect } from "react";
import { onUseEffect } from "./tbn";
import styles from "./search_bar_form.module.css";

interface ISearchBarFormProps {
  selected: any;
  searched: any;
  setSearched: any;
}

export default function SearchBarForm({
  selected,
  searched,
  setSearched,
}: ISearchBarFormProps) {
  const [options, setOptions]: any[] = useState([]);

  useEffect(() => {
    onUseEffect(selected, setOptions);
  }, [selected]);

  return (
    <form className={styles.form}>
      <input
        className={styles.input}
        type="text"
        list={`panel_list`}
        value={searched}
        onChange={({ target: { value } }) => {
          setSearched(value);
        }}
      />

      <datalist id={`panel_list`}>
        {options.map((option: any, idx: any) => (
          <option key={idx} value={option}></option>
        ))}
      </datalist>
    </form>
  );
}
