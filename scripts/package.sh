#!/bin/bash

BASE_DIR=`dirname $0`
ROOT_DIR=$BASE_DIR/..

mkdir -p $ROOT_DIR/target
rm -rf $ROOT_DIR/target/registration.zip

rvm use 1.9.3
grunt dist
cd $ROOT_DIR/dist && zip -r ../target/registration.zip *
