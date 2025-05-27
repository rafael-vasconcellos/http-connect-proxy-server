FROM node:20-alpine

WORKDIR /app
COPY ./ ./

ARG PORT=8080
ENV PORT=$PORT
RUN echo "PORT is $PORT"

#RUN rm -rf ./test
RUN npm install
RUN npm run build

CMD ["npm", "run", "start"]
