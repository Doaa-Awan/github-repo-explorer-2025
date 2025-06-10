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
    console.log(repos);
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
          <button onClick={handleLogout} className={styles.btnLogout}>
            Logout
          </button>
        ) : (
          <button
            onClick={() => navigate('/login')}
            className={styles.btnLogin}>
            Login
          </button>
        )}
      </div>
      <h1>GitHub Repository Explorer</h1>
      <form onSubmit={handleSubmit} className='search-form'>
        <label htmlFor='search' className={styles.lblSearch}>
          Enter a github username
        </label>
        <div className={styles.searchContainer}>
          <input
            type='text'
            id='search'
            value={searchUsername}
            onChange={(e) => setSearchUsername(e.target.value)}
            placeholder='e.g. Doaa-Awan'
            className={styles.inputSearch}
          />
          <button
            type='submit'
            className={styles.btnSearch}
            disabled={loading || !searchUsername}>
            Search
          </button>
        </div>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {repos.length > 0 ? (
        <div className={styles.repoContainer}>
          {repos.map((repo) => (
            <div key={repo.id} className={styles.repoCard}>
              <div className={styles.titleContainer}>
                <a
                  href={repo.html_url}
                  target='_blank'
                  rel='noopener noreferrer'>
                  {repo.name}
                </a>
                <div>❤️</div>
              </div>
              <div className={styles.description}>{repo.description}</div>
              <div className={styles.footerContainer}>
                {repo.language ? (
                  <div className={styles.language}>{repo.language}</div>
                ) : null}
                {repo.stargazers_count !== 0 ? (
                  <div className={styles.stars}>{repo.stargazers_count} ⭐</div>
                ) : null}
              </div>
              <div className={styles.date}>Created: {repo.created_at}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.repoContainer}>
          <p>Search for a user to view all their repositories</p>
        </div>
      )}
      {loggedIn ? (
        <div className={styles.btnFavouritesContainer}>
          <button
            onClick={() => navigate('/favourites')}
            className={styles.btnFavourites}>
            Favourites →
          </button>
        </div>
      ) : null}
    </div>
  );
}
