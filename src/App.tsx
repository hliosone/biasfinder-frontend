// App.tsx
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./Home";            // <-- Import du composant Home
import UserProfile from "./UserProfile"; // <-- Import du composant UserProfile
import AdminPage from "./AdminPage"; // <-- Import du composant Admin

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-100 p-8">
      <nav className="flex justify-center items-center mb-8">
  <h1 className="text-4xl font-bold text-purple-700">
    <Link to="/">BiasFinder - Photocard Trading</Link>
  </h1>
</nav>


        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/profile/:userId" element={<UserProfile />} />

          {/* NOUVELLE ROUTE ADMIN */}
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </div>
    </Router>
  );
}
