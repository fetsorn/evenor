# Document Title

works on desktop

doesn't work on ios and android

on android blocking_safe_file returns a FilePath::URI with a content:// link like this
```
Url(
    Url { 
        scheme: "content",
        cannot_be_a_base: false,
        username: "",
        password: None, 
        host: Some( 
            Domain(
                "com.android.providers.downloads.documents",
            ),    
        ),    
        port: None, 
        path: "/document/41",
        query: None, 
        fragment: None, 
    },    
),
```

How to resolve this URI to a file path that zip could use?
author of this tauri implementation speaks of passing this URI to `activity.getContentResolver().openOutputStream(uri)` which apparently happens in Kotlin under the hood of plugin-fs. but how do I get that filedescriptor in rust if plugin-fs official asks not to use it and instead use std::fs?
https://github.com/tauri-apps/plugins-workspace/pull/1658

probably import plugin_fs in rust and take the Fs struct from there. but the plugin itself instead uses fs:File with some resolved path. how do I resolve uri to fs::path?

https://github.com/tauri-apps/plugins-workspace/blob/1a03e9761f2b62c9e33ef34f3f88606f85df4e44/plugins/fs/src/commands.rs#L1090

```
use tauri_plugin_fs::{FsExt, OpenOptions};
use tauri_plugin_dialog::DialogExt;
let uri = app.dialog().file().blocking_save_file();
let mut opts = OpenOptions::new();
opts.write(true);
let mut f = app.fs().open(uri, opts);
f.write_all(buf);
```

all functions return Ok but the file is empty on ios. likely because ios does not allow access from evenor to Caches.

tauri_plugin_fs copes by creating files in appDir, and so does tauri_plugin_fs_ios. but the expected feature is to write files that ios picker offers - files in external storage of other apps and in Caches.
