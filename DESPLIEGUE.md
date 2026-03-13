# Guía de Despliegue - Forotaguas

Esta guía contiene los pasos para actualizar el backend y frontend en la VPS.

## Estructura del Proyecto

```
Forotaguas/
├── forum/          # Backend (Spring Boot - Java)
└── frontend/       # Frontend (React + Vite)
```

---

## 🔧 Configuración Inicial (Solo una vez)

### 1. Conectar a la VPS

```bash
ssh usuario@tu-servidor-ip
```

### 2. Instalar dependencias en la VPS

```bash
# Instalar Java 17+
sudo apt update
sudo apt install openjdk-17-jdk -y

# Instalar Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs -y

# Instalar PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Instalar Maven
sudo apt install maven -y

# Instalar PM2 (para mantener el backend corriendo)
sudo npm install -g pm2
```

### 3. Configurar PostgreSQL

```bash
sudo -u postgres psql

# En la consola de PostgreSQL:
CREATE DATABASE forum;
CREATE USER postgres WITH PASSWORD 'postgres';
GRANT ALL PRIVILEGES ON DATABASE forum TO postgres;
\q
```

---

## 🚀 Despliegue del Backend

### Paso 1: Compilar el backend

En tu máquina local:

```bash
cd Forotaguas/forum
./mvnw clean package -DskipTests
```

Esto genera un archivo `target/forum-0.0.1-SNAPSHOT.jar`

### Paso 2: Subir el archivo a la VPS

```bash
# Opción A: Con scp
scp target/forum-0.0.1-SNAPSHOT.jar usuario@tu-servidor:/home/usuario/forum/

# Opción B: Con git
git add .
git commit -m "Actualización del backend"
git push origin main
# Luego en la VPS: git pull
```

### Paso 3: Ejecutar el backend en la VPS

```bash
# Opción A: Ejecución directa
cd /home/usuario/forum
java -jar forum-0.0.1-SNAPSHOT.jar

# Opción B: Con PM2 (recomendado - se reinicia solo si cae)
pm2 start forum-0.0.1-SNAPSHOT.jar --name forotaguas-backend -- /usr/bin/java

# Ver logs
pm2 logs forotaguas-backend

# Reiniciar después de actualización
pm2 restart forotaguas-backend
```

### Paso 4: Verificar que funciona

```bash
curl http://localhost:8081/api/categories
```

---

## 🎨 Despliegue del Frontend

### Paso 1: Compilar el frontend

En tu máquina local:

```bash
cd Forotaguas/frontend
npm install
npm run build
```

Esto genera una carpeta `dist/` con los archivos estáticos.

### Paso 2: Subir archivos a la VPS

```bash
# Opción A: Con scp (recursivo)
scp -r dist/* usuario@tu-servidor:/var/www/forotaguas/

# Opción B: Con git y construir en la VPS
git add .
git commit -m "Actualización del frontend"
git push origin main
```

### Paso 3: Configurar Nginx (primera vez)

```bash
sudo apt install nginx -y

sudo nano /etc/nginx/sites-available/forotaguas
```

Contenido del archivo:

```nginx
server {
    listen 80;
    server_name tu-dominio.com www.tu-dominio.com;

    root /var/www/forotaguas;
    index index.html;

    # Frontend estático
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API del backend
    location /api/ {
        proxy_pass http://localhost:8081/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

```bash
# Activar el sitio
sudo ln -s /etc/nginx/sites-available/forotaguas /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Paso 4: Actualizar sin downtime

```bash
# En la VPS
cd /var/www/forotaguas
rm -rf *
# Subir nuevos archivos
sudo systemctl reload nginx
```

---

## 📋 Comandos Útiles

### Backend
```bash
# Iniciar
pm2 start forotaguas-backend

# Detener
pm2 stop forotaguas-backend

# Reiniciar
pm2 restart forotaguas-backend

# Ver logs en tiempo real
pm2 logs forotaguas-backend

# Ver estado
pm2 status
```

### Frontend / Nginx
```bash
# Recargar configuración nginx
sudo nginx -s reload

# Ver errores nginx
sudo tail -f /var/log/nginx/error.log
```

### Git
```bash
# Actualizar desde local
git add .
git commit -m "Descripción del cambio"
git push origin main

# En la VPS
git pull origin main
```

---

## 🔄 Flujo de Trabajo Completo

### Para actualizar el proyecto completo:

```bash
# === EN TU MÁQUINA LOCAL ===

# 1. Actualizar código (tus cambios)
# ... haces tus cambios en el código ...

# 2. Compilar y probar localmente
cd frontend && npm run build  # Verificar que compila
cd ../forum && ./mvnw package -DskipTests  # Compilar backend

# 3. Hacer commit y push
git add .
git commit -m "Mis cambios"
git push origin main

# === EN LA VPS ===

# 4. Conectar a la VPS
ssh usuario@tu-servidor

# 5. Actualizar backend
cd forum
git pull origin main
./mvnw package -DskipTests
pm2 restart forotaguas-backend

# 6. Actualizar frontend
cd /var/www/forotaguas
git pull origin main
npm run build
sudo nginx -s reload

# 7. Verificar
curl http://localhost:8081/api/categories
```

---

## 🆘 Solución de Problemas

### El backend no inicia
```bash
# Ver logs
pm2 logs forotaguas-backend

# Common errors:
# - Puerto en uso: pm2 delete all && pm2 start ...
# - PostgreSQL no conecta: systemctl status postgresql
```

### El frontend no carga
```bash
# Verificar archivos
ls -la /var/www/forotaguas/

# Ver errores nginx
sudo tail -50 /var/log/nginx/error.log
```

### La API no responde
```bash
# Verificar que el backend está corriendo
pm2 status

# Probar directamente
curl http://localhost:8081/api/categories

# Si no responde, reiniciar
pm2 restart forotaguas-backend
```

---

## 📝 Variables de Entorno

### Backend (application.properties)
```properties
server.port=8081
spring.datasource.url=jdbc:postgresql://localhost:5432/forum
spring.datasource.username=postgres
spring.datasource.password=postgres
jwt.secret=tu-secret-aqui
```

### Frontend (.env)
```env
VITE_API_URL=http://tu-servidor:8081
# o si usas dominio:
VITE_API_URL=https://api.tu-dominio.com
```

---

## ⚡ Scripts de Actualización Rápida

### Script para actualizar todo (créalo en la VPS como `update.sh`)

```bash
#!/bin/bash
echo "🚀 Actualizando Forotaguas..."

echo "📦 Actualizando backend..."
cd /home/usuario/forum
git pull origin main
./mvnw package -DskipTests -q
pm2 restart forotaguas-backend

echo "🎨 Actualizando frontend..."
cd /var/www/forotaguas
git pull origin main
npm run build

echo "🔄 Recargando Nginx..."
sudo nginx -s reload

echo "✅ Actualización completa!"
echo "Backend: $(pm2 status | grep forotaguas-backend)"
```

```bash
chmod +x update.sh
./update.sh
```

---

## 🌐 URLs de Producción

- **Frontend**: `https://tu-dominio.com`
- **Backend API**: `https://tu-dominio.com/api`
- **Backend (directo)**: `http://tu-servidor-ip:8081`

---

*Última actualización: $(date)*
