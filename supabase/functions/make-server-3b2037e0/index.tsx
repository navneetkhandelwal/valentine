import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();
const DAY_PATHS = ['rose', 'propose', 'chocolate', 'teddy', 'promise', 'hug', 'kiss', 'valentine'];

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);
const adminPasscode = Deno.env.get('ADMIN_PASSCODE') || '';

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization", "X-User-Token"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Initialize storage bucket on startup
const BUCKET_NAME = 'make-3b2037e0-valentine-photos';

const isEmail = (value: string) => value.includes('@');
const isValidDay = (day: string) => DAY_PATHS.includes(day);

const getAuthenticatedIdentity = async (accessToken?: string) => {
  if (!accessToken) return { error: 'Unauthorized' as const };

  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  if (error || !user) return { error: 'Invalid session' as const };

  let username = await kv.get(`user_id_${user.id}`);
  if (!username && user.user_metadata?.username) username = user.user_metadata.username;
  if (!username) return { error: 'Invalid session' as const };

  const profile = await kv.get(`user_profile_${username}`) || {};
  return { user, username, profile };
};

// User JWT: allow X-User-Token (when gateway requires anon key in Authorization) or Authorization Bearer
const getAccessToken = (c: any) => c.req.header('X-User-Token')?.trim() || c.req.header('Authorization')?.split(' ')[1];

(async () => {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === BUCKET_NAME);
    if (!bucketExists) {
      await supabase.storage.createBucket(BUCKET_NAME, {
        public: false,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
      });
      console.log(`Created storage bucket: ${BUCKET_NAME}`);
    }
  } catch (error) {
    console.error(`Error initializing storage bucket: ${error}`);
  }
})();

// Health check endpoint
app.get("/make-server-3b2037e0/health", (c) => {
  return c.json({ status: "ok" });
});

// User Signup
app.post("/make-server-3b2037e0/signup", async (c) => {
  try {
    const { username, password, email, partnerName, role, adminPasscode: providedPasscode } = await c.req.json();
    
    if (!username || !password || !email) {
      return c.json({ error: 'Username, password, and email are required' }, 400);
    }

    const normalizedUsername = username.toLowerCase().trim().replace(/\s+/g, '');
    if (!normalizedUsername) {
      return c.json({ error: 'Username is invalid' }, 400);
    }

    // Normalize email to lowercase so login works regardless of case (Supabase Auth is case-sensitive)
    const normalizedEmail = email.trim().toLowerCase();

    const normalizedRole = role === 'admin' ? 'admin' : 'member';
    if (normalizedRole === 'admin' && (!adminPasscode || providedPasscode !== adminPasscode)) {
      return c.json({ error: 'Invalid admin passcode' }, 403);
    }
    
    // Check if username already exists
    const existingUser = await kv.get(`user_profile_${normalizedUsername}`);
    if (existingUser) {
      return c.json({ error: 'Username already taken' }, 409);
    }
    
    // Create Supabase auth user (use normalized email so signin with any case works)
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: normalizedEmail,
      password,
      user_metadata: { username: normalizedUsername, partner_name: partnerName || '', role: normalizedRole },
      email_confirm: true // Auto-confirm since we don't have email server configured
    });
    
    if (authError) {
      console.error(`Signup auth error: ${authError.message}`);
      return c.json({ error: authError.message }, 400);
    }
    
    // Store user profile in KV
    const userProfile = {
      username: normalizedUsername,
      email: normalizedEmail,
      userId: authData.user.id,
      role: normalizedRole,
      partnerName: partnerName || '',
      message: '',
      createdAt: new Date().toISOString()
    };
    
    await kv.set(`user_profile_${normalizedUsername}`, userProfile);
    await kv.set(`user_id_${authData.user.id}`, normalizedUsername);
    await kv.set(`email_${normalizedEmail}`, normalizedUsername); // so login by email uses exact auth email
    const usersRaw = await kv.get('all_usernames');
    const users = Array.isArray(usersRaw) ? usersRaw : [];
    if (!users.includes(normalizedUsername)) {
      users.push(normalizedUsername);
      await kv.set('all_usernames', users);
    }
    
    return c.json({ 
      success: true, 
      user: { username: normalizedUsername, email: normalizedEmail, partnerName: userProfile.partnerName, role: normalizedRole } 
    });
  } catch (error) {
    console.error(`Signup error: ${error}`);
    return c.json({ error: `Signup failed: ${error}` }, 500);
  }
});

// User Signin
app.post("/make-server-3b2037e0/signin", async (c) => {
  try {
    const { identifier, email, password } = await c.req.json();
    // Normalize same as signup: lowercase, trim, strip spaces (so "nav ika" matches "navika")
    const loginIdentifier = (identifier || email || '').toLowerCase().trim().replace(/\s+/g, '');
    
    if (!loginIdentifier || !password) {
      return c.json({ error: 'Username/email and password are required' }, 400);
    }

    let resolvedEmail = loginIdentifier;
    if (isEmail(loginIdentifier)) {
      // Login by email: use stored mapping so we use exact email as in auth (fixes case-sensitivity)
      const usernameByEmail = await kv.get(`email_${loginIdentifier}`);
      if (usernameByEmail) {
        const profile = await kv.get(`user_profile_${usernameByEmail}`);
        if (profile?.email) resolvedEmail = profile.email;
      }
    } else {
      // Login by username
      const profile = await kv.get(`user_profile_${loginIdentifier}`);
      if (!profile?.email) {
        return c.json({ error: 'Invalid credentials' }, 401);
      }
      resolvedEmail = profile.email;
    }
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!
    );
    
    let data: { user: any; session: any }; let error: any;
    ({ data, error } = await supabaseClient.auth.signInWithPassword({
      email: resolvedEmail,
      password
    }));
    
    // If failed and we logged in by email (lowercase), try finding profile with same email (any case) for existing users
    if (error?.message?.includes('Invalid login credentials') && isEmail(loginIdentifier)) {
      const usersRaw = await kv.get('all_usernames');
      const usernames = Array.isArray(usersRaw) ? usersRaw : [];
      for (const u of usernames) {
        const profile = await kv.get(`user_profile_${u}`);
        if (profile?.email && profile.email.toLowerCase() === loginIdentifier) {
          const retry = await supabaseClient.auth.signInWithPassword({ email: profile.email, password });
          if (!retry.error) {
            data = retry.data as any;
            error = null;
            break;
          }
        }
      }
    }
    
    if (error) {
      console.error(`Signin error: ${error.message}`);
      const msg = error.message?.includes('Invalid login credentials') ? 'Invalid email or password. Try password reset if you forgot it.' : (error.message || 'Invalid credentials');
      return c.json({ error: msg }, 401);
    }
    
    // Resolve username: KV first, then fallback to auth user_metadata (set at signup)
    let username = await kv.get(`user_id_${data.user.id}`);
    if (!username && data.user.user_metadata?.username) {
      username = data.user.user_metadata.username;
    }
    const userProfile = username ? await kv.get(`user_profile_${username}`) : null;
    
    return c.json({
      success: true, 
      accessToken: data.session.access_token,
      user: userProfile || { username: username ?? undefined, email: data.user.email }
    });
  } catch (error) {
    console.error(`Signin error: ${error}`);
    return c.json({ error: `Signin failed: ${error}` }, 500);
  }
});

// Get current user session
app.get("/make-server-3b2037e0/user", async (c) => {
  try {
    const accessToken = getAccessToken(c);
    const identity = await getAuthenticatedIdentity(accessToken);
    if ('error' in identity) return c.json({ error: identity.error }, 401);

    const { user, username } = identity;
    const userProfile = identity.profile;
    return c.json({ user: userProfile || { username, email: user.email } });
  } catch (error) {
    console.error(`Get user error: ${error}`);
    return c.json({ error: `Failed to get user: ${error}` }, 500);
  }
});

// Update user profile
app.put("/make-server-3b2037e0/profile", async (c) => {
  try {
    const accessToken = getAccessToken(c);
    const identity = await getAuthenticatedIdentity(accessToken);
    if ('error' in identity) return c.json({ error: identity.error }, 401);
    const { user, username } = identity;
    const currentProfile = identity.profile || {};
    
    const updates = await c.req.json();
    const updatedProfile = {
      ...currentProfile,
      ...updates,
      username, // Don't allow username changes
      userId: user.id, // Don't allow userId changes
      role: currentProfile.role || 'member' // Don't allow role changes from client
    };
    
    await kv.set(`user_profile_${username}`, updatedProfile);
    
    return c.json({ success: true, profile: updatedProfile });
  } catch (error) {
    console.error(`Update profile error: ${error}`);
    return c.json({ error: `Failed to update profile: ${error}` }, 500);
  }
});

// Upload photo for a specific day
app.post("/make-server-3b2037e0/upload/:day", async (c) => {
  try {
    const accessToken = getAccessToken(c);
    const identity = await getAuthenticatedIdentity(accessToken);
    if ('error' in identity) return c.json({ error: identity.error }, 401);
    const { username } = identity;
    const day = c.req.param('day');
    if (!isValidDay(day)) {
      return c.json({ error: 'Invalid day' }, 400);
    }
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    
    if (!file || !(file instanceof File)) {
      return c.json({ error: 'No file provided' }, 400);
    }
    
    // Ensure bucket exists (in case cold start missed it)
    try {
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some((b: { name: string }) => b.name === BUCKET_NAME);
      if (!bucketExists) {
        await supabase.storage.createBucket(BUCKET_NAME, {
          public: false,
          fileSizeLimit: 5242880,
          allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
        });
      }
    } catch (bucketErr) {
      console.error(`Bucket check/create error: ${bucketErr}`);
    }
    
    const fileBuffer = await file.arrayBuffer();
    const timestamp = Date.now();
    const sanitizedName = (file.name || 'image').replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath = `${username}/${day}/${timestamp}_${sanitizedName}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, fileBuffer, {
        contentType: file.type || 'image/jpeg',
        upsert: false
      });
    
    if (uploadError) {
      console.error(`Upload error for ${filePath}: ${uploadError.message}`);
      return c.json({ error: `Upload failed: ${uploadError.message}` }, 500);
    }
    
    // Signed URL: use 7 days (max often 1 year; shorter is safer)
    const signedExpiry = 60 * 60 * 24 * 7;
    const { data: signedUrlData, error: signError } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(filePath, signedExpiry);
    
    if (signError) console.error(`Signed URL error: ${signError.message}`);
    const signedUrl = signedUrlData?.signedUrl ?? null;
    
    const photosKey = `photos_${username}_${day}`;
    const currentPhotos = await kv.get(photosKey) || [];
    
    const photoMetadata = {
      id: timestamp,
      path: filePath,
      url: signedUrl,
      uploadedAt: new Date().toISOString()
    };
    
    currentPhotos.push(photoMetadata);
    await kv.set(photosKey, currentPhotos);
    
    return c.json({ success: true, photo: photoMetadata });
  } catch (error) {
    console.error(`Photo upload error: ${error}`);
    return c.json({ error: `Failed to upload photo: ${error instanceof Error ? error.message : String(error)}` }, 500);
  }
});

// Delete photo
app.delete("/make-server-3b2037e0/photo/:day/:photoId", async (c) => {
  try {
    const accessToken = getAccessToken(c);
    const identity = await getAuthenticatedIdentity(accessToken);
    if ('error' in identity) return c.json({ error: identity.error }, 401);
    const { username } = identity;
    const day = c.req.param('day');
    if (!isValidDay(day)) {
      return c.json({ error: 'Invalid day' }, 400);
    }
    const photoId = c.req.param('photoId');
    
    const photosKey = `photos_${username}_${day}`;
    const currentPhotos = await kv.get(photosKey) || [];
    
    const photo = currentPhotos.find((p: any) => p.id === parseInt(photoId));
    if (!photo) {
      return c.json({ error: 'Photo not found' }, 404);
    }
    
    // Delete from storage
    await supabase.storage.from(BUCKET_NAME).remove([photo.path]);
    
    // Remove from metadata
    const updatedPhotos = currentPhotos.filter((p: any) => p.id !== parseInt(photoId));
    await kv.set(photosKey, updatedPhotos);
    
    return c.json({ success: true });
  } catch (error) {
    console.error(`Photo delete error: ${error}`);
    return c.json({ error: `Failed to delete photo: ${error}` }, 500);
  }
});

// Get public profile by username (for shareable URLs)
app.get("/make-server-3b2037e0/public/:username", async (c) => {
  try {
    const username = c.req.param('username');
    
    const userProfile = await kv.get(`user_profile_${username}`);
    if (!userProfile) {
      return c.json({ error: 'User not found' }, 404);
    }
    
    // Get all photos for all days
    const photos: any = {};
    
    for (const day of DAY_PATHS) {
      const dayPhotos = await kv.get(`photos_${username}_${day}`) || [];
      // Refresh signed URLs if needed
      const photosWithUrls = await Promise.all(
        dayPhotos.map(async (photo: any) => {
          const { data: signedUrlData } = await supabase.storage
            .from(BUCKET_NAME)
            .createSignedUrl(photo.path, 31536000);
          return { ...photo, url: signedUrlData?.signedUrl || photo.url };
        })
      );
      photos[day] = photosWithUrls;
    }
    
    return c.json({ 
      profile: {
        username: userProfile.username,
        role: userProfile.role || 'member',
        partnerName: userProfile.partnerName,
        message: userProfile.message
      },
      photos 
    });
  } catch (error) {
    console.error(`Get public profile error: ${error}`);
    return c.json({ error: `Failed to get profile: ${error}` }, 500);
  }
});

// Get day-specific content and messages
app.get("/make-server-3b2037e0/day-content/:username/:day", async (c) => {
  try {
    const username = c.req.param('username');
    const day = c.req.param('day');
    
    const dayContentKey = `day_content_${username}_${day}`;
    const dayContent = await kv.get(dayContentKey) || {};
    
    return c.json({ content: dayContent });
  } catch (error) {
    console.error(`Get day content error: ${error}`);
    return c.json({ error: `Failed to get day content: ${error}` }, 500);
  }
});

// Update day-specific content
app.put("/make-server-3b2037e0/day-content/:day", async (c) => {
  try {
    const accessToken = getAccessToken(c);
    const identity = await getAuthenticatedIdentity(accessToken);
    if ('error' in identity) return c.json({ error: identity.error }, 401);
    const { username } = identity;
    const day = c.req.param('day');
    if (!isValidDay(day)) {
      return c.json({ error: 'Invalid day' }, 400);
    }
    const updates = await c.req.json();
    
    const dayContentKey = `day_content_${username}_${day}`;
    const currentContent = await kv.get(dayContentKey) || {};
    
    const updatedContent = { ...currentContent, ...updates };
    await kv.set(dayContentKey, updatedContent);
    
    return c.json({ success: true, content: updatedContent });
  } catch (error) {
    console.error(`Update day content error: ${error}`);
    return c.json({ error: `Failed to update day content: ${error}` }, 500);
  }
});

app.get("/make-server-3b2037e0/featured/:day", async (c) => {
  try {
    const day = c.req.param('day');
    if (!isValidDay(day)) {
      return c.json({ error: 'Invalid day' }, 400);
    }

    const featuredUsername = await kv.get('featured_username');
    if (!featuredUsername) {
      return c.json({ error: 'No featured creator configured' }, 404);
    }

    const userProfile = await kv.get(`user_profile_${featuredUsername}`);
    if (!userProfile) {
      return c.json({ error: 'Featured creator not found' }, 404);
    }

    const dayPhotos = await kv.get(`photos_${featuredUsername}_${day}`) || [];
    const photos = await Promise.all(
      dayPhotos.map(async (photo: any) => {
        const { data: signedUrlData } = await supabase.storage
          .from(BUCKET_NAME)
          .createSignedUrl(photo.path, 31536000);
        return { ...photo, url: signedUrlData?.signedUrl || photo.url };
      })
    );

    const dayContent = await kv.get(`day_content_${featuredUsername}_${day}`) || {};

    return c.json({
      username: featuredUsername,
      profile: {
        username: userProfile.username,
        role: userProfile.role || 'member',
        partnerName: userProfile.partnerName,
        message: userProfile.message
      },
      dayContent,
      photos
    });
  } catch (error) {
    console.error(`Get featured page error: ${error}`);
    return c.json({ error: `Failed to get featured page: ${error}` }, 500);
  }
});

app.get("/make-server-3b2037e0/admin/settings", async (c) => {
  try {
    const accessToken = getAccessToken(c);
    const identity = await getAuthenticatedIdentity(accessToken);
    if ('error' in identity) return c.json({ error: identity.error }, 401);
    if ((identity.profile?.role || 'member') !== 'admin') {
      return c.json({ error: 'Forbidden' }, 403);
    }

    const usernamesRaw = await kv.get('all_usernames');
    const usernames = Array.isArray(usernamesRaw) ? usernamesRaw : [];
    const featuredUsername = await kv.get('featured_username') || '';
    const users = await Promise.all(
      usernames.map(async (username: string) => {
        const profile = await kv.get(`user_profile_${username}`);
        if (!profile) return null;
        return {
          username: profile.username,
          role: profile.role || 'member',
          partnerName: profile.partnerName || '',
          createdAt: profile.createdAt || ''
        };
      })
    );

    return c.json({
      featuredUsername,
      users: users.filter(Boolean)
    });
  } catch (error) {
    console.error(`Admin settings error: ${error}`);
    return c.json({ error: `Failed to load admin settings: ${error}` }, 500);
  }
});

app.put("/make-server-3b2037e0/admin/featured", async (c) => {
  try {
    const accessToken = getAccessToken(c);
    const identity = await getAuthenticatedIdentity(accessToken);
    if ('error' in identity) return c.json({ error: identity.error }, 401);
    if ((identity.profile?.role || 'member') !== 'admin') {
      return c.json({ error: 'Forbidden' }, 403);
    }

    const { username } = await c.req.json();
    const normalizedUsername = (username || '').toLowerCase().trim();
    if (!normalizedUsername) {
      return c.json({ error: 'Username is required' }, 400);
    }

    const profile = await kv.get(`user_profile_${normalizedUsername}`);
    if (!profile) {
      return c.json({ error: 'User not found' }, 404);
    }

    await kv.set('featured_username', normalizedUsername);
    return c.json({ success: true, featuredUsername: normalizedUsername });
  } catch (error) {
    console.error(`Update featured user error: ${error}`);
    return c.json({ error: `Failed to update featured creator: ${error}` }, 500);
  }
});

Deno.serve(app.fetch);
