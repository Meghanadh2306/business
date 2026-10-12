import React from 'react';

export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100]
}) {
  if (totalItems === 0 && totalPages <= 1) return null;

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      let leftBound = Math.max(2, currentPage - 1);
      let rightBound = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage <= 3) {
        leftBound = 2;
        rightBound = 4;
      } else if (currentPage >= totalPages - 2) {
        leftBound = totalPages - 3;
        rightBound = totalPages - 1;
      }

      if (leftBound > 2) pages.push('ellipsis-left');
      for (let i = leftBound; i <= rightBound; i++) pages.push(i);
      if (rightBound < totalPages - 1) pages.push('ellipsis-right');
      pages.push(totalPages);
    }
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '12px',
      padding: '14px 18px',
      marginTop: '16px',
      background: 'var(--bg-card, #ffffff)',
      borderRadius: 'var(--radius, 10px)',
      border: '1px solid var(--border-color, #e2e8f0)',
      boxShadow: 'var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.05))',
      fontSize: '13px',
      color: 'var(--text-muted, #64748b)'
    }}>
      {/* Left side: Item count info & page size selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
        <span>
          Showing <strong style={{ color: 'var(--text-main, #0f172a)' }}>{startItem}</strong> to{' '}
          <strong style={{ color: 'var(--text-main, #0f172a)' }}>{endItem}</strong> of{' '}
          <strong style={{ color: 'var(--text-main, #0f172a)' }}>{totalItems}</strong> entries
        </span>

        {onPageSizeChange && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              style={{
                padding: '4px 8px',
                borderRadius: '6px',
                border: '1px solid var(--border-color, #cbd5e1)',
                background: 'var(--bg-card, #fff)',
                color: 'var(--text-main, #0f172a)',
                fontSize: '13px',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Right side: Page navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          style={{
            padding: '6px 12px',
            borderRadius: '6px',
            border: '1px solid var(--border-color, #cbd5e1)',
            background: 'var(--bg-card, #fff)',
            color: currentPage <= 1 ? '#94a3b8' : 'var(--text-main, #0f172a)',
            fontSize: '13px',
            fontWeight: 500,
            cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
            opacity: currentPage <= 1 ? 0.6 : 1,
            transition: 'var(--transition, all 0.2s ease)'
          }}
        >
          Previous
        </button>

        {pageNumbers.map((p, idx) => {
          if (typeof p === 'string') {
            return (
              <span key={`ell-${idx}`} style={{ padding: '4px 8px', color: '#94a3b8' }}>
                ...
              </span>
            );
          }
          const isActive = p === currentPage;
          return (
            <button
              type="button"
              key={p}
              onClick={() => onPageChange(p)}
              style={{
                padding: '6px 11px',
                minWidth: '32px',
                borderRadius: '6px',
                border: isActive ? 'none' : '1px solid var(--border-color, #cbd5e1)',
                background: isActive ? 'var(--primary, #0284c7)' : 'var(--bg-card, #fff)',
                color: isActive ? '#ffffff' : 'var(--text-main, #0f172a)',
                fontSize: '13px',
                fontWeight: isActive ? 600 : 500,
                cursor: 'pointer',
                transition: 'var(--transition, all 0.2s ease)',
                boxShadow: isActive ? '0 2px 4px rgba(2, 132, 199, 0.3)' : 'none'
              }}
            >
              {p}
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          style={{
            padding: '6px 12px',
            borderRadius: '6px',
            border: '1px solid var(--border-color, #cbd5e1)',
            background: 'var(--bg-card, #fff)',
            color: currentPage >= totalPages ? '#94a3b8' : 'var(--text-main, #0f172a)',
            fontSize: '13px',
            fontWeight: 500,
            cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
            opacity: currentPage >= totalPages ? 0.6 : 1,
            transition: 'var(--transition, all 0.2s ease)'
          }}
        >
          Next
        </button>
      </div>
    </div>
  );
}
