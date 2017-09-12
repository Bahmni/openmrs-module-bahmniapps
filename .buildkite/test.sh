#!/bin/bash

set -eo pipefail
echo "--- Set Node Version"
. "$NVM_DIR/nvm.sh"
nvm use 6.10 | tee bk-pipeline.log
cd ui/
echo "--- Install Dependencies" | tee -a bk-pipeline.log
npm install | tee -a bk-pipeline.log
echo "--- Test" | tee -a bk-pipeline.log
sed -i -e 's/"test": "karma start/"e2e": "xvfb-run -a karma start/' package.json | tee -a bk-pipeline.log
grunt test | tee -a bk-pipeline.log