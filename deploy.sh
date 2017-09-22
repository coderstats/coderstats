#!/bin/bash
set -euo pipefail

deploy_repo=~/repos/deploy/coderstats.net

logya gen
cp -r deploy/* "$deploy_repo"
cd "$deploy_repo"
git add .
git commit -am'new deployment'
git push