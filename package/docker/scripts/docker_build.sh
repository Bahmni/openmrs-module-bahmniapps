#!/bin/bash
set -xe

#Working directory : default-config
cp default_config.zip package/resources/

cd package
rm -rf build/
mkdir build/

# Unzipping Resources
unzip -q -u -d build/default_config resources/default_config.zip
unzip -q -u -d build/bahmniapps resources/bahmniapps.zip

#Building Docker images
BAHMNI_WEB_IMAGE_TAG=${BAHMNI_VERSION}-${GITHUB_RUN_NUMBER}
docker build -t bahmni/bahmni-web:${BAHMNI_WEB_IMAGE_TAG} -f docker/Dockerfile  . --no-cache