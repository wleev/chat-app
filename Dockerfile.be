FROM node:18

# Add the current working folder as a mapped folder at /usr/src/app
ADD ./back-end /usr/src/be

# Set the current working directory to the new mapped folder.
WORKDIR /usr/src/be

# Install the express generator which gives you also scaffolding tools.
RUN npm install

# Expose the node.js port to the Docker host.
EXPOSE 3000

# This is the start the app.
CMD [ "npm", "start" ]