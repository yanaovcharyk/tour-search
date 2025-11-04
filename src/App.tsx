import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { SearchPage } from "./pages/SearchPage/SearchPage";
import { TourPage } from "./pages/TourPage/TourPage";
import "./App.css";

function App() {
  return (
    <Router basename={import.meta.env.DEV ? "/" : "/tour-search/"}>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<SearchPage />} />
          <Route path="/tour/:hotelId/:priceId" element={<TourPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
