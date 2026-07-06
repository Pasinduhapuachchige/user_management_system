# Deploying User Management System to IIS

This guide walks you through hosting **both** the React (Vite) frontend and the Express.js backend on IIS on a Windows Server.

---

## Architecture Overview

```
IIS Server
├── Site: "UMS-Frontend" (port 80 or 443)
│   └── Serves the static React build (dist/ folder)
│   └── web.config with URL Rewrite for SPA routing
│
└── Site: "UMS-Backend" (port 5000 or a sub-path)
    └── Runs Express.js via iisnode
    └── web.config with iisnode handler
```

> [!TIP]
> **Two approaches exist:** You can either run them as **two separate IIS sites** (recommended) or run the backend as a **virtual application** under the frontend site. This guide covers **two separate sites** for clarity.

---

## Prerequisites

### 1. Install IIS with Required Features

Open **PowerShell as Administrator** and run:

```powershell
# Install IIS with all required features
Install-WindowsFeature -Name Web-Server, Web-Common-Http, Web-Static-Content, Web-Default-Doc, Web-Http-Errors, Web-Asp-Net45, Web-ISAPI-Ext, Web-ISAPI-Filter, Web-Mgmt-Tools, Web-Mgmt-Console
```

Or via **Server Manager** → Add Roles and Features → Web Server (IIS) → ensure these are checked:
- ✅ Static Content
- ✅ Default Document
- ✅ HTTP Errors
- ✅ ISAPI Extensions
- ✅ ISAPI Filters
- ✅ Request Filtering

### 2. Install Node.js on the Server

Download and install **Node.js LTS** from [https://nodejs.org](https://nodejs.org). Verify:

```powershell
node --version   # Should show v18+ or v20+
npm --version
```

### 3. Install iisnode

**iisnode** allows IIS to host Node.js applications (your Express backend).

Download from: [https://github.com/azure/iisnode/releases](https://github.com/azure/iisnode/releases)

- For 64-bit Windows: `iisnode-full-v0.2.26-x64.msi`

Run the installer and restart IIS:

```powershell
iisreset
```

### 4. Install URL Rewrite Module

Download from: [https://www.iis.net/downloads/microsoft/url-rewrite](https://www.iis.net/downloads/microsoft/url-rewrite)

This is required for both SPA routing (frontend) and routing requests to Node.js (backend).

---

## Part 1: Deploy the React Frontend

### Step 1: Build the React App

Update the `.env` file to point to your production backend URL:

```env
VITE_BACKEND_URL=http://your-server-ip:5000
```

> [!IMPORTANT]
> Replace `your-server-ip` with the actual server IP/domain. If using a sub-path or reverse proxy, adjust accordingly.

Then build:

```powershell
cd "c:\Users\Pasindu Hapuachchige\Desktop\New folder (2)\user_management_system\react_frontend"
npm install
npm run build
```

This creates the `dist/` folder with your static production files.

### Step 2: Copy Build Files to IIS Directory

```powershell
# Create the IIS directory for the frontend
New-Item -Path "C:\inetpub\ums-frontend" -ItemType Directory -Force

# Copy the built files
Copy-Item -Path ".\dist\*" -Destination "C:\inetpub\ums-frontend\" -Recurse -Force
```

### Step 3: Create `web.config` for SPA Routing

Create this file at `C:\inetpub\ums-frontend\web.config`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>

    <!-- Enable URL Rewrite for React Router (SPA) -->
    <rewrite>
      <rules>
        <rule name="React SPA Fallback" stopProcessing="true">
          <match url=".*" />
          <conditions logicalGrouping="MatchAll">
            <!-- Don't rewrite requests for actual files -->
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <!-- Don't rewrite requests for actual directories -->
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
          </conditions>
          <!-- Redirect everything else to index.html -->
          <action type="Rewrite" url="/index.html" />
        </rule>
      </rules>
    </rewrite>

    <!-- Set correct MIME types for modern assets -->
    <staticContent>
      <remove fileExtension=".js" />
      <mimeMap fileExtension=".js" mimeType="application/javascript" />
      <remove fileExtension=".json" />
      <mimeMap fileExtension=".json" mimeType="application/json" />
      <remove fileExtension=".woff" />
      <mimeMap fileExtension=".woff" mimeType="font/woff" />
      <remove fileExtension=".woff2" />
      <mimeMap fileExtension=".woff2" mimeType="font/woff2" />
      <remove fileExtension=".svg" />
      <mimeMap fileExtension=".svg" mimeType="image/svg+xml" />
      <remove fileExtension=".webp" />
      <mimeMap fileExtension=".webp" mimeType="image/webp" />
    </staticContent>

    <!-- Enable compression -->
    <httpCompression>
      <dynamicTypes>
        <add mimeType="application/javascript" enabled="true" />
      </dynamicTypes>
    </httpCompression>

  </system.webServer>
</configuration>
```

### Step 4: Create the IIS Site for Frontend

Open **IIS Manager** (`inetmgr`):

1. Right-click **Sites** → **Add Website...**
2. Configure:
   - **Site name**: `UMS-Frontend`
   - **Physical path**: `C:\inetpub\ums-frontend`
   - **Binding**: `http`, Port `80` (or `443` with SSL cert)
   - **Host name**: your domain (e.g., `ums.yourcompany.com`) or leave blank for IP access
3. Click **OK**

> [!NOTE]
> If port 80 is already used by "Default Web Site", either stop that site or use a different port/host header.

---

## Part 2: Deploy the Express.js Backend

### Step 1: Prepare the Backend Files

```powershell
# Create the IIS directory for the backend
New-Item -Path "C:\inetpub\ums-backend" -ItemType Directory -Force

# Copy the entire backend project (excluding node_modules)
$source = "c:\Users\Pasindu Hapuachchige\Desktop\New folder (2)\user_management_system\express_backend"
$dest = "C:\inetpub\ums-backend"

# Copy source files
Get-ChildItem -Path $source -Exclude "node_modules" | Copy-Item -Destination $dest -Recurse -Force
```

### Step 2: Install Dependencies on Server

```powershell
cd "C:\inetpub\ums-backend"
npm install --production
```

### Step 3: Update the `.env` File

Edit `C:\inetpub\ums-backend\.env` with production values:

```env
MONGO_URI=mongodb://your-mongo-server:27017/UMS
JWT_SECRET=YourStrongProductionSecret_Change_This!
PORT=5000
CLIENT_URL=http://your-server-ip
EXPRESS_URL=http://your-server-ip:5000
EMAIL_USER=sathsarakumbukage@gmail.com
EMAIL_PASS=rptg msgy ijav zreb
BACKUP_ENCRYPTION_KEY=YourProductionEncryptionKey
```

> [!CAUTION]
> **Change `JWT_SECRET`** and **`BACKUP_ENCRYPTION_KEY`** to strong, random values in production. The current values are too weak. Also consider using Windows environment variables or Azure Key Vault instead of `.env` for secrets.

> [!IMPORTANT]
> Set `CLIENT_URL` to the actual URL of your frontend site (e.g., `http://ums.yourcompany.com`). This controls CORS — if it's wrong, the frontend won't be able to call the API.

### Step 4: Handle the ESM `"type": "module"` Issue with iisnode

Your backend uses `"type": "module"` (ES Modules with `import/export`). **iisnode has limited ESM support**. You need to create a **CommonJS wrapper** that launches your ESM entry point.

Create `C:\inetpub\ums-backend\iis-entry.js`:

```javascript
// iis-entry.js — CommonJS wrapper for iisnode
// iisnode doesn't natively support ESM ("type": "module")
// This wrapper launches server.js as a child process with the correct flags

const { execSync, spawn } = require('child_process');
const path = require('path');

// iisnode passes the port via the PORT environment variable as a named pipe
// We need to make sure our Express app listens on it
const serverPath = path.join(__dirname, 'server.js');

// Spawn Node.js with ESM support
const child = spawn(process.execPath, [serverPath], {
  env: { ...process.env },
  stdio: 'inherit',
  cwd: __dirname
});

child.on('error', (err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

child.on('exit', (code) => {
  process.exit(code || 0);
});
```

> [!WARNING]
> **Alternative (Recommended) approach:** Instead of the wrapper above, you can **rename** `iis-entry.js` as the handler and modify `server.js` to listen on `process.env.PORT` (which iisnode sets to a named pipe). See the `server.js` modification below.

#### Modify `server.js` to Support iisnode's Named Pipe

iisnode communicates the port to Node.js via `process.env.PORT`, which is a **named pipe** (like `\\.\pipe\xxx`). Your current `server.js` already reads `process.env.PORT`, so this should work automatically! The key line is:

```javascript
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => { ... });
```

✅ This is already correct — iisnode will set `PORT` to a named pipe and Express will listen on it.

### Step 5: Create `web.config` for the Backend

Create `C:\inetpub\ums-backend\web.config`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>

    <!-- Use iisnode to handle .js files -->
    <handlers>
      <add name="iisnode" path="server.js" verb="*" modules="iisnode" />
    </handlers>

    <!-- URL Rewrite: Route ALL requests to server.js -->
    <rewrite>
      <rules>
        <!-- Don't interfere with requests for node-inspector debugging -->
        <rule name="NodeInspector" patternSyntax="ECMAScript" stopProcessing="true">
          <match url="^server.js\/debug[\/]?" />
        </rule>

        <!-- Serve static uploads directly -->
        <rule name="StaticUploads" stopProcessing="true">
          <match url="^prop/(.*)" />
          <conditions>
            <add input="{REQUEST_FILENAME}" matchType="IsFile" />
          </conditions>
          <action type="None" />
        </rule>

        <!-- Route everything else to Express -->
        <rule name="ExpressRouting" stopProcessing="true">
          <match url=".*" />
          <conditions>
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
          </conditions>
          <action type="Rewrite" url="server.js" />
        </rule>
      </rules>
    </rewrite>

    <!-- iisnode configuration -->
    <iisnode
      nodeProcessCommandLine="&quot;C:\Program Files\nodejs\node.exe&quot;"
      interceptor="&quot;%programfiles%\iisnode\interceptor.js&quot;"
      node_env="production"
      loggingEnabled="true"
      logDirectory="iisnode"
      debuggingEnabled="false"
      maxConcurrentRequestsPerProcess="1024"
      maxNamedPipeConnectionRetry="200"
      namedPipeConnectionRetryDelay="250"
      watchedFiles="web.config;*.js"
    />

    <!-- Required for POST requests with large bodies (file uploads) -->
    <security>
      <requestFiltering>
        <requestLimits maxAllowedContentLength="52428800" /> <!-- 50MB -->
      </requestFiltering>
    </security>

  </system.webServer>
</configuration>
```

> [!IMPORTANT]
> **ESM Workaround**: If `server.js` fails to load because of `"type": "module"`, change the handler path to your wrapper:
> ```xml
> <add name="iisnode" path="iis-entry.js" verb="*" modules="iisnode" />
> ```
> And update the rewrite rules to also point to `iis-entry.js` instead of `server.js`.

### Step 6: Create the IIS Site for Backend

Open **IIS Manager** (`inetmgr`):

1. Right-click **Sites** → **Add Website...**
2. Configure:
   - **Site name**: `UMS-Backend`
   - **Physical path**: `C:\inetpub\ums-backend`
   - **Binding**: `http`, Port `5000`
3. Click **OK**

### Step 7: Set Application Pool Identity & Permissions

1. In IIS Manager, click **Application Pools**
2. Select `UMS-Backend` pool → **Advanced Settings**
3. Set **Identity** to `LocalSystem` (or a service account with appropriate permissions)
4. Set **.NET CLR Version** to **No Managed Code** (Node.js doesn't use .NET)
5. Set **Start Mode** to `AlwaysRunning` (optional, keeps the app warm)

Grant file permissions:

```powershell
# Give IIS_IUSRS read/write access to the backend directory
icacls "C:\inetpub\ums-backend" /grant "IIS_IUSRS:(OI)(CI)F" /T
icacls "C:\inetpub\ums-frontend" /grant "IIS_IUSRS:(OI)(CI)R" /T

# Also grant access to the uploads folder specifically
icacls "C:\inetpub\ums-backend\src\uploads" /grant "IIS_IUSRS:(OI)(CI)F" /T
```

---

## Part 3: CORS Configuration Update

Update the backend's `server.js` CORS settings for production. The `CLIENT_URL` in `.env` must match your frontend's actual URL:

```javascript
// In server.js — already correct, just ensure .env CLIENT_URL is right
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
}));
```

Set in `C:\inetpub\ums-backend\.env`:
```env
CLIENT_URL=http://your-frontend-domain-or-ip
```

---

## Part 4: Firewall Rules

Open the necessary ports in Windows Firewall:

```powershell
# Allow HTTP (port 80) for frontend
New-NetFirewallRule -DisplayName "IIS HTTP" -Direction Inbound -Protocol TCP -LocalPort 80 -Action Allow

# Allow backend (port 5000)
New-NetFirewallRule -DisplayName "IIS Backend" -Direction Inbound -Protocol TCP -LocalPort 5000 -Action Allow

# If using HTTPS (port 443)
New-NetFirewallRule -DisplayName "IIS HTTPS" -Direction Inbound -Protocol TCP -LocalPort 443 -Action Allow
```

---

## Part 5: Verification

### Test the Backend

```powershell
# Test from the server itself
Invoke-WebRequest -Uri "http://localhost:5000/" -UseBasicParsing
# Should return: "Server is running 🚀"

# Test API endpoint
Invoke-WebRequest -Uri "http://localhost:5000/api/v1/check-auth" -UseBasicParsing
# Should return 401 (unauthorized) — that's correct, it means the API is responding
```

### Test the Frontend

Open a browser and navigate to:
```
http://localhost/
```

You should see the React login page.

### Check iisnode Logs (if backend fails)

```powershell
# Logs are written to the iisnode subdirectory
Get-ChildItem "C:\inetpub\ums-backend\iisnode" | Sort-Object LastWriteTime -Descending | Select-Object -First 5
Get-Content "C:\inetpub\ums-backend\iisnode\*" -Tail 50
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| **500 Error on backend** | Check `C:\inetpub\ums-backend\iisnode\` log files for Node.js errors |
| **404 on frontend routes** | Ensure `web.config` URL Rewrite is working. Check URL Rewrite module is installed |
| **CORS errors in browser** | Verify `CLIENT_URL` in backend `.env` matches the exact frontend URL (including port) |
| **"Cannot find module" errors** | Run `npm install --production` in the backend directory |
| **ESM/import errors** | Use the `iis-entry.js` CommonJS wrapper approach (see Step 4) |
| **File upload fails** | Check `maxAllowedContentLength` in `web.config` and folder permissions on `src/uploads` |
| **MongoDB connection fails** | Ensure MongoDB is accessible from the server. Check `MONGO_URI` in `.env` |
| **Named pipe error** | iisnode sets `PORT` to a pipe path — don't hardcode the port in `app.listen()` |
| **Puppeteer/Chrome errors** | Puppeteer needs Chrome installed on the server. Install via `npx puppeteer browsers install chrome` |
| **node-cron not running** | iisnode may recycle the process. Set `idleTimeout` to `0` in the App Pool's Advanced Settings |

---

## Optional: Single-Site Setup with Reverse Proxy

If you prefer to run **everything on port 80** with the backend under `/api`:

1. Install **ARR (Application Request Routing)** module for IIS
2. Set up a reverse proxy rule in the frontend's `web.config`:

```xml
<!-- Add this rule BEFORE the SPA fallback rule -->
<rule name="API Reverse Proxy" stopProcessing="true">
  <match url="^api/(.*)" />
  <action type="Rewrite" url="http://localhost:5000/api/{R:1}" />
</rule>
```

3. Update the frontend `.env`:
```env
VITE_BACKEND_URL=http://your-domain.com
```

This way, both frontend and API are served from the same origin, eliminating CORS issues entirely.

---

## Quick Reference: Deployment Checklist

- [ ] IIS installed with required features
- [ ] Node.js installed on server
- [ ] iisnode installed
- [ ] URL Rewrite module installed
- [ ] React app built with production `VITE_BACKEND_URL`
- [ ] Frontend files copied to `C:\inetpub\ums-frontend`
- [ ] Frontend `web.config` created (SPA rewrite)
- [ ] Frontend IIS site created (port 80)
- [ ] Backend files copied to `C:\inetpub\ums-backend`
- [ ] Backend `npm install --production` completed
- [ ] Backend `.env` updated with production values
- [ ] Backend `web.config` created (iisnode handler)
- [ ] Backend IIS site created (port 5000)
- [ ] App Pool set to **No Managed Code**
- [ ] File permissions set (`IIS_IUSRS`)
- [ ] Firewall rules configured
- [ ] MongoDB accessible from server
- [ ] CORS `CLIENT_URL` matches frontend URL
- [ ] Tested both frontend and backend
