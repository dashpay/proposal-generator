#! /bin/bash

set -ex

if [ "x${S3_BUCKET}" = "x" ]; then
  echo "error: S3_BUCKET must be set"
  exit 1
fi
S3_PREFIX="${S3_PREFIX%/}"  # ensure any trailing slash removed

DEPLOY_ENV="$1"
if [ "$DEPLOY_ENV" = "production" ]; then
  aws s3 sync --delete --size-only --acl private \
    dist/ "s3://${S3_BUCKET}/${S3_PREFIX}/" \
    --exclude 'dist/.DS_Store'
fi
