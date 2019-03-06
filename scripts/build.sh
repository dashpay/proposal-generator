#! /bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
SRC_ROOT=$(dirname $DIR)

echo "[$SRC_ROOT]"

(cd $SRC_ROOT && \
  rm -fr ./dist/ && \
  docker build -t proposal-generator-build . && \
  docker create --name prop-build proposal-generator-build && \
  docker cp prop-build:/app ./dist/ && \
  docker rm prop-build && \
  (cd dist/ && rm -fr package.json package-lock.json node_modules) && \
  echo "Ok. Site built in ${SRC_ROOT}/dist"
)
