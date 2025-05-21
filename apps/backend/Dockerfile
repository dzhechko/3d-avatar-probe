FROM node:18-slim

# Устанавливаем ffmpeg
RUN apt-get update && apt-get install -y ffmpeg && apt-get clean

# Рабочая директория
WORKDIR /usr/src/app

# Копируем зависимости
COPY package.json yarn.lock ./
RUN yarn install --production

# Копируем код и файлы проекта 
COPY . .

# Создаем необходимые директории
RUN mkdir -p audios

# Создаем заглушку для Rhubarb вместо копирования
RUN echo '#!/bin/bash' > /usr/local/bin/rhubarb
RUN echo 'echo "Rhubarb placeholder"' >> /usr/local/bin/rhubarb
RUN chmod +x /usr/local/bin/rhubarb

# Открываем порты
EXPOSE 3000

# Запускаем приложение
CMD ["node", "server.js"] 