#!/bin/bash

BASE_DIR=`dirname $0`
ROOT_DIR=$BASE_DIR/..
ZIP_FILE_NAME=bahmniapps.zip

mkdir -p $ROOT_DIR/target
rm -rf $ROOT_DIR/target/$ZIP_FILE_NAME

rvm use 1.9.3
grunt dist
cd $ROOT_DIR/dist && zip -r ../target/$ZIP_FILE_NAME *
