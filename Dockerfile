# Utilise Node.js LTS
FROM node:18

# Cr  e et utilise le r  pertoire de travail
WORKDIR /app

# Copie les fichiers
COPY . .

# Installe les d  pendances
RUN npm install

# Port utilis   par l'app
EXPOSE 3000

# Commande de d  marrage
CMD ["npm", "start"]
