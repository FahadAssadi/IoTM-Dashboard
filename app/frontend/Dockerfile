# Use a Node.js image to build the Next.js app
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files first (for better caching)
COPY package.json ./

# Install dependencies
RUN npm install

# Copy the rest of the code
COPY . .

# Build the Next.js app
RUN npm run build

# Use a lightweight web server for serving the app
FROM node:18-alpine AS runner

# Set working directory in the container
WORKDIR /app

# Copy the built files from the builder stage
COPY --from=builder /app ./

# Expose the Next.js server port
EXPOSE 3000

# Start the Next.js app
CMD ["npm", "run", "start"]
