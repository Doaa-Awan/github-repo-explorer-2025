import { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './styles/SearchStyles.module.css';

function Favourites() {
  const url = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';
  const [data, setData] = useState<any[]>([]);

  const fetchData = async () => {
    try {
      const response = await axios.get(`${url}/api/favorites`, {
        withCredentials: true,
      });
      const data = response.data as any[];
      setData(data);
      console.log(data);
    } catch (err) {
      setData(['Error fetching data from server']);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRemoveFavourite = async (repo: any) => {
    try {
      await axios.delete(`${url}/api/favorites`, {
        data: { repo_id: repo.repo_id?.toString() || repo.id?.toString() },
        withCredentials: true,
      } as any);
      fetchData(); // Refresh the list after removal
    } catch (err) {
      console.error('Error removing favourite:', err);
      alert('Failed to remove from favourites.');
    }
  };

  // const handleRemoveFavourite = async (repo: any) => {
  //   try {
  //     await axios.delete('http://localhost:8080/api/favorites', {
  //       params: { repo_id: repo.repo_id?.toString() || repo.id?.toString() },
  //       withCredentials: true,
  //     });
  //     fetchData();
  //   } catch (err) {
  //     console.error('Error removing favourite:', err);
  //     alert('Failed to remove from favourites.');
  //   }
  // };

  return (
    <div>
      <ul>
        {data.map((repo) => (
          <div key={repo.id} className={styles.repoCard}>
            <div className={styles.titleContainer}>
              <a href={repo.repo_url} target='_blank' rel='noopener noreferrer'>
                {repo.repo_name}
              </a>
              <span
                style={{ marginLeft: 8, color: 'red', cursor: 'pointer' }}
                onClick={() => handleRemoveFavourite(repo)}
                title='Remove from favourites'>
                ❤️
              </span>
            </div>
            <div className={styles.description}>{repo.repo_description}</div>
            <div className={styles.footerContainer}>
              {repo.repo_language ? (
                <div className={styles.language}>{repo.repo_language}</div>
              ) : null}
              {repo.stargazers_count !== 0 ? (
                <div className={styles.stars}>{repo.repo_stars} ⭐</div>
              ) : null}
            </div>
            <div className={styles.date}>Created: {repo.created_at}</div>
          </div>
        ))}
      </ul>
    </div>
  );
}

export default Favourites;
