# Gatherly - Deployment Guide

Complete deployment instructions for the Gatherly MERN stack application on AWS EC2 with PM2 and Nginx.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [MongoDB Atlas Setup](#mongodb-atlas-setup)
3. [AWS EC2 Setup](#aws-ec2-setup)
4. [Backend Deployment](#backend-deployment)
5. [Frontend Deployment](#frontend-deployment)
6. [Nginx Configuration](#nginx-configuration)
7. [PM2 Configuration](#pm2-configuration)
8. [Environment Variables](#environment-variables)
9. [SSL with Let's Encrypt](#ssl-with-lets-encrypt)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- AWS Account
- Domain name (optional, for SSL)
- Local machine with Git, Node.js 18+

---

## MongoDB Atlas Setup

1. **Create MongoDB Atlas Account**
   - Go to [https://www.mongodb.com/atlas](https://www.mongodb.com/atlas)
   - Sign up for a free account

2. **Create a New Cluster**
   - Click "Build a Database"
   - Choose "M0 Free" tier
   - Select your preferred region (closest to your EC2 instance)
   - Name your cluster: `gatherly-cluster`

3. **Configure Database Access**
   - Go to "Database Access" → "Add New Database User"
   - Create a username and password (save these!)
   - Set privileges to "Read and write to any database"

4. **Configure Network Access**
   - Go to "Network Access" → "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0) for development
   - For production, add your EC2 instance IP only

5. **Get Connection String**
   - Go to "Database" → Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `myFirstDatabase` with `gatherly`

   Example:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/gatherly?retryWrites=true&w=majority
   ```

---

## AWS EC2 Setup

### 1. Launch EC2 Instance

1. Go to AWS Console → EC2 → Launch Instance
2. **Name**: `gatherly-server`
3. **AMI**: Ubuntu Server 22.04 LTS (Free Tier)
4. **Instance Type**: t2.micro (Free Tier) or t3.small
5. **Key Pair**: Create new or use existing
6. **Network Settings**:
   - Create security group
   - Allow SSH (port 22) from your IP
   - Allow HTTP (port 80) from anywhere
   - Allow HTTPS (port 443) from anywhere
   - Allow Custom TCP (port 5000) from anywhere (for backend API)

7. **Storage**: 20 GB GP2 (default)
8. Click "Launch Instance"

### 2. Connect to EC2 Instance

```bash
# Using SSH (replace with your key file and EC2 IP)
chmod 400 your-key.pem
ssh -i your-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

### 3. Update System and Install Dependencies

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v18.x.x
npm --version

# Install PM2 globally
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx

# Install Git
sudo apt install -y git

# Install build tools (for native modules)
sudo apt install -y build-essential
```

---

## Backend Deployment

### 1. Clone Repository

```bash
cd ~
git clone https://github.com/YOUR_USERNAME/gatherly.git
cd gatherly/gatherly-backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create Environment File

```bash
nano .env
```

Add the following:
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/gatherly?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_min_32_characters_long
FRONTEND_URL=http://YOUR_EC2_PUBLIC_IP
```

Save and exit (Ctrl+X, Y, Enter)

### 4. Test Backend

```bash
node server.js
```

You should see:
```
Server running on port 5000
Environment: production
MongoDB Connected: cluster.mongodb.net
```

Press Ctrl+C to stop

### 5. Start with PM2

```bash
# Start the application
pm2 start server.js --name "gatherly-backend"

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup systemd
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu

# Check status
pm2 status
pm2 logs gatherly-backend
```

---

## Frontend Deployment

### 1. Build Frontend Locally (or on EC2)

**Option A: Build on EC2**

```bash
cd ~/gatherly/app
```

**Option B: Build locally and upload**

On your local machine:
```bash
cd app
npm install
```

Create `.env.production`:
```env
VITE_API_URL=http://YOUR_EC2_PUBLIC_IP:5000/api
```

Build:
```bash
npm run build
```

Upload `dist` folder to EC2:
```bash
scp -r -i your-key.pem dist ubuntu@YOUR_EC2_PUBLIC_IP:/home/ubuntu/gatherly/app/
```

### 2. Build on EC2 (Alternative)

```bash
cd ~/gatherly/app

# Create production env file
echo "VITE_API_URL=http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):5000/api" > .env.production

# Install dependencies
npm install

# Build
npm run build
```

---

## Nginx Configuration

### 1. Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/gatherly
```

Add the following configuration:

```nginx
# Backend API - Proxy to Node.js
server {
    listen 80;
    server_name YOUR_EC2_PUBLIC_IP YOUR_DOMAIN.COM;

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Socket.io WebSocket support
    location /socket.io/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Frontend Static Files
    location / {
        root /home/ubuntu/gatherly/app/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
}
```

Save and exit

### 2. Enable Site

```bash
# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Enable gatherly site
sudo ln -s /etc/nginx/sites-available/gatherly /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# Enable Nginx to start on boot
sudo systemctl enable nginx
```

---

## PM2 Configuration

### Useful PM2 Commands

```bash
# Start application
pm2 start server.js --name "gatherly-backend"

# Restart application
pm2 restart gatherly-backend

# Stop application
pm2 stop gatherly-backend

# Delete application from PM2
pm2 delete gatherly-backend

# View logs
pm2 logs gatherly-backend
pm2 logs gatherly-backend --lines 100

# Monitor resources
pm2 monit

# List all processes
pm2 list

# Save current configuration
pm2 save

# Generate startup script
pm2 startup systemd
```

### Create ecosystem.config.js (Optional)

```bash
cd ~/gatherly/gatherly-backend
nano ecosystem.config.js
```

```javascript
module.exports = {
  apps: [{
    name: 'gatherly-backend',
    script: './server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
```

Start with ecosystem:
```bash
pm2 start ecosystem.config.js
```

---

## Environment Variables

### Backend (.env)

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Secret for JWT signing | `your-secret-key` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://your-domain.com` |

### Frontend (.env.production)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://your-domain.com/api` |

---

## SSL with Let's Encrypt

### 1. Install Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 2. Obtain SSL Certificate

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Follow the prompts:
- Enter email address
- Agree to terms
- Choose whether to redirect HTTP to HTTPS (recommended: Yes)

### 3. Auto-Renewal

Certbot automatically sets up auto-renewal. Test it:

```bash
sudo certbot renew --dry-run
```

### 4. Update Environment Variables

After SSL is configured, update your environment files:

**Backend `.env`**:
```env
FRONTEND_URL=https://yourdomain.com
```

**Frontend `.env.production`**:
```env
VITE_API_URL=https://yourdomain.com/api
```

Rebuild and redeploy frontend:
```bash
cd ~/gatherly/app
npm run build
```

---

## Troubleshooting

### Backend Issues

**Problem**: Cannot connect to MongoDB
```bash
# Test MongoDB connection
node -e "const mongoose = require('mongoose'); mongoose.connect(process.env.MONGODB_URI).then(() => console.log('Connected')).catch(e => console.error(e))"
```
- Check if IP is whitelisted in MongoDB Atlas
- Verify connection string format
- Check network connectivity: `curl -v https://cloud.mongodb.com`

**Problem**: Port 5000 already in use
```bash
# Find process using port 5000
sudo lsof -i :5000

# Kill process
sudo kill -9 <PID>
```

**Problem**: PM2 not starting on boot
```bash
pm2 startup systemd
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu
pm2 save
```

### Frontend Issues

**Problem**: Blank page after deployment
- Check browser console for errors
- Verify `VITE_API_URL` is correct
- Check Nginx error logs: `sudo tail -f /var/log/nginx/error.log`

**Problem**: API calls failing
- Check CORS settings in backend
- Verify API URL in browser Network tab
- Check if backend is running: `pm2 status`

### Nginx Issues

**Problem**: 502 Bad Gateway
```bash
# Check if backend is running
pm2 status
pm2 logs

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

**Problem**: 404 on refresh
- Ensure `try_files $uri $uri/ /index.html;` is in Nginx config

### Socket.io Issues

**Problem**: Chat not working
- Check WebSocket connection in browser console
- Verify Nginx WebSocket configuration
- Check if `FRONTEND_URL` matches actual frontend URL

---

## File Structure on EC2

```
/home/ubuntu/
└── gatherly/
    ├── gatherly-backend/
    │   ├── server.js
    │   ├── package.json
    │   ├── .env
    │   ├── controllers/
    │   ├── models/
    │   ├── routes/
    │   ├── middleware/
    │   └── config/
    └── app/
        ├── dist/
        │   ├── index.html
        │   └── assets/
        ├── src/
        └── package.json
```

---

## Quick Deployment Checklist

- [ ] MongoDB Atlas cluster created
- [ ] Database user created with password
- [ ] IP whitelist configured (0.0.0.0/0 or EC2 IP)
- [ ] EC2 instance launched with security groups
- [ ] Node.js 18+ installed on EC2
- [ ] PM2 installed globally
- [ ] Nginx installed
- [ ] Backend code cloned to EC2
- [ ] Backend dependencies installed
- [ ] Backend `.env` file configured
- [ ] Backend tested with `node server.js`
- [ ] Backend started with PM2
- [ ] Frontend built
- [ ] Nginx configured
- [ ] SSL certificate obtained (optional)
- [ ] Application accessible via browser

---

## Maintenance

### Update Application

```bash
# Pull latest changes
cd ~/gatherly
git pull origin main

# Update backend
cd gatherly-backend
npm install
pm2 restart gatherly-backend

# Update frontend
cd ../app
npm install
npm run build
```

### Backup Database

Use MongoDB Atlas built-in backups or:
```bash
mongodump --uri="mongodb+srv://username:password@cluster.mongodb.net/gatherly"
```

### Monitor Logs

```bash
# Backend logs
pm2 logs gatherly-backend

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# System logs
sudo journalctl -u nginx -f
```

---

## Security Best Practices

1. **Use strong JWT_SECRET** (min 32 characters)
2. **Restrict MongoDB Atlas IP whitelist** to EC2 IP only
3. **Keep software updated**: `sudo apt update && sudo apt upgrade`
4. **Use SSL/HTTPS** for production
5. **Set up firewall** (UFW):
   ```bash
   sudo ufw allow OpenSSH
   sudo ufw allow 'Nginx Full'
   sudo ufw enable
   ```
6. **Regular backups** of database
7. **Use environment variables** for secrets (never commit .env)

---

## Support

For issues or questions:
- Check logs: `pm2 logs`, `sudo tail -f /var/log/nginx/error.log`
- Verify configurations
- Test API endpoints with curl or Postman
- Check MongoDB Atlas status
