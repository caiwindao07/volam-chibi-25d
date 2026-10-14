FROM node:20-alpine

WORKDIR /app

# Cài đặt dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Sao chép toàn bộ mã nguồn game
COPY . .

# Port mặc định (Hugging Face dùng 7860, Render/Koyeb tự inject process.env.PORT)
ENV PORT=7860
EXPOSE 7860

CMD ["node", "server.js"]
