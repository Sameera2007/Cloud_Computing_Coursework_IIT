import { Search, SlidersHorizontal } from 'lucide-react';

export default function FilterBar({ filters, onChange, onSearch, showCompany = true, loading }) {
  const handleKey = e => e.key === 'Enter' && onSearch();

  const inputStyle = {
    height: 40,
    padding: '0 12px',
    border: '1.5px solid var(--border)',
    borderRadius: 'var(--r-md)',
    fontSize: 14,
    fontFamily: 'var(--font)',
    color: 'var(--text-1)',
    background: 'var(--surface)',
    outline: 'none',
    flex: 1,
    minWidth: 130,
    transition: 'border-color 150ms ease, box-shadow 150ms ease',
  };

  const selectStyle = {
    ...inputStyle,
    paddingRight: 32,
    backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")",
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 10px center',
    WebkitAppearance: 'none',
    cursor: 'pointer',
  };

  const focusStyle = {
    borderColor: 'var(--primary)',
    boxShadow: '0 0 0 3px rgba(99,102,241,0.12)',
  };

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--r-lg)',
      padding: '16px 20px',
      boxShadow: 'var(--sh-xs)',
      display: 'flex',
      flexWrap: 'wrap',
      gap: 10,
      alignItems: 'center',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        <SlidersHorizontal size={15} color="var(--text-3)" />
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)', whiteSpace: 'nowrap' }}>Filter</span>
      </div>

      {filters.hasOwnProperty('country') && (
        <input
          style={inputStyle}
          placeholder="Country"
          value={filters.country}
          onChange={e => onChange('country', e.target.value)}
          onKeyDown={handleKey}
          onFocus={e => Object.assign(e.target.style, focusStyle)}
          onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
        />
      )}
      {showCompany && filters.hasOwnProperty('company') && (
        <input
          style={inputStyle}
          placeholder="Company"
          value={filters.company}
          onChange={e => onChange('company', e.target.value)}
          onKeyDown={handleKey}
          onFocus={e => Object.assign(e.target.style, focusStyle)}
          onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
        />
      )}
      {filters.hasOwnProperty('role') && (
        <input
          style={inputStyle}
          placeholder="Role / Title"
          value={filters.role}
          onChange={e => onChange('role', e.target.value)}
          onKeyDown={handleKey}
          onFocus={e => Object.assign(e.target.style, focusStyle)}
          onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
        />
      )}
      {filters.hasOwnProperty('level') && (
        <select
          style={selectStyle}
          value={filters.level}
          onChange={e => onChange('level', e.target.value)}
          onFocus={e => Object.assign(e.target.style, { borderColor: 'var(--primary)', boxShadow: '0 0 0 3px rgba(99,102,241,0.12)' })}
          onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
        >
          <option value="">All Levels</option>
          <option value="junior">Junior</option>
          <option value="mid">Mid-level</option>
          <option value="senior">Senior</option>
          <option value="lead">Lead</option>
          <option value="principal">Principal</option>
        </select>
      )}

      <button
        onClick={onSearch}
        disabled={loading}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 7,
          height: 40, padding: '0 18px',
          borderRadius: 'var(--r-md)', border: 'none',
          background: 'var(--primary)', color: '#fff',
          fontSize: 14, fontWeight: 600,
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.7 : 1,
          flexShrink: 0,
          transition: 'background 150ms ease',
        }}
        onMouseEnter={e => { if (!loading) e.currentTarget.style.background = 'var(--primary-hover)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'var(--primary)'; }}
      >
        <Search size={14} />
        {loading ? 'Searching…' : 'Search'}
      </button>
    </div>
  );
}
