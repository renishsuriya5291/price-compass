import React, { useState, useEffect } from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import './ReviewComponent.css';

const ReviewComponent = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentMessage, setCurrentMessage] = useState('');
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    let timer;
    if (loading) {
      const messages = [
        'Fetching product details from Amazon...',
        'Searching for reviews and ratings...',
        'Scraping the Top reviews from India reviews...',
        'Extracting review details: Rating, Review Comment, and User Profile...',
        'Processing data to make it readable...',
        'Validating extracted data for accuracy...',
        'Sending data back in JSON format...',
        'Preparing to display reviews...',
        'Displaying reviews...'
      ];


      let messageIndex = 0;
      setCurrentMessage(messages[messageIndex]);
      setShowMessage(true);

      timer = setInterval(() => {
        setShowMessage(false);
        setTimeout(() => {
          messageIndex++;
          if (messageIndex < messages.length) {
            setCurrentMessage(messages[messageIndex]);
            setShowMessage(true);
          } else {
            clearInterval(timer);
          }
        }, 500);
      }, 2000);
    } else {
      setCurrentMessage('');
      setShowMessage(false);
    }

    return () => clearInterval(timer);
  }, [loading]);

  const handleSearch = async () => {
    if (!query) return;
    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND}/reviews?q=${query}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setResults(data['reviews']);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="search-container">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="input-group mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Enter Amazon product link..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button onClick={handleSearch} className="search-button">
              Search
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="row">
          <div className="col-12">
            <div className="status-container">
              {showMessage && (
                <p className="status-text slide-in">{currentMessage}</p>
              )}
            </div>
            <Skeleton height={50} count={3} />
          </div>
        </div>
      ) : (
        <div className="row justify-content-center">
          <div className="col-md-8">
            {error && <p className="text-danger">{error}</p>}
            {results.length > 0 ? (
              <div className="results-list" style={{ overflowY: 'auto', scrollBehavior: 'smooth' }}>
                {results.map((review, index) => (
                  <div className="card mb-3 shadow-sm" key={index}>
                    <div className="card-body">
                      <h5 className="card-title">{review.reviewer_name}</h5>
                      <div className="card-subtitle mb-2 text-muted">Rating: {review.rating} / 5</div>
                      <p className="card-text">{review.review_text}</p>
                      <a
                        href={review.profile_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline-primary"
                      >
                        View Profile
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center">No results found.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewComponent;
