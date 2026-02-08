#!/usr/bin/env bash
# Deploy Edge Function to Supabase.
# First: export SUPABASE_ACCESS_TOKEN="your-token" (get from https://supabase.com/dashboard/account/tokens)
set -e
cd "$(dirname "$0")/../.."
if [ -z "$SUPABASE_ACCESS_TOKEN" ]; then
  echo "Error: set SUPABASE_ACCESS_TOKEN first. Get a token from https://supabase.com/dashboard/account/tokens"
  exit 1
fi
echo "Linking project..."
npx supabase link --project-ref vdqyhcxikdipwdjpodcn
echo "Deploying Edge Function 'make-server-3b2037e0'..."
npx supabase functions deploy make-server-3b2037e0 --project-ref vdqyhcxikdipwdjpodcn
echo "Done."
