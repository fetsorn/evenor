#!/bin/bash

rm -R pages

git worktree remove ./pages

git worktree add ./pages pages

yarn build

mkdir -p pages

cp -r dist/* ./pages/

git --git-dir ./.git/worktrees/pages --work-tree ./pages add .

git --git-dir ./.git/worktrees/pages --work-tree ./pages commit -m "$(cat package.json | jq '.version')""$(git log --pretty=format:'%h' -n 1)"

git --git-dir ./.git/worktrees/pages --work-tree ./pages push origin pages

git worktree prune
