#! /bin/bash

set -ex

DEPLOY_ENV="$1"
# echo $TRAVIS_BUILD_DIR

cat -e /tmp/deploy_ed25519
env

# TODO: staging environment
if [ "$DEPLOY_ENV" = "production" ]; then
  rsync -vzrlptD \
    --exclude deploy_ed25519.enc \
    --exclude .git \
    --exclude .gitignore \
    --exclude .travis.yml \
    --exclude node_modules \
    --exclude README.md \
    --exclude package.json \
    --exclude scripts \
    --delete-after \
    . deploy@proposal.dash.org:/var/www/govobject-proposal/
fi
