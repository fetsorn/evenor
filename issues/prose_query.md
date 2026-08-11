# 

if I search for "Name" when a dataset has 
```
{ _: event, event: nick, @ru: "Name" }
``` 
it doesn't find anything
if the dataset has
```
{ _: event, event: nick, @: "Name" }
``` 
it finds it. 

`src/query.js` searches for `{ _: event, @: "Name" }` so the issue might be that csvs doesn't find lang tag by general commat
