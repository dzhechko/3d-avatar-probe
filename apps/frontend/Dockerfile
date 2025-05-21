# Сборка фронтенда
FROM node:18-alpine AS build

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и yarn.lock
COPY package.json yarn.lock ./

# Устанавливаем зависимости и убеждаемся, что vite доступен
RUN yarn install
RUN yarn global add vite

# Копируем исходные файлы
COPY . .

# Собираем приложение
RUN yarn build

# Запуск фронтенда
FROM nginx:alpine

# Копируем результат сборки в директорию nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Открываем порт
EXPOSE 80

# Запуск nginx
CMD ["nginx", "-g", "daemon off;"] 