# IQnite Deployment Guide 🚀

This guide covers deploying the IQnite quiz platform to production.

## 📋 Pre-Deployment Checklist

- [ ] Backend compiles without errors
- [ ] Frontend builds successfully
- [ ] All environment variables configured
- [ ] Database migrations applied
- [ ] SSL certificates obtained (for HTTPS)
- [ ] Domain name configured (optional)

## 🔧 Production Environment Variables

### Backend (.env)
```env
# Database
DATABASE_URL="postgresql://username:password@host:5432/iqnite?schema=public"

# JWT Configuration
JWT_SECRET="<generate-strong-secret-key-here>"
JWT_EXPIRES_IN="7d"
REFRESH_TOKEN_EXPIRES_IN="30d"

# Server
NODE_ENV="production"
PORT=3000

# CORS (Update with your frontend URL)
CORS_ORIGIN="https://your-frontend-domain.com"
```

### Frontend (.env.production)
```env
VITE_API_URL=https://your-backend-api.com/api
```

## 🌐 Deployment Options

### Option 1: Deploy to VPS (DigitalOcean, AWS EC2, etc.)

#### Step 1: Prepare Server
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 22
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL 17
sudo apt install -y postgresql postgresql-contrib

# Install PM2 (Process Manager)
sudo npm install -g pm2

# Install Nginx (Reverse Proxy)
sudo apt install -y nginx
```

#### Step 2: Setup Database
```bash
# Login to PostgreSQL
sudo -u postgres psql

# Create database and user
CREATE DATABASE iqnite;
CREATE USER iqnite_user WITH PASSWORD 'your-secure-password';
GRANT ALL PRIVILEGES ON DATABASE iqnite TO iqnite_user;
\q
```

#### Step 3: Deploy Backend
```bash
# Clone or upload your code
cd /var/www
git clone <your-repo-url> iqnite
cd iqnite/backend

# Install dependencies
npm install --production

# Setup environment
nano .env
# (Paste production environment variables)

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Build application
npm run build

# Start with PM2
pm2 start dist/main.js --name iqnite-backend
pm2 save
pm2 startup
```

#### Step 4: Deploy Frontend
```bash
cd /var/www/iqnite/frontend

# Install dependencies
npm install

# Build for production
npm run build

# Frontend files are now in dist/ folder
```

#### Step 5: Configure Nginx
```bash
sudo nano /etc/nginx/sites-available/iqnite
```

```nginx
# Backend API
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}

# Frontend
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    root /var/www/iqnite/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/iqnite /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Step 6: Setup SSL with Let's Encrypt
```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get certificates
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com

# Auto-renewal is configured automatically
```

### Option 2: Deploy to Heroku

#### Backend Deployment
```bash
cd backend

# Create Heroku app
heroku create iqnite-backend

# Add PostgreSQL
heroku addons:create heroku-postgresql:mini

# Set environment variables
heroku config:set JWT_SECRET="your-secret"
heroku config:set JWT_EXPIRES_IN="7d"
heroku config:set REFRESH_TOKEN_EXPIRES_IN="30d"

# Create Procfile
echo "web: npm run start:prod" > Procfile

# Deploy
git add .
git commit -m "Deploy to Heroku"
git push heroku main

# Run migrations
heroku run npx prisma migrate deploy
```

#### Frontend Deployment (Netlify/Vercel)
```bash
cd frontend

# Build
npm run build

# Deploy to Netlify
npx netlify-cli deploy --prod --dir=dist

# Or deploy to Vercel
npx vercel --prod
```

### Option 3: Deploy to Docker

#### Create Dockerfiles

**backend/Dockerfile**
```dockerfile
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npx prisma generate
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
```

**frontend/Dockerfile**
```dockerfile
FROM node:22-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**frontend/nginx.conf**
```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

**docker-compose.yml**
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:17-alpine
    environment:
      POSTGRES_DB: iqnite
      POSTGRES_USER: iqnite_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://iqnite_user:${DB_PASSWORD}@postgres:5432/iqnite
      JWT_SECRET: ${JWT_SECRET}
      JWT_EXPIRES_IN: "7d"
      REFRESH_TOKEN_EXPIRES_IN: "30d"
    depends_on:
      - postgres
    command: sh -c "npx prisma migrate deploy && npm run start:prod"

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  postgres_data:
```

**Deploy with Docker Compose**
```bash
# Create .env file
echo "DB_PASSWORD=your-secure-password" > .env
echo "JWT_SECRET=your-jwt-secret" >> .env

# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

## 🔒 Security Checklist

- [ ] Change default passwords
- [ ] Generate strong JWT_SECRET
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS properly
- [ ] Set up firewall rules
- [ ] Enable rate limiting
- [ ] Regular security updates
- [ ] Database backups configured
- [ ] Environment variables secured
- [ ] Remove development dependencies

## 📊 Monitoring

### Setup PM2 Monitoring (VPS)
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7

# View logs
pm2 logs iqnite-backend
pm2 monit
```

### Database Backups
```bash
# Create backup script
cat > /usr/local/bin/backup-iqnite.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/iqnite"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR
pg_dump -U iqnite_user iqnite > $BACKUP_DIR/iqnite_$DATE.sql
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
EOF

chmod +x /usr/local/bin/backup-iqnite.sh

# Add to crontab (daily at 2 AM)
crontab -e
# Add: 0 2 * * * /usr/local/bin/backup-iqnite.sh
```

## 🧪 Post-Deployment Testing

1. **Backend Health Check**
   ```bash
   curl https://api.yourdomain.com/api/health
   ```

2. **Test Registration**
   - Visit your frontend URL
   - Register a new account
   - Verify email/confirmation works

3. **Test Quiz Creation**
   - Login as organizer
   - Create a quiz
   - Add questions
   - Verify quiz code generation

4. **Test Quiz Taking**
   - Login as participant
   - Join quiz with code
   - Complete quiz
   - View results

5. **Performance Testing**
   ```bash
   # Install Apache Bench
   sudo apt install apache2-utils
   
   # Test API endpoint
   ab -n 1000 -c 10 https://api.yourdomain.com/api/health
   ```

## 📈 Scaling Considerations

### Horizontal Scaling
- Use load balancer (Nginx, HAProxy)
- Deploy multiple backend instances
- Shared PostgreSQL database
- Redis for session management

### Database Optimization
```sql
-- Add indexes
CREATE INDEX idx_quiz_code ON "Quiz"(code);
CREATE INDEX idx_session_participant ON "QuizSession"("participantId");
CREATE INDEX idx_answer_session ON "Answer"("sessionId");
```

### Caching
- Implement Redis for frequent queries
- Cache quiz details
- Cache leaderboards

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check logs
pm2 logs iqnite-backend
journalctl -u iqnite-backend -n 50

# Check database connection
psql -U iqnite_user -d iqnite -h localhost
```

### Frontend shows blank page
- Check browser console for errors
- Verify API URL in .env.production
- Check CORS configuration
- Ensure backend is accessible

### Database migration issues
```bash
# Reset migrations (CAUTION: Development only)
npx prisma migrate reset

# Check migration status
npx prisma migrate status
```

## 📞 Support

For issues or questions:
- Check README.md
- Review API documentation (QUIZ_API_DOCS.md)
- Check server logs
- Verify environment variables

---

**Your IQnite platform is now ready for production!** 🎉
