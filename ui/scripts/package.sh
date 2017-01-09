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
grunt bundle
grunt uglify-and-rename

cd $ROOT_DIR

rm -rf cacheChromeDist cacheAndroidDist
cp -r dist cacheChromeDist
cp -r dist cacheAndroidDist

if [ $(pgrep Xvfb) ]; then
    XVFB_PID=$(pgrep Xvfb)
    echo "Killing Xvfb process $XVFB_PID"
    kill $XVFB_PID
fi
export DISPLAY=:99
Xvfb :99 &
XVFB_PID=$!
echo "Starting Xvfb process $XVFB_PID"

grunt web
cd dist && zip -r ../target/${ZIP_FILE_NAME}.zip *

cd ..
rm -rf dist
cp -r cacheChromeDist dist
grunt chrome
cd dist && zip -r ../target/${ZIP_FILE_NAME}_chrome.zip *

cd ..
rm -rf dist
cp -r cacheAndroidDist dist
grunt android
cd dist && zip -r ../target/${ZIP_FILE_NAME}_android.zip *

echo "Killing Xvfb process $XVFB_PID"
/usr/bin/sudo kill $XVFB_PID
