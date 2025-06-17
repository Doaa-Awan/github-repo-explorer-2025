import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './styles/LoginStyles.module.css'; 
import axios from 'axios';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    axios
      .post('http://localhost:8080/api/login', {
        email: email,
        password: password,
      }, {withCredentials: true}) // Include credentials for CORS
      .then((response) => {
        if (response.status === 200) {
          console.log(response);
          navigate('/'); // Redirect to home page
        } else {
          alert('Invalid credentials');
          navigate('/login'); // Stay on login page
        }
      })
      .catch((error) => {
        console.log(error);
        alert('Error logging in');
      });
  };
  return (
    <div className={styles.login}>
      <div>
        <form onSubmit={handleLogin}>
          <div>
            <label htmlFor='email'>Email Address</label>
            <input
              type='text'
              id='email'
              name='email'
              className={styles.inputEmail}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor='password'>Password</label>
            <input
              type='password'
              id='password'
              name='password'
              className={styles.inputPassword}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className={styles.btnContainer}>
            <input type='submit' value='Login' className={styles.btnLogin} />
            <input 
                type="submit" 
                value="Register" 
                className={styles.btnRegister}
                // onClick = {addUser}
              />
          </div>
        </form>
      </div>
    </div>
  );
}
