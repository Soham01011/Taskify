FROM node:24

WORKDIR /usr/src/app

COPY package*.json ./
COPY index.js ./

RUN npm install --only=production

EXPOSE 3000

CMD ["node", "index.js"]
