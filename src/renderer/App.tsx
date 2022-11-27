import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Home';
import SettingPage from './SettingPage';

import './App.css';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/setting" element={<SettingPage />} />
      </Routes>
    </Router>
  );
}
