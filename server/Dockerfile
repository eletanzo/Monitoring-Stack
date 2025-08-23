FROM node:18

WORKDIR /app

# Copy only package.json first (better caching)
COPY package*.json ./
RUN npm install

# Now copy the rest of the source code
COPY . .

EXPOSE 3000
CMD ["node", "server.js"]
