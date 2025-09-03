# Use Node.js 22 (matches the version in environment)
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy ts-sdk dependency first
COPY ts-sdk/ ../ts-sdk/

# Build ts-sdk first
WORKDIR /ts-sdk
RUN yarn install --frozen-lockfile && yarn build

# Go back to app directory and copy package files
WORKDIR /app
COPY react-server/package.json react-server/yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY react-server/ .

# Build the application
RUN yarn build

# Expose the port
EXPOSE 5173

# Set production environment
ENV NODE_ENV=production

# Start the server
CMD ["node", "server.js"]