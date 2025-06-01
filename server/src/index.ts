import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();
const PORT = process.env.VITE_PORT; //port for backend
const app = express();
app.use(express.json()); //parse incoming JSON requests
app.use(cors( //requests accepted from React app
    {
        origin: 'http://localhost:5173', //React app URL
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true
    }
));

app.get('/', (_req, res) => {
  res.json({ message: 'Hello, TypeScript + Express!' });
  // res.send('Hello, TypeScript + Express!');
});

app.get('/api/github/:username/repos', async (req, res) => {
  const { username } = req.params;
  try {
    const response = await fetch(`https://api.github.com/users/${username}/repos`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching GitHub repos:', error);
    res.status(500).json({ error: 'Failed to fetch GitHub repos' });
  } 
}
);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});