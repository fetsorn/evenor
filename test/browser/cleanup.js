export async function cleanup() {
  const DBDeleteRequest = window.indexedDB.deleteDatabase("fs");

  await new Promise((resolve, reject) => {
    DBDeleteRequest.onerror = (event) => {
      console.error("Error deleting database.");
      resolve();
    };

    DBDeleteRequest.onsuccess = (event) => {
      //console.log("Database deleted successfully");
      //console.log(event.result); // should be undefined
      resolve();
    };
  });
}
