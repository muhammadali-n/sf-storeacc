# Use an official Node.js image as the base image
FROM node:18

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the project files to the working directory
COPY . .

# Build the React app
# RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Run the React app
CMD ["npm", "run" ,"dev"]
# CMD ["npm", "start"]