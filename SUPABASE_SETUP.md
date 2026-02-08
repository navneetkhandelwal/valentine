# Supabase setup – do these steps once

## Part 1: Get an access token (for deploy)

1. Go to **https://supabase.com/dashboard/account/tokens**
2. Sign in if needed.
3. Click **Generate new token**.
4. Name it (e.g. `valentine-deploy`), copy the token, and store it somewhere safe (you’ll use it in Part 2).

---

## Part 2: Deploy the Edge Function (terminal)

In your project folder, run these in order. Use your token from Part 1.

```bash
cd "/Users/niharika/Downloads/Create Valentine Micro-Website"

# Use your token (replace YOUR_TOKEN with the token you copied)
export SUPABASE_ACCESS_TOKEN="YOUR_TOKEN"

# Link project and deploy the function
npx supabase link --project-ref vdqyhcxikdipwdjpodcn
npx supabase functions deploy make-server-3b2037e0 --project-ref vdqyhcxikdipwdjpodcn
```

When linking, you can skip the database password (press Enter) unless you use DB commands.

---

## Part 3: Supabase Dashboard (portal)

### 3.1 Set Edge Function secret

1. Go to **https://supabase.com/dashboard/project/vdqyhcxikdipwdjpodcn**
2. Left sidebar → **Edge Functions**
3. Click the function **make-server-3b2037e0**
4. Open **Secrets** (or **Settings** → Environment variables)
5. Add:
   - **Name:** `ADMIN_PASSCODE`
   - **Value:** a strong passcode you choose (only for admin signup; save it somewhere safe)
6. Save.  
   (If `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` are missing, add them from **Project Settings** → **API**.)

### 3.2 (Optional) Create storage bucket if uploads fail

1. Left sidebar → **Storage**
2. If you don’t see **make-3b2037e0-valentine-photos**:
   - **New bucket**
   - Name: `make-3b2037e0-valentine-photos`
   - **Private** → Create

### 3.3 (Optional) Fix existing user emails (login with any case)

1. Left sidebar → **SQL Editor**
2. **New query**
3. Paste and run:

```sql
UPDATE auth.users
SET email = lower(email)
WHERE email != lower(email);
```

---

## Done

- Function is deployed (Part 2).
- Admin passcode and env are set (Part 3.1).
- Optional: bucket created (Part 3.2), emails normalized (Part 3.3).

Then run the app (`npm run dev`), sign up or log in, and try uploading a photo for Rose day.
