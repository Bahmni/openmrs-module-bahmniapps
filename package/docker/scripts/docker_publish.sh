#!/bin/bash
set -e

echo ${DOCKER_HUB_TOKEN} | docker login -u ${DOCKER_HUB_USERNAME} --password-stdin
docker push --all-tags $1

docker logout
