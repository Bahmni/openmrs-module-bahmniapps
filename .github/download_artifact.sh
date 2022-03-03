#!/bin/bash
set -e

#Parameters (repository_name,artifact_name,github_pat)

if [ $# -ne 3 ]
then
echo "Invalid Arguments. Need repository_name, artifact_name, github_pat"
exit 2
fi

curl -s https://api.github.com/repos/Bahmni/$1/actions/artifacts | \
    jq '[.artifacts[] | select (.name == '\"$2\"')]' | jq -r '.[0] | .archive_download_url' | \
    xargs curl -L -o $2.zip -H "Authorization: token $3"
unzip -d package/resources/ $2.zip && rm $2.zip