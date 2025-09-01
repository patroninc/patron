# Use Node.js 22 (matches the version in environment)
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN yarn build

# Expose the port
EXPOSE 5173

# Set production environment
ENV NODE_ENV=production

# Start the server
CMD ["node", "server.js"]