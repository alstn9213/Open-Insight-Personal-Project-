import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from '../shared/ui/Header';
import { Analysis } from '../pages/Analysis';
import { Footer } from '../shared/ui/Footer';


function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Analysis />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;