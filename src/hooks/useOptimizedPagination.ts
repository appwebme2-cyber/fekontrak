import { useState, useCallback } from 'react';

interface UseOptimizedPaginationProps {
  initialPageSize?: number;
  totalCount?: number;
}

interface UseOptimizedPaginationReturn {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
  canGoToPrevious: boolean;
  canGoToNext: boolean;
  hasMore: boolean;
}

export function useOptimizedPagination({ 
  initialPageSize = 20,
  totalCount = 0
}: UseOptimizedPaginationProps): UseOptimizedPaginationReturn {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const totalPages = Math.ceil(totalCount / pageSize);
  const hasMore = currentPage < totalPages;

  const goToFirstPage = useCallback(() => setCurrentPage(1), []);
  const goToLastPage = useCallback(() => setCurrentPage(totalPages), [totalPages]);
  
  const goToNextPage = useCallback(() => {
    if (hasMore) {
      setCurrentPage(prev => prev + 1);
    }
  }, [hasMore]);
  
  const goToPreviousPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  }, [currentPage]);

  const canGoToPrevious = currentPage > 1;
  const canGoToNext = hasMore;

  const handlePageSizeChange = useCallback((newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1); // Reset to first page when page size changes
  }, []);

  // Reset to first page if current page becomes invalid due to data changes
  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(1);
  }

  return {
    currentPage,
    pageSize,
    totalPages,
    totalCount,
    setCurrentPage,
    setPageSize: handlePageSizeChange,
    goToFirstPage,
    goToLastPage,
    goToNextPage,
    goToPreviousPage,
    canGoToPrevious,
    canGoToNext,
    hasMore,
  };
}