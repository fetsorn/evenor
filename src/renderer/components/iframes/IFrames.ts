
    function inUseEffect() {
        if (typeof eventOriginal !== "undefined") {
            setEvent(eventOriginal);
        }

        // reset sidebar contents on event switch
        setIFrameFetchPath(undefined);
        setIFrameConvertPath(undefined);
    }

    function inUseEffect2() {

        if (event?.FILE_PATH && isIFrameable(event.FILE_PATH)) {
            setIFrameFetch(event.FILE_PATH);
        }
    }



    // set iframe blob
    const setIFrameFetch = async (filepath: string) => {
        // fetch FILE_PATH as Blob
        let blob: Blob;
        try {
            const lfsPath = "lfs/" + filepath;
            blob = await fetchAsset(lfsPath);
        } catch (e1) {
            /* console.log("fetch lfs/ failed", e1); */
            try {
                const localPath = "local/" + filepath;
                blob = await fetchAsset(localPath);
            } catch (e2) {
                /* console.log("fetch local/ failed", e2); */
            }
        }
        if (blob) {
            // try LFS
            try {
                const content = await blob.text();
                const remote = await getRemote(window.dir);
                const token = "";
                const blobPath = await resolveLFS(filepath, content, remote, token);
                setIFrameFetchPath(blobPath);
            } catch (e) {
                /* console.log("lfs failed, setting file", e); */
                const url = URL.createObjectURL(blob);
                setIFrameFetchPath(url);
            }
        }
    };

    const onConvert = async () => {
        const localPath = "local/" + event.FILE_PATH;
        const blob = await fetchAsset(localPath);
        const abuf = await blob.arrayBuffer();
        // try to convert to html
        try {
            const html = await toHtml(localPath, abuf);
            const content = new Blob([html]);
            const blobURL = URL.createObjectURL(content);
            setIFrameConvertPath(blobURL);
        } catch (e1) {
            console.log("handleDoc failed", e1);
            // try to fetch plain text
            try {
                // expose buffer to decode alternate encodings in console, e.g.
                /* new TextDecoder("windows-1251").decode(window.buf); */
                window.buf = abuf;
                const text = new TextDecoder("utf-8").decode(abuf);
                const content = new Blob([text]);
                const blobURL = URL.createObjectURL(content);
                setIFrameConvertPath(blobURL);
            } catch (e2) {
                /* console.log("handlePlain failed", e2); */
            }
        }
    };
