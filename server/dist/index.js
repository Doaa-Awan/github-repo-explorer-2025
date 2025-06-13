"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const supabase_js_1 = require("@supabase/supabase-js");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
dotenv_1.default.config();
const PORT = process.env.VITE_PORT; //port for backend
const app = (0, express_1.default)();
// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_KEY || '';
const supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
app.use((0, cookie_parser_1.default)()); //parse cookies
app.use(express_1.default.json()); //parse incoming JSON requests
app.use((0, cors_1.default)(
//requests accepted from React app
{
    origin: 'https://github-repo-explorer-2025-client.vercel.app/', //React app URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));
app.get('/', (_req, res) => {
    res.json({ message: 'Hello, TypeScript + Express!' });
    // res.send('Hello, TypeScript + Express!');
});
// Endpoint to fetch GitHub repositories for a given username
app.get('/api/github/:username/repos', async (req, res) => {
    const { username } = req.params;
    try {
        const response = await fetch(`https://api.github.com/users/${username}/repos`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        res.json(data);
    }
    catch (error) {
        console.error('Error fetching GitHub repos:', error);
        res.status(500).json({ error: 'Failed to fetch GitHub repos' });
    }
});
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    // console.log('Login attempt:', { email, password }); // Log the login attempt
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
        // res.status(200).json({ message: 'Login successful', data: data });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(400).json({ error: 'Login failed' });
        return;
    }
    // console.log('Supabase response:', { data, error }); // Log the Supabase response
});
app.get('/api/favorites', async (req, res) => {
    //console.log('Fetching favorites...'); // Log the request
    // const { user_id } = req.params;
    const supabaseToken = req.cookies.supabase_token; // Get the Supabase token from cookies
    // console.log(await supabase.auth.getUser(supabaseToken)); // Ensure the user is authenticated
    const { data: { user }, } = await supabase.auth.getUser(supabaseToken);
    //console.log('Authenticated user:', user); // Log the authenticated user
    if (!user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }
    //console.log('Supabase token:', supabaseToken);
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
app.post('/api/logout', (req, res) => {
    res.clearCookie('supabase_token', {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
    });
    res.status(200).json({ message: 'Logged out' });
});
// POST: ADD A FAVOURITE REPOSITORY
app.post('/api/favorites', async (req, res) => {
    // Get the Supabase token from cookies
    const supabaseToken = req.cookies.supabase_token;
    if (!supabaseToken) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
    }
    // Get the user from the token
    const { data: { user }, error: userError, } = await supabase.auth.getUser(supabaseToken);
    if (userError || !user) {
        res.status(401).json({ error: 'Invalid or expired token' });
        return;
    }
    const { repo_id, repo_name, repo_url, repo_description, repo_stars, repo_language, created_at } = req.body;
    if (!repo_id || !repo_name || !repo_url) {
        res.status(400).json({ error: 'Missing repository data' });
        return;
    }
    // Insert the favourite repo for the authenticated user
    const { data, error } = await supabase
        .from('favourite_repositories') // use your actual table name
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
//POST: DELETE A FAVOURITE REPOSITORY
app.delete('/api/favorites', async (req, res) => {
    const supabaseToken = req.cookies.supabase_token;
    if (!supabaseToken) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
    }
    const { data: { user }, error: userError, } = await supabase.auth.getUser(supabaseToken);
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
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
