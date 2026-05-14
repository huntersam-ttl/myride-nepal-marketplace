# 🔌 Database Connection Guide - MyRideNepal

Complete guide for connecting to your Supabase PostgreSQL database.

---

## 📋 Connection Details

### Your Database
- **Project:** rcypkqctgonotawnajqb
- **Host:** `db.rcypkqctgonotawnajqb.supabase.co`
- **Port:** `5432`
- **Database:** `postgres`
- **User:** `postgres`

### Connection String Format
```
postgresql://postgres:[YOUR-PASSWORD]@db.rcypkqctgonotawnajqb.supabase.co:5432/postgres
```

⚠️ **Important:** Replace `[YOUR-PASSWORD]` with your actual database password.

---

## 🔑 Getting Your Database Password

### Option 1: From Supabase Dashboard
1. Visit: https://supabase.com/dashboard/project/rcypkqctgonotawnajqb/settings/database
2. Scroll to "Database password"
3. Click "Reset database password" if you don't have it
4. Copy the password (you won't see it again!)

### Option 2: From Project Settings
1. Go to: https://supabase.com/dashboard/project/rcypkqctgonotawnajqb/settings/api
2. Look for "Database password" section
3. Use the password you set during project creation

---

## 💻 Connection Methods

### 1. Using Supabase Client (Recommended)
**Already configured in your project!**

```typescript
// src/integrations/supabase/client.ts
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://rcypkqctgonotawnajqb.supabase.co',
  'your-anon-key'
)

// Use it anywhere in your app
const { data, error } = await supabase
  .from('listings')
  .select('*')
```

**Advantages:**
- ✅ Built-in RLS (Row Level Security)
- ✅ Automatic authentication
- ✅ Real-time subscriptions
- ✅ TypeScript support
- ✅ Already integrated in your app

---

### 2. Direct PostgreSQL Connection

#### A. Using `psql` CLI
```bash
# Standard connection
psql "postgresql://postgres:[YOUR-PASSWORD]@db.rcypkqctgonotawnajqb.supabase.co:5432/postgres"

# With SSL (recommended)
psql "postgresql://postgres:[YOUR-PASSWORD]@db.rcypkqctgonotawnajqb.supabase.co:5432/postgres?sslmode=require"
```

#### B. Using Environment Variable
```bash
# Add to .env.local (DO NOT COMMIT!)
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.rcypkqctgonotawnajqb.supabase.co:5432/postgres"

# Connect
psql $DATABASE_URL
```

---

### 3. Using Database GUI Tools

#### TablePlus
1. New Connection → PostgreSQL
2. Fill in:
   - **Name:** MyRideNepal
   - **Host:** `db.rcypkqctgonotawnajqb.supabase.co`
   - **Port:** `5432`
   - **User:** `postgres`
   - **Password:** [Your password]
   - **Database:** `postgres`
   - **SSL Mode:** Require

#### DBeaver
1. New Database Connection → PostgreSQL
2. Connection settings:
   - **Host:** `db.rcypkqctgonotawnajqb.supabase.co`
   - **Port:** `5432`
   - **Database:** `postgres`
   - **Username:** `postgres`
   - **Password:** [Your password]
3. SSL tab → Enable SSL → Require

#### pgAdmin
1. Add New Server
2. General tab:
   - **Name:** MyRideNepal Supabase
3. Connection tab:
   - **Host:** `db.rcypkqctgonotawnajqb.supabase.co`
   - **Port:** `5432`
   - **Database:** `postgres`
   - **Username:** `postgres`
   - **Password:** [Your password]
4. SSL tab → SSL mode → Require

---

### 4. Using Supabase CLI

**Already set up!** You linked this earlier:

```bash
# List all projects
supabase projects list

# Connect to database
supabase db remote --project-ref rcypkqctgonotawnajqb

# Run SQL commands
supabase db remote --project-ref rcypkqctgonotawnajqb \
  -c "SELECT * FROM listings LIMIT 5;"

# Dump database
supabase db dump --project-ref rcypkqctgonotawnajqb > backup.sql

# Run migrations
supabase db push
```

---

## 🔒 Connection Pooling

### Session Pooler (Recommended for Most Use Cases)
```
postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:5432/postgres
```

**Use when:**
- Serverless functions (short-lived connections)
- Multiple concurrent connections
- Connection timeouts

### Transaction Pooler (For Heavy Transactions)
```
postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres
```

**Use when:**
- Long-running transactions
- Bulk operations
- Database migrations

### Direct Connection (Default)
```
postgresql://postgres:[YOUR-PASSWORD]@db.rcypkqctgonotawnajqb.supabase.co:5432/postgres
```

**Use when:**
- Development/testing
- Admin operations
- Low connection count

---

## 🌐 IPv4 Compatibility

### Issue
Your database connection shows: **"Not IPv4 compatible"**

### Solutions

#### Option 1: Use Session Pooler (Free)
```bash
# Instead of direct connection, use pooler:
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-us-west-1.pooler.supabase.com:5432/postgres
```

#### Option 2: Purchase IPv4 Add-on
- Visit: https://supabase.com/dashboard/project/rcypkqctgonotawnajqb/settings/addons
- Add IPv4 support ($4/month)
- Get dedicated IPv4 address

#### Option 3: Use IPv6 Network
- Most cloud providers support IPv6
- Vercel, Cloudflare Workers, etc. work fine
- Your production deployment should be unaffected

---

## 🔐 Security Best Practices

### 1. Environment Variables
**Never commit passwords!**

```bash
# .env.local (already in .gitignore)
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.rcypkqctgonotawnajqb.supabase.co:5432/postgres"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

### 2. Use Appropriate Keys
```typescript
// Frontend (public)
const SUPABASE_URL = 'https://rcypkqctgonotawnajqb.supabase.co'
const SUPABASE_ANON_KEY = 'your-anon-key' // Safe for client-side

// Backend only (private)
const SUPABASE_SERVICE_ROLE_KEY = 'your-service-key' // NEVER expose to client
```

### 3. SSL/TLS Always Enabled
```bash
# Always include SSL mode
postgresql://...?sslmode=require
```

### 4. Row Level Security (RLS)
Already enabled on all your tables! ✅

```sql
-- Example: Users can only see their own data
CREATE POLICY "Users view own listings"
  ON listings FOR SELECT
  USING (auth.uid() = user_id);
```

---

## 🛠️ Common Operations

### Check Connection
```bash
# Test connection
psql "postgresql://postgres:[PASSWORD]@db.rcypkqctgonotawnajqb.supabase.co:5432/postgres" \
  -c "SELECT version();"
```

### List Tables
```sql
-- All tables in public schema
SELECT tablename FROM pg_tables WHERE schemaname = 'public';
```

### Check Database Size
```sql
SELECT 
  pg_size_pretty(pg_database_size('postgres')) as size;
```

### View Active Connections
```sql
SELECT 
  count(*) as active_connections 
FROM pg_stat_activity 
WHERE datname = 'postgres';
```

### List RLS Policies
```sql
SELECT 
  schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';
```

---

## 📊 Connection Limits

### Free Tier
- **Max connections:** 60
- **Pooler connections:** Unlimited (with session pooler)
- **Storage:** 500 MB

### Pro Tier
- **Max connections:** Configurable
- **Dedicated compute:** Yes
- **Storage:** 8 GB included

### Monitor Usage
```sql
-- Current connection count
SELECT count(*) FROM pg_stat_activity;

-- Max connections allowed
SHOW max_connections;
```

---

## 🔧 Troubleshooting

### "Connection Refused"
**Solutions:**
1. Check if password is correct
2. Verify project is not paused
3. Use session pooler instead
4. Check firewall/network settings

### "Too Many Connections"
**Solutions:**
1. Use connection pooler
2. Close unused connections
3. Implement connection pooling in your app
4. Upgrade to Pro tier

### "SSL Required"
**Solution:**
```bash
# Add SSL mode to connection string
postgresql://...?sslmode=require
```

### "Permission Denied"
**Solutions:**
1. Check you're using correct user (postgres)
2. Verify RLS policies allow the operation
3. Use service role key for admin operations

---

## 🚀 Quick Start Examples

### Node.js/TypeScript
```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://rcypkqctgonotawnajqb.supabase.co',
  process.env.SUPABASE_ANON_KEY!
)

// Query
const { data, error } = await supabase
  .from('listings')
  .select('*')
  .eq('status', 'active')
```

### Python
```python
from supabase import create_client

supabase = create_client(
    "https://rcypkqctgonotawnajqb.supabase.co",
    "your-anon-key"
)

# Query
data = supabase.table('listings').select('*').eq('status', 'active').execute()
```

### Direct SQL (psql)
```bash
psql "postgresql://postgres:[PASSWORD]@db.rcypkqctgonotawnajqb.supabase.co:5432/postgres" <<EOF
SELECT title, price, status 
FROM listings 
WHERE status = 'active' 
LIMIT 10;
EOF
```

---

## 📚 Additional Resources

### Supabase Dashboard Links
- **Database:** https://supabase.com/dashboard/project/rcypkqctgonotawnajqb/editor
- **Settings:** https://supabase.com/dashboard/project/rcypkqctgonotawnajqb/settings/database
- **API Keys:** https://supabase.com/dashboard/project/rcypkqctgonotawnajqb/settings/api
- **Pooler:** https://supabase.com/dashboard/project/rcypkqctgonotawnajqb/settings/database#pooler

### Documentation
- **Supabase Docs:** https://supabase.com/docs/guides/database
- **PostgreSQL Docs:** https://www.postgresql.org/docs/
- **Connection Pooling:** https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler

---

## ✅ Agent Skills Already Installed!

Good news - the Supabase Agent Skills were installed in the previous step! ✅

**What you have:**
- Supabase expertise in GitHub Copilot
- PostgreSQL best practices
- Query optimization suggestions
- Security recommendations

**No need to run again:**
```bash
# Already done! ✅
npx skills add supabase/agent-skills
```

---

## 🎯 Next Steps

1. **Get your database password** from Supabase dashboard
2. **Test connection** using psql or a GUI tool
3. **Use Supabase Client** for application queries (already configured!)
4. **Monitor connections** to avoid hitting limits

---

**Database Status:** 🟢 Ready  
**Connection:** ✅ Configured  
**Skills:** ✅ Installed  
**Ready to Query:** 🚀 Yes
