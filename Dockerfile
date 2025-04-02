# Use official Node image
FROM node:20

# Install Poppler and dependencies for Sharp
RUN apt-get update && \
    apt-get install -y poppler-utils libvips libvips-dev && \
    rm -rf /var/lib/apt/lists/*

# Create working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy project files
COPY . .

# Expose port your app runs on
EXPOSE 5000

# Run the app
CMD ["npm", "start"]
