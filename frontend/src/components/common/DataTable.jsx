import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import EmptyState from './EmptyState';

const DataTable = ({
  columns = [],
  data = [],
  isLoading = false,
  searchPlaceholder = 'Search records...',
  onSearch,
  pagination = true,
  itemsPerPage = 10,
  actions,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = onSearch 
    ? data 
    : data.filter((item) =>
        columns.some((col) => {
          const val = col.accessor ? item[col.accessor] : null;
          return val ? String(val).toLowerCase().includes(searchTerm.toLowerCase()) : false;
        })
      );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const paginatedData = pagination
    ? filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    : filteredData;

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    if (onSearch) onSearch(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="card-premium overflow-hidden bg-white dark:bg-[#182216] border border-warmgrey dark:border-[#283623]">
      {/* Search & Actions Bar */}
      {(searchPlaceholder || actions) && (
        <div className="p-4 border-b border-warmgrey/70 dark:border-[#283623] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-cream/30 dark:bg-[#131A12]">
          {searchPlaceholder && (
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-muted dark:text-[#A8B49E] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={handleSearchChange}
                className="input-field pl-9 py-2 text-xs"
              />
            </div>
          )}
          {actions && <div className="flex items-center space-x-2">{actions}</div>}
        </div>
      )}

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-warmgrey/60 dark:divide-[#283623] text-left text-xs">
          <thead className="bg-cream/60 dark:bg-[#131A12] text-muted dark:text-[#CAD6B7] font-medium uppercase tracking-wider">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className={`px-4 py-3.5 ${col.className || ''}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-warmgrey/40 dark:divide-[#283623] bg-white dark:bg-[#182216]">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center">
                  <LoadingSpinner message="Loading records..." />
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-12">
                  <EmptyState title="No records found" description="Try adjusting your filters or search keywords." />
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rowIdx) => (
                <tr key={row.id || rowIdx} className="hover:bg-ivory/60 dark:hover:bg-[#212C1D] transition-colors">
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className={`px-4 py-3 text-charcoal dark:text-[#E8EDE4] ${col.cellClassName || ''}`}>
                      {col.render ? col.render(row) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {pagination && !isLoading && filteredData.length > 0 && (
        <div className="px-4 py-3 border-t border-warmgrey/60 dark:border-[#283623] flex items-center justify-between text-xs text-muted dark:text-[#A8B49E] bg-cream/20 dark:bg-[#131A12]">
          <div>
            Showing <span className="font-semibold text-charcoal dark:text-white">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
            <span className="font-semibold text-charcoal dark:text-white">
              {Math.min(currentPage * itemsPerPage, filteredData.length)}
            </span>{' '}
            of <span className="font-semibold text-charcoal dark:text-white">{filteredData.length}</span> entries
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-md border border-warmgrey dark:border-[#2D3D27] hover:bg-cream dark:hover:bg-[#212C1D] text-charcoal dark:text-[#E8EDE4] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 font-medium text-charcoal dark:text-white">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-md border border-warmgrey dark:border-[#2D3D27] hover:bg-cream dark:hover:bg-[#212C1D] text-charcoal dark:text-[#E8EDE4] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
