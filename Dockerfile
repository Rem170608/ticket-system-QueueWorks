# Use the official Node.js image as the base image
FROM node:latest

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy the rest of your application files to the container
COPY . .

# Expose the port that your app runs on
EXPOSE 3000

# Command to run your application
CMD ["node", "Backend/main.js"]
