import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './styles/SearchStyles.module.css';

export default function Search() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchUsername, setSearchUsername] = useState('');
  const [repos, setRepos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [favouriteRepoIds, setFavouriteRepoIds] = useState<string[]>([]);

  const fetchData = async () => {
    try {
      axios
        .get('http://localhost:8080/api/favorites', { withCredentials: true })
        .then((res) => {
          setLoggedIn(true);
          const favourites = res.data as Array<{ repo_id: string }>;
          setFavouriteRepoIds(favourites.map((fav) => fav.repo_id.toString()));
        })
        .catch(() => {
          setLoggedIn(false);
          setFavouriteRepoIds([]);
        });
      // Re-fetch repos for last searched username
      const lastSearchUsername = localStorage.getItem('lastSearchUsername');
      if (lastSearchUsername) {
        setSearchUsername(lastSearchUsername);
        setLoading(true);
        axios
          .get(`http://localhost:8080/api/github/${lastSearchUsername}/repos`)
          .then((response) => {
            setRepos(response.data as any[]);
            setLoading(false);
          })
          .catch(() => {
            setRepos([]);
            setLoading(false);
          });
      }
    } catch (err) {
      alert(['Error fetching data from server']);
    }
  };

  // Check auth status and fetch favourites if logged in
  useEffect(() => {
    fetchData();
  }, [location]);

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
      // Save to localStorage
      localStorage.setItem('lastSearchUsername', searchUsername);
      localStorage.setItem('lastSearchRepos', JSON.stringify(response.data));
    } catch (err) {
      setError('Failed to fetch repositories');
    } finally {
      setLoading(false);
    }
  };

  const handleAddFavourite = async (repo: any) => {
    if (!loggedIn) {
      alert('You must be logged in to add to your favourites.');
      return;
    }
    try {
      await axios.post(
        'http://localhost:8080/api/favorites',
        {
          repo_id: repo.id,
          repo_name: repo.name,
          repo_url: repo.html_url,
          repo_description: repo.description,
          repo_language: repo.language,
          repo_stars: repo.stargazers_count,
          created_at: repo.created_at,
        },
        { withCredentials: true }
      );
      setFavouriteRepoIds((prev) => [...prev, repo.id.toString()]);
    } catch (err) {
      alert('Failed to add to favourites.');
    }
  };

  const handleRemoveFavourite = async (repo: any) => {
    try {
      await axios.delete('http://localhost:8080/api/favorites', {
        data: { repo_id: repo.repo_id?.toString() || repo.id?.toString() },
        withCredentials: true,
      } as any);
      fetchData();
    } catch (err) {
      alert('Failed to remove from favourites.');
    }
  };

  const handleLogout = async () => {
    await axios.post(
      'http://localhost:8080/api/logout',
      {},
      { withCredentials: true }
    );
    setLoggedIn(false);
    setFavouriteRepoIds([]);
    navigate('/login');
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
      {repos.length > 0 && (
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
                {loggedIn && favouriteRepoIds.includes(repo.id.toString()) ? (
                  <button
                    style={{
                      marginLeft: 8,
                      color: 'red',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                    onClick={() => handleRemoveFavourite(repo)}>
                    ❤️
                  </button>
                ) : (
                  <button
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      marginLeft: 8,
                      fontSize: '1.2em',
                    }}
                    onClick={() => handleAddFavourite(repo)}
                    aria-label='Add to favourites'>
                    ♡
                  </button>
                )}
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
