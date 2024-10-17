
FROM node:20-alpine

# choose directory
WORKDIR /app

# install pnpm
RUN npm install -g pnpm 

# copy the package.json and pnpm-lock.yaml file
COPY package.json pnpm-lock.yaml ./

# install all the dependencies
RUN pnpm install

# copy the rest of the codes
COPY . .

# expose the port number
EXPOSE 3000

# start the NextJs app in production
CMD [ "pnpm", "dev" ]