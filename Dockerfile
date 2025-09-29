# 1. Choisir une image Node.js officielle
FROM node:20

# 2. Définir le répertoire de travail
WORKDIR /app

# 3. Copier le package.json et package-lock.json pour installer les dépendances
COPY package*.json ./

# 4. Installer les dépendances
RUN npm install

# 5. Installer Playwright avec les navigateurs nécessaires
RUN npx playwright install --with-deps

# 6. Copier le reste du code de l'application
COPY . .

# 7. Générer le client Prisma (si tu utilises Prisma)
RUN npx prisma generate

# 8. Exposer le port de l'application (optionnel selon ton app)
EXPOSE 3000

# 9. Définir la commande de démarrage
CMD ["npm", "run", "dev"]
