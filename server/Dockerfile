FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache curl

COPY package*.json ./

RUN npm ci --only=production

COPY . .

RUN mkdir -p public/uploads

EXPOSE 5002

ENV NODE_ENV=production
ENV PORT=5002

CMD ["npm", "start"]
