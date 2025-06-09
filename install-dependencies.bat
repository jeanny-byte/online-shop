@echo off

echo Installing frontend dependencies...
cd src
npm install axios

echo Installing backend dependencies...
cd ../backend
npm init -y
npm install express cors mysql2 bcryptjs jsonwebtoken dotenv
npm install --save-dev @types/express @types/cors @types/node

echo Installation complete!
pause
