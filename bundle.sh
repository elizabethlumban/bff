#!/bin/sh
set -e

# Clear if it exists
rm -rf bundle

# Copy all the necessary files for production build
mkdir bundle

cp -R node_modules ./bundle/node_modules 

cp -R dist ./bundle/dist
cp  *.yaml *.yml *.json yarn.lock ./bundle | true