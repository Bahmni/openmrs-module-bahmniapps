#!/bin/sh -e

set -e

baseDir=$(dirname $0)
codeBaseDir=$baseDir/../../../../registration-ui/
webappDir=$baseDir/../webapp/resources/

rm -rf $webappDir
mkdir -p $webappDir

cd $codeBaseDir
bower install --force-latest
npm install
grunt dist
cp -R $codeBaseDir/dist/ $webappDir

