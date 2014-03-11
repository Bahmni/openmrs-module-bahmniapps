#!/bin/bash

BASE_DIR=`dirname $0`

echo ""
echo "Starting karma Server"
echo "-------------------------------------------------------------------"

karma start $BASE_DIR/../test/config/testacular.conf.js $*