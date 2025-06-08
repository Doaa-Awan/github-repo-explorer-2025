import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from './styles/SearchStyles.module.css';

export default function Search() {
  const navigate = useNavigate();
  const [searchUsername, setSearchUsername] = useState('');
  const [repos, setRepos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);

  // Check auth status by calling the backend
  useEffect(() => {
    axios
      .get('http://localhost:8080/api/favorites', { withCredentials: true })
      .then(() => setLoggedIn(true))
      .catch((err) => {
        if (err.response && err.response.status === 401) {
          setLoggedIn(false);
        }
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

  const handleLogout = async () => {
    await axios.post(
      'http://localhost:8080/api/logout',
      {},
      { withCredentials: true }
    );
    confirm('Are you sure you want to logout?');
    if (!confirm) return;
    setLoggedIn(false);
    // navigate('/login');
  };

  return (
    <div className={styles.search}>
      <div className={styles.btnLoginContainer}>
        {loggedIn ? (
          <button onClick={handleLogout}>Logout</button>
        ) : (
          <button onClick={() => navigate('/login')}>Login</button>
        )}
      </div>
      <form onSubmit={handleSubmit} className='search-form'>
        <div>
          <label htmlFor='search'>Search GitHub Repositories</label>
          <input
            type='text'
            id='search'
            value={searchUsername}
            onChange={(e) => setSearchUsername(e.target.value)}
            placeholder='GitHub username'
          />
        </div>
        <button type='submit' disabled={loading || !searchUsername}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div>
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
      </div>
      {loggedIn ? (
        <button onClick={() => navigate('/favourites')}>View Favourites</button>
      ) : null}
    </div>
  );
}
