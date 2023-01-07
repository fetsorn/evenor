import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { queryOptions } from "..";
import styles from "./search_bar_form.module.css";

interface ISearchBarFormProps {
  selected: any;
  searched: any;
  setSearched: any;
}

export async function onUseEffect(dir: string, selected: any, setOptions: any) {
  /* const options = await queryOptions(dir, selected); */
  /* setOptions(options); */
}

export default function SearchBarForm({
  selected,
  searched,
  setSearched,
}: ISearchBarFormProps) {
  const { repoRoute } = useParams();

  const [options, setOptions]: any[] = useState([]);

  useEffect(() => {
    onUseEffect(repoRoute, selected, setOptions);
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
