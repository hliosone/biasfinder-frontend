// App.tsx
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./Home";           
import UserProfile from "./UserProfile"; 
import AdminPage from "./AdminPage"; 
import ProposePhotocardPage from "./ProposePhotocardPage";

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
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/propose" element={<ProposePhotocardPage />} />
        </Routes>
      </div>
    </Router>
  );
}
