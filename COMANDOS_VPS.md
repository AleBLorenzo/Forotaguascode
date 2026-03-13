# Comandos para Actualizar la VPS

## Después de hacer un commit y push:

```bash
# Conectar a la VPS
ssh usuario@tu-servidor

# ============================================
# ACTUALIZAR BACKEND
# ============================================
cd ~/Forotaguas/forum
git pull origin main
./mvnw clean package -DskipTests -q
pm2 restart forotaguas-backend

# Verificar que funciona
curl http://localhost:8081/api/categories

# ============================================
# ACTUALIZAR FRONTEND  
# ============================================
cd /var/www/forotaguas
git pull origin main
npm run build
sudo nginx -s reload

# ============================================
# VERIFICAR
# ============================================
echo "=== Backend ==="
curl http://localhost:8081/api/categories

echo ""
echo "=== Frontend ==="
curl -s tu-dominio.com | head -5
```

## Comando combinado (copia y pega todo junto):

```bash
ssh usuario@tu-servidor "cd ~/Forotaguas/forum && git pull origin main && ./mvnw clean package -DskipTests -q && pm2 restart forotaguas-backend" && ssh usuario@tu-servidor "cd /var/www/forotaguas && git pull origin main && npm run build && sudo nginx -s reload"
```

## Reemplaza:
- `usuario@tu-servidor` → Tu usuario y IP de la VPS
- `tu-dominio.com` → Tu dominio

---

## Si es la primera vez en la VPS:

```bash
# Instalar PM2 si no lo tienes
sudo npm install -g pm2

# Crear directorio del frontend
sudo mkdir -p /var/www/forotaguas
sudo chown -R $USER:$USER /var/www/forotaguas
```
