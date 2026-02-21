# HelvornSMP Supabase Integration Setup Guide

## Prerequisites
- Netlify account with site deployed (helvornsmp.netlify.app)
- Supabase account and project created
- Supabase extension installed on Netlify

## Step 1: Set Up Supabase Database

1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Copy the contents of `supabase-schema.sql`
4. Paste into the SQL Editor and click "Run"
5. This will create all necessary tables and policies

## Step 2: Get Supabase Credentials

1. In Supabase, go to Project Settings > API
2. Copy these values:
   - Project URL (e.g., https://xxxxx.supabase.co)
   - anon/public key (starts with eyJ...)

## Step 3: Configure Netlify Environment Variables

Since you have the Supabase extension installed on Netlify, it should automatically set:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

Verify this in Netlify:
1. Go to Site Settings > Environment Variables
2. Check if SUPABASE_URL and SUPABASE_ANON_KEY exist
3. If not, add them manually with values from Step 2

## Step 4: Update HTML File

In `ultimate-helvorn.html`, replace the placeholder values:

```javascript
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
```

With your actual values from Step 2.

## Step 5: Deploy Edge Function (Optional - For Auto Updates)

The edge function automatically updates server status every 5 minutes.

1. Create this folder structure in your GitHub repo:
```
netlify/
  edge-functions/
    update-status.js
```

2. Copy `netlify/edge-functions/update-status.js` to this location

3. Create `netlify.toml` in your repo root:
```toml
[build]
  publish = "."

[[edge_functions]]
  function = "update-status"
  path = "/api/update-status"

[functions]
  external_node_modules = ["@supabase/supabase-js"]
```

4. Push to GitHub - Netlify will auto-deploy the edge function

## Step 6: Test Everything

1. Visit https://helvornsmp.netlify.app
2. Check if server status shows
3. Check if players list loads
4. Open browser console (F12) to check for errors

## Database Schema Overview

### Tables Created:

**players**
- Stores player information
- Tracks first_seen and last_seen timestamps
- Auto-updates when players join

**server_status**
- Current server status
- Updated every 5 minutes (if using edge function)
- Stores player count, version, MOTD

**game_modes**
- Lists available game modes
- Can be updated to show/hide modes
- Pre-populated with Anarchy, Survival, Creative, Lifesteal

**announcements** (for future use)
- Server announcements
- Can set expiry dates
- Toggle active/inactive

**events** (for future use)
- Community events
- Schedule upcoming events

## Manual Status Update (Without Edge Function)

If you don't want to use the edge function, the site will fallback to direct API calls to mcsrvstat.us. This works but doesn't store historical data.

## Troubleshooting

### "Failed to fetch" errors
- Check if SUPABASE_URL and SUPABASE_ANON_KEY are correct
- Verify RLS policies are enabled (they should be from the schema)

### Players not showing
- Check if server is actually online
- Look at browser console for errors
- Verify players table has data: Go to Supabase > Table Editor > players

### Status always shows offline
- Check if server_status table has recent data
- If using edge function, check Netlify Functions logs
- Fallback to direct API calls should work

## Future Enhancements

You can now easily add:
- Player statistics and leaderboards
- Server analytics and graphs
- Announcement system
- Event calendar
- Admin dashboard to manage everything

## Security Notes

- RLS (Row Level Security) is enabled on all tables
- Public users can only READ data
- Write operations require service role key (keep this secret!)
- anon key is safe to expose in frontend code

## Need Help?

Check:
1. Browser console for JavaScript errors
2. Netlify function logs (if using edge function)
3. Supabase logs (Database > Logs)
