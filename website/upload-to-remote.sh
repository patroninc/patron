#!/bin/bash

echo "Starting upload to remote server..."

set -e

echo "Building the project..."

yarn build

echo "Uploading files to remote server..."

rsync -av --delete ./dist/ crm-cli:/home/git_projects/patrondotcom/dist/

echo "Upload completed successfully."