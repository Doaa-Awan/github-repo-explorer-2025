import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import cookieParser from 'cookie-parser';

dotenv.config();
const PORT = process.env.VITE_PORT; //port for backend
const app = express();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

app.use(cookieParser()); //parse cookies
app.use(express.json()); //parse incoming JSON requests
app.use(
  cors({
    origin: 'https://github-repo-explorer-2025-client.vercel.app', //React app URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  })
);

app.get('/', (_req, res) => {
  res.json({ message: 'Hello, TypeScript + Express!' });
});

// GET: REPO BY USERNAME /api/github

app.get('/api/github/:username/repos', async (req, res) => {
  const { username } = req.params;
  try {
    const response = await fetch(
      `https://api.github.com/users/${username}/repos`
    );
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching GitHub repos:', error);
    res.status(500).json({ error: 'Failed to fetch GitHub repos' });
  }
});

// POST: LOGIN WITH EMAIL AND PASSWORD /api/login

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    let { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });
    if (data?.session?.access_token) {
      res
        .cookie('supabase_token', data.session.access_token, {
          //save token in cookie
          httpOnly: true,
          secure: true,
        })
        .status(200)
        .json({ message: 'Token set' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(400).json({ error: 'Login failed' });
    return;
  }
});

// POST: LOGOUT CURRENT SESSION /api/logout

app.post('/api/logout', (req, res) => {
  res.clearCookie('supabase_token', {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
  });
  res.status(200).json({ message: 'Logged out' });
});

// GET: FAVOURITE REPOS FOR USER LOGGED IN /api/favorites

app.get('/api/favorites', async (req, res) => {
  const supabaseToken = req.cookies.supabase_token; // Get the Supabase token from cookies
  const {
    data: { user },
  } = await supabase.auth.getUser(supabaseToken);

  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const { data, error } = await supabase
    .from('favourite_repositories')
    .select('*')
    .eq('user_id', user.id);

  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }
  res.json(data);
});

// POST: ADD A FAVOURITE REPOSITORY /api/favorites

app.post('/api/favorites', async (req, res) => {
  // Get the Supabase token from cookies
  const supabaseToken = req.cookies.supabase_token;
  if (!supabaseToken) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  // Get the user from the token
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser(supabaseToken);
  if (userError || !user) {
    res.status(401).json({ error: 'Invalid or expired token' });
    return;
  }

  const {
    repo_id,
    repo_name,
    repo_url,
    repo_description,
    repo_stars,
    repo_language,
    created_at,
  } = req.body;
  if (!repo_id || !repo_name || !repo_url) {
    res.status(400).json({ error: 'Missing repository data' });
    return;
  }

  // Insert the favourite repo for the authenticated user
  const { data, error } = await supabase
    .from('favourite_repositories') //table
    .insert([
      {
        user_id: user.id,
        repo_id,
        repo_name,
        repo_url,
        repo_description,
        repo_stars,
        repo_language,
        created_at,
      },
    ]);

  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }

  res.status(201).json(data);
});

//POST: DELETE A FAVOURITE REPOSITORY /api/favorites

app.delete('/api/favorites', async (req, res) => {
  const supabaseToken = req.cookies.supabase_token;
  if (!supabaseToken) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser(supabaseToken);
  if (userError || !user) {
    res.status(401).json({ error: 'Invalid or expired token' });
    return;
  }
  const { repo_id } = req.body;
  if (!repo_id) {
    res.status(400).json({ error: 'Missing repo_id' });
    return;
  }
  const { error } = await supabase
    .from('favourite_repositories')
    .delete()
    .eq('user_id', user.id)
    .eq('repo_id', repo_id);
  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }
  res.status(200).json({ message: 'Removed from favourites' });
});

app.listen(process.env.PORT || PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

export default app;
