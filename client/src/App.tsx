import './App.css';
import Login from './Login';
import Search from './Search';
import Favourites from './Favourites';
import { Routes, Route, BrowserRouter } from 'react-router-dom'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Search />} />
        <Route path="/favourites" element={<Favourites />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

