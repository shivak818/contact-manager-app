import React from 'react';
import '../styles/pagination.css';

const Pagination = ({ page, setPage, totalPages, isLoading = false }) => {
  const maxPagesToShow = 5; // Limit visible page numbers

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages && !isLoading) {
      setPage(newPage);
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const halfRange = Math.floor(maxPagesToShow / 2);
    let start = Math.max(1, page - halfRange);
    let end = Math.min(totalPages, start + maxPagesToShow - 1);

    if (end - start + 1 < maxPagesToShow) {
      start = Math.max(1, end - maxPagesToShow + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="pagination">
      <button
        onClick={() => handlePageChange(1)}
        disabled={page === 1 || isLoading}
        aria-label="First page"
      >
        «
      </button>
      <button
        onClick={() => handlePageChange(page - 1)}
        disabled={page === 1 || isLoading}
        aria-label="Previous page"
      >
        ◄
      </button>

      {pageNumbers[0] > 1 && <span className="ellipsis">...</span>}
      {pageNumbers.map((num) => (
        <button
          key={num}
          className={page === num ? 'active' : ''}
          onClick={() => handlePageChange(num)}
          disabled={isLoading || page === num}
          aria-label={`Page ${num}`}
        >
          {num}
        </button>
      ))}
      {pageNumbers[pageNumbers.length - 1] < totalPages && <span className="ellipsis">...</span>}

      <button
        onClick={() => handlePageChange(page + 1)}
        disabled={page === totalPages || isLoading}
        aria-label="Next page"
      >
        ►
      </button>
      <button
        onClick={() => handlePageChange(totalPages)}
        disabled={page === totalPages || isLoading}
        aria-label="Last page"
      >
        »
      </button>
    </div>
  );
};

export default Pagination;