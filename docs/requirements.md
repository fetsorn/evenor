# Product

GUI client for csvs, personal information manager, note-taking manager, digital brain, database manager

competes: notion, OneNote, obsidian, org-journal, iNotes, atom https://www.accesstomemory.org, perkeep https://perkeep.org, trilium

interacts: with local storage, git hosting providers, social media API

constitutes: local and public a web application, mobile application for iOS and Android, desktop application for Linux, MacOS and Windows

includes: UI, UI state storage, overview components, import/export controllers; a class that interacts with filesystem, csvs, git

patterns: MVC 

resembles: matrix.ai, genea.app, pgAdmin

stakeholders: fetsorn
 
target audiences: superusers, genealogy clients
    
## adr
- user must store i18n description of schema entities

- user must specify arbitrary entity purpose to render values in a specific way

- all values are stored in a csvs dataset. all keys are SHA-256 hashsum of some unique value, so that keys are of common form. we hash a UUIDv4 in `src/api/schema.js::newUUID` when a new object needs a unique identifier,  and we hash file contents in `src/api/browser.js::uploadFile`, `src/api/electron.js::uploadFile` and `src/api/server.mjs::uploadFile` for content-addressable asset storage.

- support oAuth
# Requirements

## 长 寒 项
- user must view a collection of folders
## 遵 钙 球
- user must create a folder
## 安 极 种
- user must delete a folder
## 堵 朵 虾
- user must edit the folder name
## 给 胎 政
- user must edit the folder schema
## 务 碎 筛
- user must view a collection of records in a folder
## 伸 薄 渗
- user must create a record
## 晋 译 哩
- user must change a record
## 忧 伏 治
- user must delete a record
## 季 家 苍
- user must search a collection
## 斤 孙 资
- user must query a collection with fuzzy match
## 优 殊 火
- user must query a collection with logical AND
## 念 邻 真
- user must query a collection with logical OR
## 秘 抛 张
- user must query a collection with regular expressions
## 力 辊 捅
- user must sort a collection
## 府 凤 制
- user must sort in ascending order
## 疑 课 剥
- user must sort in descending order
## 月 盛 叔
- user won't sort numbers in arithmetic order
## 厂 便 玻
- user must sort numbers in alphanumeric order
## 污 纯 千
- user must see tooltips on every button
## 淮 适 议
- user must see a warning when deleting
## 他 塘 众
- user must import a folder over the network
## 膜 里 刻
- user must export a folder over the network
## 滨 先 汁
- user must upload attached media files 
## 喝 弹 扑
- user must view attached media files 
## 附 线 纶
- user must download attached media files 
## 你 所 法
- user must rename attached media files
## 酚 百 暗
- user must choose from a list of previously attached media files
## 十 抵 严
- user must see the first of search results immediately after querying
## 肌 捉 乙
- user must open URL with local folder and query
## 并 试 辑
- user must open URL with remote folder
## 加 份 吧
- user must open URL with record id to scroll into view
## 棋 届 瓜
- user must see highlight of the opened record
## 舟 连 右
- user must move subset of records specified by query from one folder to another
## 制 猛 密
- user must close folder and see saved query
## 湿 楼 到
- user must close folder and scroll to folder record
## 开 砍 滩
- user must see number of records matched by query
## 坑 州 胀
- user must change css themes
## 我 拒 葱
- user must view rich formatted markdown text
## 司 并 哲
- desktop user must search page with ctrl+f
## 训 滑 掘
- desktop user must open folder locally
## 寨 溜 磷
- desktop user must open multiple windows
## 技 仰 夜
- browser user must see a warning that clearing cache will destroy data 
## 础 炮 敲
- user must download zip archive of the folder
## 免 织 婚
- user must access all events that involve a name as an actor
## 妥 尚 累
- user must see the interface in their preferred language
## 溜 赫 皱
- user must see all names that have common events with a given name
## 部 替 易
- user must specify a branch to query by given branch
 
