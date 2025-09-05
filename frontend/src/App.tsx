import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import TokenAnalysis from './pages/TokenAnalysis';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/token/:contractAddress" element={<TokenAnalysis />} />
      </Routes>
    </Router>
  );
}

export default App;