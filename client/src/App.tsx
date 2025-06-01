import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [message, setMessage] = useState('');
  const [searchUsername, setSearchUsername] = useState('');
  const [repos, setRepos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    axios
      .get('http://localhost:8080/')
      .then((response: { data: any }) => {
        setMessage(response.data.message || 'No message received');
      })
      .catch(() => {
        setMessage('Error fetching data from server');
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setRepos([]);
    try {
      const response = await axios.get(
        `http://localhost:8080/api/github/${searchUsername}/repos`
      );
      setRepos(response.data as any[]);
    } catch (err) {
      setError('Failed to fetch repositories');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <p>{message}</p>
      <form onSubmit={handleSubmit}>
        <input
          type='text'
          value={searchUsername}
          onChange={(e) => setSearchUsername(e.target.value)}
          placeholder='GitHub username'
        />
        <button type='submit' disabled={loading || !searchUsername}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <ul>
        {repos.map((repo) => (
          <li key={repo.id}>
            <a href={repo.html_url} target='_blank' rel='noopener noreferrer'>
              {repo.name}
            </a>
            {repo.description && <span>: {repo.description}</span>}
          </li>
        ))}
      </ul>
    </>
  );
}

export default App;
