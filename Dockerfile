## DEV
FROM node:18 AS dev

WORKDIR /app
COPY package* .
RUN npm ci

CMD ["npm", "run", "dev"]

## BUILDER
FROM dev AS builder
WORKDIR /app
ENV NODE_ENV=production
COPY . .
RUN npm run build
#RUN npm prune --production

## PRODUCTION
FROM node:18 AS prod

WORKDIR /app
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

CMD [ "npm", "run", "start" ]
