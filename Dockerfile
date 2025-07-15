# Image Nginx légère
FROM nginx:alpine

# Supprime le contenu par défaut de Nginx
RUN rm -rf /usr/share/nginx/html/*

# Copie ton site dans le dossier web de Nginx
COPY docs/ /usr/share/nginx/html/

# Expose le port 80 (facultatif, par défaut nginx expose 80)
EXPOSE 80
