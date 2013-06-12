#!/bin/bash

BASE_DIR=`dirname $0`
ROOT_DIR=$BASE_DIR/..

mkdir -p $ROOT_DIR/target
rm -rf $ROOT_DIR/target/opd.zip
cd $ROOT_DIR/app && zip -r ../target/opd.zip *
