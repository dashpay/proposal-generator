FROM node:16-alpine

# update package index and install git
RUN apk add --update --no-cache git

WORKDIR /app

COPY package.json package-lock.json /app/

RUN npm ci

COPY . /app/

RUN npm run linebreak-check
RUN npm run build

CMD /bin/ash
