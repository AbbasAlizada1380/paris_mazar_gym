import React, { useState, useRef, useEffect } from "react";
import { FaSearch, FaTimes } from "react-icons/fa";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const FeesSearchBar = ({
  onSearchResults,
  onSearchError,
  placeholder = "Search fees by athlete name, father name, or NIC...",
  debounceDelay = 500,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const debounceTimerRef = useRef(null);

  // Function to search fees
  const searchFees = async (term) => {
    if (term.trim() === "") {
      onSearchResults([]);
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    setHasSearched(true);

    try {
      const response = await axios.get(`${BASE_URL}/fees/search`, {
        params: { query: term }
      });
      
      // Transform data to match existing fees structure
      const feesWithRemaining = response.data.data.map((fee) => ({
        ...fee,
        remained: fee.total - (fee.received || 0),
      }));
      
      onSearchResults(feesWithRemaining, response.data.meta);
      console.log("Search results:", response.data);
      
    } catch (error) {
      console.error("Search error:", error);
      onSearchError?.(error.response?.data?.message || "Error in search");
      onSearchResults([]); // Clear results on error
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced search function
  const debouncedSearch = (term) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      searchFees(term);
    }, debounceDelay);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    searchFees(searchTerm);
  };

  const handleClear = () => {
    setSearchTerm("");
    setHasSearched(false);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    onSearchResults([]);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  return (
    <div className="search-container relative w-full max-w-md">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative group">
          <input
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
            placeholder={placeholder}
            className="w-full pr-12 pl-10 py-3 text-gray-800 bg-white border border-gray-300 rounded-lg focus:ring-3 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all duration-300 shadow-sm hover:shadow-md focus:shadow-lg"
            aria-label="Search fees"
            disabled={isLoading}
          />
          
          {/* Search Icon */}
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-200 border-t-blue-600"></div>
            ) : (
              <FaSearch className="text-gray-400 h-4 w-4 group-focus-within:text-blue-500 transition-colors duration-200" />
            )}
          </div>
          
          {/* Clear Button */}
          {searchTerm && !isLoading && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Clear search"
            >
              <FaTimes className="text-gray-400 hover:text-gray-600 h-4 w-4 transition-colors" />
            </button>
          )}
          
          {/* Submit Button */}
          {searchTerm && (
            <button
              type="submit"
              className="absolute left-12 top-1/2 transform -translate-y-1/2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors duration-200 shadow"
              disabled={isLoading}
            >
              {isLoading ? "..." : "Search"}
            </button>
          )}
        </div>
        
        {/* Search tips */}
        {hasSearched && !searchTerm && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm text-gray-600 z-10">
            <p className="font-medium mb-1">Search fees by:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Athlete name</li>
              <li>Athlete's father name</li>
              <li>Athlete's NIC number</li>
            </ul>
          </div>
        )}
      </form>
    </div>
  );
};

export default FeesSearchBar;