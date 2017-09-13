#!/bin/bash

set -eo pipefail
echo "--- Set Node Version"
. "$NVM_DIR/nvm.sh"
nvm use 6.10 | tee -a bk-pipeline.log
cd ui/
echo "--- Install Dependencies" | tee -a bk-pipeline.log
npm install | tee -a bk-pipeline.log
echo "--- Set up UI component/dependencies" | tee -a bk-pipeline.log
bower install | tee -a bk-pipeline.log
echo "--- Build" | tee -a bk-pipeline.log
grunt | tee -a bk-pipeline.log
