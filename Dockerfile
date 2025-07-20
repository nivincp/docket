FROM node:22.13.1

WORKDIR /app

# Copy package files first for caching
COPY package.json yarn.lock tsconfig.json ./

RUN yarn install

# Then copy source files
COPY src ./src

EXPOSE 3000

COPY entrypoint.sh /app/entrypoint.sh
ENTRYPOINT ["/app/entrypoint.sh"]