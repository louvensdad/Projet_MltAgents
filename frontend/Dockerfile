FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY . .

EXPOSE 4321

ENV NODE_ENV=production
ENV NEXT_PUBLIC_API_URL=http://api:8001
ENV PORT=4321

RUN npm run build

CMD ["npm", "start", "--", "--port", "4321"]
