import { useEffect, useState, useMemo } from "react";

export default function SearchBarForm() {
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
        {options[selected]?.map((option: any, idx: any) => (
          <option key={idx} value={option}></option>
        ))}
      </datalist>
    </form>
  );
}
