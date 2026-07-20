// src/components/searching/feeSearchBar.jsx
import { useState } from "react";
import { FaSearch, FaTimes } from "react-icons/fa";

const FeesSearchBar = ({ onSearch, placeholder = "جستجو..." }) => {
  const [query, setQuery] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const handleClear = () => {
    setQuery("");
    onSearch(""); // clear search → parent will reset to normal list
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="w-full pr-12 pl-10 py-3 text-right text-gray-800 bg-white border border-gray-300 rounded-lg focus:ring-3 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
        dir="rtl"
      />
      <button
        type="submit"
        className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-600 transition-colors"
        aria-label="جستجو"
      >
        <FaSearch />
      </button>
      {query && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="پاک کردن جستجو"
        >
          <FaTimes />
        </button>
      )}
    </form>
  );
};

export default FeesSearchBar;