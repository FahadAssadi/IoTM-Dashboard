# Use an official Node.js image as base
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first (for efficient caching)
COPY package.json ./

# Install dependencies
RUN npm install

# Copy the entire backend source code
COPY . .

# Expose the application port (make sure it matches `main.ts`)
EXPOSE 4000

# Start the NestJS application
CMD ["npm", "run", "start"]
