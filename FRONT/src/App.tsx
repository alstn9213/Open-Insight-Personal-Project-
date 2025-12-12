import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';

import Home from './pages/Home';
import Analysis from './pages/Analysis';
import Ranking from './pages/Ranking';
import Footer from './components/layout/Footer';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/analysis" element={<Analysis />} />
            <Route path="/ranking" element={<Ranking />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;