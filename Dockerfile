FROM node:10-jessie

WORKDIR /usr/src

# Install dependencies
COPY package.json yarn.lock ./
RUN yarn

# Copy the relevant files to the working directory
COPY . .

# Build and export the app
RUN yarn build
RUN cp -R dist /public
