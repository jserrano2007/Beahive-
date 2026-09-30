import { useI18n } from '../i18n/useI18n'
import './SearchBar.css'

function SearchBar({ query = '', onQueryChange, results = [], onSelect }) {
  const { t } = useI18n()
  return (
    <div className="search-bar">
      <div className="search-input-wrap">
        <svg
          className="search-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input
          type="search"
          className="search-input"
          placeholder={t('findFood.searchPlaceholder')}
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
        />
      </div>
      {query.trim() && (
        <ul className="search-results">
          {results.length === 0 ? (
            <li className="search-empty">
              {t('findFood.searchNoMatches', { query: query.trim() })}
            </li>
          ) : (
            results.map((result) => (
              <li key={result.key}>
                <button type="button" className="search-result" onClick={() => onSelect(result)}>
                  <span className="search-result-main">
                    <span className="search-result-name">{result.name}</span>
                    <span className={`search-result-type${result.type === 'neighbor' ? ' neighbor' : ''}`}>
                      {result.typeLabel}
                    </span>
                  </span>
                  {result.subtitle && (
                    <span className="search-result-subtitle">{result.subtitle}</span>
                  )}
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  )
}

export default SearchBar
