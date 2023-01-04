import React from "react";

export default function FormRepoCreate() {
  const [url, setURL] = useState(undefined);

  const [token, setToken] = useState(undefined);

  return (
    <div className={styles.container}>
      <form>
        <InputURL url={url} setURL={setURL} />

        <InputToken token={token} setToken={setToken} />
      </form>

      <ButtonRepoCreate onChange={repoCreate} />
    </div>
  );
}
