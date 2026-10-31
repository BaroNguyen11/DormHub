import { useCallback, useState } from 'react';

export default function usePagination(initialPage = 0, pageSize = 10) {
  const [page, setPage] = useState(initialPage);

  const resetPage = useCallback(() => setPage(initialPage), [initialPage]);
  const previousPage = useCallback(
    () => setPage((current) => Math.max(initialPage, current - 1)),
    [initialPage],
  );
  const nextPage = useCallback(() => setPage((current) => current + 1), []);

  return { page, pageSize, setPage, resetPage, previousPage, nextPage };
}
