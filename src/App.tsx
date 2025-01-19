// App.tsx
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./Home";            // <-- Import du composant Home
import UserProfile from "./UserProfile"; // <-- Import du composant UserProfile

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-100 p-8">
        {/* Le "header" ou la "nav" de l'appli */}
        <nav className="flex justify-between items-center mb-8">
        </nav>

        {/* Toutes les routes */}
        <Routes>
          {/* Page d'accueil : / */}
          <Route path="/" element={<Home />} />

          {/* Page de profil utilisateur : /profile/:userId */}
          <Route path="/profile/:userId" element={<UserProfile />} />
        </Routes>
      </div>
    </Router>
  );
}
