FROM node:20-alpine
WORKDIR /diseases-map
COPY package.json .
RUN npm install
COPY prisma ./prisma
RUN npx prisma generate
COPY . .
EXPOSE 5002
CMD ["npm","start"]