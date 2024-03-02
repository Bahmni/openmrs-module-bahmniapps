#!/bin/bash

function command_exists() {
    command -v "$1" >/dev/null 2>&1
}

if ! command_exists tx; then
    echo "Transifex CLI is not installed. Installing..."
    curl -o- https://raw.githubusercontent.com/transifex/cli/master/install.sh | bash
    mv tx /usr/local/bin/tx
fi

if [ ! -f .tx/config ]; then
    echo "Transifex config file (.tx/config) not found in the repository."
    exit 1
fi

if [ "$1" == "push" ]; then
    echo "Pushing translation source file to Transifex..."
    tx push -s
elif [ "$1" == "pull" ]; then
    echo "Pulling translations from Transifex..."
    tx pull -t -s --mode reviewed --use-git-timestamps
else
    echo "Invalid operation. Please specify either 'push' or 'pull'."
    exit 1
fi

if [ $? -ne 0 ]; then
    echo "Error: Transifex operation failed. Please check the error message above."
    exit 1
else
    echo "Transifex operation completed successfully."
fi
