import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Settings from './pages/Settings';
import Layout from './components/Layout';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Layout>
  );
}

export default App;
