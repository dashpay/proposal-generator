FROM node:6-alpine

# update package index and install git
RUN apk add --update --no-cache git

WORKDIR /app

COPY . /app/

RUN npm install --quiet
RUN npm run build

CMD /bin/ash
