FROM node:alpine
WORKDIR /usr/src/app

RUN adduser --system --uid 1001 nextjs
RUN addgroup --system --gid 1001 nodejs

COPY --chown=nextjs:nodejs . /usr/src/app

ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

RUN npm install
RUN npm run build

USER nextjs
EXPOSE 3000
ENV PORT 3000
ENTRYPOINT ["npm", "run-script", "start"]