import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';

import Home from './pages/Home';
import Analysis from './pages/Analysis';
import Ranking from './pages/Ranking';
import Franchise from './pages/Franchise';
import Guide from './pages/Guide';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <main className="container mx-auto py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/analysis" element={<Analysis />} />
            <Route path="/ranking" element={<Ranking />} />
            <Route path="/franchise" element={<Franchise />} />
            <Route path="/guide" element={<Guide />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;