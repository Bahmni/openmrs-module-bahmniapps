#!/bin/bash

export LANG=en_US.UTF-8
set -e

BASE_DIR=`dirname $0`
ROOT_DIR=$BASE_DIR/..
ZIP_FILE_NAME=bahmniapps

mkdir -p $ROOT_DIR/target
rm -rf $ROOT_DIR/target/${ZIP_FILE_NAME}*.zip

npm install
bower install

pids=$(pgrep Xvfb)
if [ -n "$pids" ]; then
    export DISPLAY=:99
    Xvfb :99 &
else
    echo "Xvfb running"
fi

grunt
cd $ROOT_DIR/dist && zip -r ../target/${ZIP_FILE_NAME}.zip *

cd ..
grunt chrome
cd $ROOT_DIR/dist && zip -r ../target/${ZIP_FILE_NAME}_chrome.zip *

cd ..
grunt android
cd $ROOT_DIR/dist && zip -r ../target/${ZIP_FILE_NAME}_android.zip *
