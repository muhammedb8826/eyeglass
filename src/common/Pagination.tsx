interface PaginationProps {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ page, totalPages, onPageChange }) => {
    // Calculate which page numbers to show
    const getPageNumbers = () => {
        const delta = 2; // Number of pages to show on each side of current page
        const range = [];
        const rangeWithDots = [];

        // Always show first page
        range.push(1);

        // Calculate start and end of the range around current page
        let start = Math.max(2, page - delta);
        let end = Math.min(totalPages - 1, page + delta);

        // Adjust if we're near the start
        if (page - delta <= 2) {
            end = Math.min(5, totalPages - 1);
        }

        // Adjust if we're near the end
        if (page + delta >= totalPages - 1) {
            start = Math.max(2, totalPages - 4);
        }

        // Add pages around current page
        for (let i = start; i <= end; i++) {
            if (i !== 1 && i !== totalPages) {
                range.push(i);
            }
        }

        // Always show last page (if more than 1 page)
        if (totalPages > 1) {
            range.push(totalPages);
        }

        // Remove duplicates and sort
        const uniqueRange = [...new Set(range)].sort((a, b) => a - b);

        // Build range with dots
        let prev = 0;
        for (const num of uniqueRange) {
            if (num - prev === 2) {
                rangeWithDots.push(prev + 1);
            } else if (num - prev !== 1) {
                rangeWithDots.push('...');
            }
            rangeWithDots.push(num);
            prev = num;
        }

        return rangeWithDots;
    };

    const pageNumbers = getPageNumbers();

    return (
        <nav
            className="flex items-center flex-column flex-wrap md:flex-row justify-between pt-4"
            aria-label="Table navigation"
        >
            <span className="text-sm font-normal text-gray-500 dark:text-gray-400 mb-4 md:mb-0 block w-full md:inline md:w-auto">
                Showing{" "}
                <span className="font-semibold text-gray-900 dark:text-white">
                    {(page - 1) * 10 + 1}-{Math.min(page * 10, totalPages * 10)}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-gray-900 dark:text-white">
                    {totalPages * 10}
                </span>
            </span>
            <ul className="inline-flex -space-x-px rtl:space-x-reverse text-sm h-8">
                <li>
                    <button
                        onClick={() => onPageChange(page - 1)}
                        disabled={page === 1}
                        className="flex items-center justify-center px-3 h-8 ms-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed dark:bg-boxdark dark:border-strokedark dark:text-gray-400 dark:hover:bg-meta-4 dark:hover:text-white dark:disabled:bg-meta-4 dark:disabled:text-gray-600"
                    >
                        Previous
                    </button>
                </li>
                {pageNumbers.map((pageNum, index) => {
                    if (pageNum === '...') {
                        return (
                            <li key={`ellipsis-${index}`}>
                                <span className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 dark:bg-boxdark dark:border-strokedark dark:text-gray-400">
                                    ...
                                </span>
                            </li>
                        );
                    }
                    return (
                        <li key={pageNum}>
                            <button
                                onClick={() => onPageChange(pageNum as number)}
                                className={`flex items-center justify-center px-3 h-8 leading-tight border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:border-strokedark dark:hover:bg-meta-4 dark:hover:text-white ${
                                    page === pageNum
                                        ? "text-white bg-primary hover:bg-primary/80 hover:text-white dark:bg-primary dark:text-white dark:hover:bg-primary/80"
                                        : "text-gray-500 bg-white dark:bg-boxdark dark:text-gray-400"
                                }`}
                            >
                                {pageNum}
                            </button>
                        </li>
                    );
                })}
                <li>
                    <button
                        onClick={() => onPageChange(page + 1)}
                        disabled={page === totalPages}
                        className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed dark:bg-boxdark dark:border-strokedark dark:text-gray-400 dark:hover:bg-meta-4 dark:hover:text-white dark:disabled:bg-meta-4 dark:disabled:text-gray-600"
                    >
                        Next
                    </button>
                </li>
            </ul>
        </nav>
    );
};

export default Pagination;