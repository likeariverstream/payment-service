# Сервис приёма платежей

1. Создать в корне проекта файл .env, заполнить переменные
   Пример:
      ```
      NODE_ENV=development
      SECRET_KEY=OVfKXodmZMFd
      REDIS_PORT=6380
      REDIS_PASSWORD=password
      REDIS_URL=redis://default:password@127.0.0.1:6380
      MONGO_DATABASE=payment
      MONGO_URI=mongodb://user:password@127.0.0.1:27017/payment
      MONGO_USER=user
      MONGO_PASSWORD=password
      MONGO_PORT=27017
      MONGO_INITDB_ROOT_USERNAME=admin
      MONGO_INITDB_ROOT_PASSWORD=password
      ```

2. Развернуть MongoDB и Redis
   ```
   docker compose up -d
   ```

3. Установить зависимости
   ```npm ci```

4. Запуск проекта в режиме разработки 
  ```npm run dev```
   Документация API по умолчанию - http://127.0.0.1:3000/api/docs

5. Форматирование, линтинг
  ```npm run format```
  ```npm run lint:fix```

6. Тесты (требуется Redis)
   ```npm run test```
7. Собрать Swagger
   ```npm run swagger```
