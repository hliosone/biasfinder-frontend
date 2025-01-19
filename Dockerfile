# Use an official Node.js image
FROM node:18

# Create a directory inside the container
WORKDIR /app

# Copy only package files first (for caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Now copy the rest of the app’s source code
COPY . .

# Expose the port that Vite dev server listens on
EXPOSE 5173

# Run "npm run dev" with --host so it’s accessible outside the container
CMD ["npm", "run", "dev", "--", "--host=0.0.0.0"]
