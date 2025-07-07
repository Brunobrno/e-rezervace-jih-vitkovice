# Use an official Node.js runtime as a parent image
FROM node

# Set the working directory in the container
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./

RUN npm config set strict-ssl false
RUN npm install --progress=false --cache
RUN npm install vite --save-de
RUN npm install -g npm@11.4.2

# Copy the rest of the application code into the container
COPY . /app/

# Expose the port React will run on
EXPOSE 3000

# Run the React development server
CMD ["npm", "start"]
