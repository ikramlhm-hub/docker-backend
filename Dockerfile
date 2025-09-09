# Image de base Node.js officielle (bullseye pour compatibilité Playwright)
FROM node:22-bullseye

# Définir le répertoire de travail
WORKDIR /app

# Copier package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Installer les navigateurs nécessaires pour Playwright
RUN npx playwright install --with-deps

# Copier tout le code source
COPY . .

# Exposer le port
EXPOSE 3000

# Commande de démarrage
CMD ["node", "src/index.js"]
# Nettoyer le cache npm pour réduire la taille de l'image
RUN npm cache clean --force