# Base image for Node.js
FROM node:22 AS backend

# Set working directory for the backend
WORKDIR /app/backend

# Copy package.json and install dependencies
COPY backend/package*.json ./
RUN npm install

# Copy backend files
COPY backend/ .

# Expose the backend port (change if needed)
EXPOSE 8192

# Start the backend
CMD ["npm", "start"]
