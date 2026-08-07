# ---------- Build stage ----------
FROM node:18-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

COPY . .

# Baked in at build time; nginx proxies these paths to the backend container,
# so relative paths work regardless of the host the app is served from.
ARG REACT_APP_API_URL=/api/v1
ARG REACT_APP_WS_URL=/ws
ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV REACT_APP_WS_URL=$REACT_APP_WS_URL

RUN npm run build

# ---------- Run stage ----------
FROM nginx:1.27-alpine

COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
