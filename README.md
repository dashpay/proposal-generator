# ANON Proposal Generator

## Get Started

Before being able to use this repository, you will need to build the bitcore-lib-anon for browser which is a required dependency. This can be done easily by running:

```
npm install
npm run build
```

You will find in the vendor folder the file index.js which index.html reference. This file handle a browserified version of bitcore-lib-anon aswell as some inner logic that you can find in "js/index.js".

## Dockerized

A Dockerfile has been included in order to build the site deterministically, as well as a script to run the Docker site build, and place the resulting artifacts in the `dist/` directory. To run the full Dockerized build, run this script:

```
bash scripts/build.sh
```

Credit: https://github.com/dashevo 