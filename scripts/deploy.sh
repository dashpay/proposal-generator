#! /bin/bash

set -ex

DEPLOY_ENV="$1"
# echo $TRAVIS_BUILD_DIR

# TODO: staging environment
if [ "$DEPLOY_ENV" = "production" ]; then
  rsync -vzrlptD \
    --exclude deploy_ed25519.enc \
    --exclude .git \
    --exclude .gitignore \
    --exclude .travis.yml \
    --delete-after \
    . deploy@proposal.dash.org:/var/www/govobject-proposal/
fi
