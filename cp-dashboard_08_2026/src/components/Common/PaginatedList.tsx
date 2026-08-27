import React, { JSX, useState } from 'react';
import styles from './PaginatedList.module.css';

interface PaginatedListProps {
  items: { name: string | JSX.Element; icon: JSX.Element }[];
  itemsPerPage: number;
  pages?: number;
  content?: (
    items: { name: string | JSX.Element; icon: JSX.Element }[],
    currentPage: number
  ) => React.ReactNode;
}

const PaginatedList = ({ items, itemsPerPage, pages, content }: PaginatedListProps) => {
  const [currentPage, setCurrentPage] = useState(0);

  const totalPages = pages ?? Math.ceil(items.length / itemsPerPage);

  const handlePrev = () => {
    if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const startIndex = currentPage * itemsPerPage;
  const currentItems = items.slice(startIndex, startIndex + itemsPerPage);

  return (
    <>
      <div className={styles.paginationControls}>
        <button
          type="button"
          className={styles.arrowButton}
          onClick={handlePrev}
          disabled={currentPage === 0}
        >
          <img
            className={styles.arrowButtonIcon}
            src="/common/leftArrow.svg"
            alt="Previous Page"
            width="100%"
            height="100%"
          />
        </button>

        <div className={styles.paginationDots}>
          {Array.from({ length: totalPages }).map((_, index) => (
            <span
              key={index}
              className={`${styles.dot} ${index === currentPage ? styles.activeDot : ''}`}
            />
          ))}
        </div>
        <button
          type="button"
          className={styles.arrowButton}
          onClick={handleNext}
          disabled={currentPage === totalPages - 1}
        >
          <img
            className={styles.arrowButtonIcon}
            src="/common/rightArrow.svg"
            alt="Next Page"
            width="100%"
            height="100%"
          />
        </button>
      </div>
      {content ? content(currentItems, currentPage) : null}
    </>
  );
};

export default PaginatedList;
