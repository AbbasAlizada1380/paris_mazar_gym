// athleteSearchBar.jsx
import { useState, useRef } from "react";
import { FaSearch, FaTimes } from "react-icons/fa";

const SearchBar = ({
  onSearch,           // called with the search term
  placeholder = "Search...",
  debounceDelay = 500,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const debounceTimerRef = useRef(null);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    // Debounce the search
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      onSearch(value.trim()); // pass only if needed, parent decides
    }, debounceDelay);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    onSearch(searchTerm.trim());
  };

  const handleClear = () => {
    setSearchTerm("");
    onSearch(""); // clear search
  };

  return (
    <div className="relative w-full max-w-md">
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="w-full pr-12 pl-10 py-3 text-right text-gray-800 bg-white border border-gray-300 rounded-lg focus:ring-3 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
          dir="rtl"
        />
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
          <FaSearch className="text-gray-400" />
        </div>
        {searchTerm && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2"
          >
            <FaTimes className="text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </form>
    </div>
  );
};

export default SearchBar;