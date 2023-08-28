#!/bin/bash
set -euo pipefail

deploy_repo=~/repos/deploy/coderstats.github.io

npm run build

logya gen
cp -r public/* "$deploy_repo"
cd "$deploy_repo"
git add .
git commit -am'new deployment'
git push