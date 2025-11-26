// src/App.js
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.css';

// Components
import Navigation from "./components/Navigation";
import Footer from './components/Footer';

// Pages
import Home from "./pages/Home";
import Events from "./pages/Events";
import Users from "./pages/Users";
import User from "./pages/User"; // New Import
import Event from "./pages/Event";

function App() {
  return (
    <div className="App">
      <Router>
        <Navigation />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<Events />} />
          <Route path="/event/:id" element={<Event />} />
          <Route path="/users" element={<Users />} />
          {/* New Route for Single User */}
          <Route path="/user/:id" element={<User />} /> 
        </Routes>
        <Footer />
      </Router>
    </div>
  );
}

export default App;