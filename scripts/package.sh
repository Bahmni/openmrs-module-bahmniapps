#!/bin/bash

BASE_DIR=`dirname $0`
ROOT_DIR=$BASE_DIR/..

mkdir -p $ROOT_DIR/target
rm -rf $ROOT_DIR/target/registration.zip
cd $ROOT_DIR/app && zip -r ../target/registration.zip *
