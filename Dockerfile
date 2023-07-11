FROM node:16.16.0

WORKDIR /app

COPY package.json .
COPY yarn.lock .

RUN yarn

COPY . . 

EXPOSE 3333

CMD ["yarn", "dev"]