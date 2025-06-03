import { useEffect, useState } from 'react';
import axios from 'axios';

function Favourites() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/api/favorites`
        , {withCredentials: true}) // Include credentials for CORS});
        const data = response.data as any[];
        setData(data);
        console.log(data);
      } catch (err) {
        setData(['Error fetching data from server']);
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      <ul>
        {data.map((repo) => (
          <li key={repo.id}>
            <a href={repo.url} target='_blank' rel='noopener noreferrer'>
              {repo.name}
            </a>
            {repo.description && <span>: {repo.description}</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Favourites;
