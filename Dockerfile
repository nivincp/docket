FROM node:22.13.1

WORKDIR /app

COPY package.json yarn.lock tsconfig.json ./
COPY src ./src

RUN yarn install

EXPOSE 3000

CMD ["yarn", "dev"]