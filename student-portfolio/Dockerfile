FROM node:18-alpine AS build

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code and build production assets
COPY . .
RUN npm run build

# Expose Vite preview port
EXPOSE 5173

# Serve built frontend on all network interfaces
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "5173"]

