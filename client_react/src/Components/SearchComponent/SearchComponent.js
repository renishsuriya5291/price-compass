import React, { useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import './SearchComponent.css';

const SearchComponent = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    if (!query) return;
    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const response = await fetch(`http://localhost:8000/search?q=${query}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setResults(data['data']);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="search-container">
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search for a product"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="search-input"
        />
        <button onClick={handleSearch} className="search-button">Search</button>
      </div>

      {loading ? (
        <div className="skeleton-container">
          <div className="result-card" style={{ height: '170px' }}>
            <div className="card-img">
              <Skeleton style={{ width: '100%', height: '100%', borderRadius: '10px 0 0 10px' }} />
            </div>
            <div className="card-body">
              <Skeleton height={20} width="70%" style={{ marginBottom: '10px', borderRadius: '5px' }} />
              <Skeleton height={20} width="50%" style={{ marginBottom: '10px', borderRadius: '5px' }} />
              <Skeleton height={35} width="30%" style={{ borderRadius: '5px' }} />
            </div>
          </div>
        </div>

      ) : (
        <div className="results-container">
          {error && <p className="error-text">{error}</p>}
          {results.length > 0 ? (
            <div className="results-list">
              {results.map((result, index) => (
                <div className="card result-card" key={index}>
                  <img
                    src={result.img}
                    className="card-img"
                    alt={result.title}
                  />
                  <div className="card-body">
                    <h5 className="card-title">{result.title}</h5>
                    <p className="card-price">₹{result.price}</p>
                    <a
                      href={result.link}
                      target='_blank'
                      rel="noopener noreferrer"
                      className="buy-button"
                    >
                      Buy Product
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-results">No results found.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchComponent;
