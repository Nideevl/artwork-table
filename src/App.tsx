import React, { useCallback, useMemo } from 'react'
import { DataTable, type DataTableSelectionMultipleChangeEvent, type DataTablePageEvent } from 'primereact/datatable'
import { Column } from 'primereact/column'
import type { Artwork } from './types'
import { useFetchArtworks } from './useFetchArtworks'
import { SelectionOverlay } from './SelectionOverlay'

const ROWS_PER_PAGE = 20

export default function App() {
  const [page, setPage] = React.useState(1)
  const [selectedIds, setSelectedIds] = React.useState<Set<number>>(new Set())

  const { artworks, totalRecords, loading, error } = useFetchArtworks(page, ROWS_PER_PAGE)
  const [theme, setTheme] = React.useState<'dark' | 'light'>('light')

  React.useEffect(() => {
    document.documentElement.classList.remove('theme-dark', 'theme-light')
    document.documentElement.classList.add(`theme-${theme}`)
  }, [theme])

  React.useEffect(() => {
    const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches
    setTheme(prefersLight ? 'light' : 'dark')
  }, [])

  const selectedRows = useMemo(
    () => artworks.filter((a) => selectedIds.has(a.id)),
    [artworks, selectedIds]
  )

  const handleSelectionChange = useCallback(
    (e: DataTableSelectionMultipleChangeEvent<Artwork[]>) => {
      const next = new Set(selectedIds)
      const currentPageIds = new Set(artworks.map((a) => a.id))
      currentPageIds.forEach((id) => next.delete(id))
        ; (e.value as Artwork[]).forEach((a) => next.add(a.id))
      setSelectedIds(next)
    },
    [artworks, selectedIds]
  )

  const handleSelectN = useCallback(
    (n: number) => {
      const next = new Set(selectedIds)
      artworks.slice(0, n).forEach((a) => next.add(a.id))
      setSelectedIds(next)
    },
    [artworks, selectedIds]
  )

  const handlePageChange = useCallback((e: DataTablePageEvent) => {
    setPage((e.page ?? 0) + 1)
  }, [])

  const titleTemplate = (row: Artwork) => (
    <span className="col-title">{row.title || <em className="empty-val">—</em>}</span>
  )

  const artistTemplate = (row: Artwork) => (
    <span className="col-artist">{row.artist_display || <em className="empty-val">—</em>}</span>
  )

  const originTemplate = (row: Artwork) => (
    <span className="col-chip">{row.place_of_origin || '—'}</span>
  )

  const inscriptionsTemplate = (row: Artwork) => (
    <span className="col-inscription">
      {row.inscriptions ? (
        <span title={row.inscriptions}>
          {row.inscriptions.length > 80
            ? row.inscriptions.slice(0, 80) + '…'
            : row.inscriptions}
        </span>
      ) : (
        <em className="empty-val">—</em>
      )}
    </span>
  )

  const datesTemplate = (row: Artwork) => (
    <span className="col-dates">
      {row.date_start ?? '?'} – {row.date_end ?? '?'}
    </span>
  )

  const selectionHeader = () => (
    <div className="selection-header">
      <SelectionOverlay
        currentPageSize={artworks.length}
        onSelectN={handleSelectN}
      />
    </div>
  )

  const selectedCount = selectedIds.size

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="header-inner">
          <div className="header-meta">Collection Database</div>
          <h1 className="header-title">Art Institute of Chicago</h1>
          <p className="header-sub">
            Browse the permanent collection — {totalRecords.toLocaleString()} artworks
          </p>
        </div>
        <div className="theme-toggle flex gap-4">
          {selectedCount > 0 && (
            <div className="selection-badge">
              <span className="badge-count">{selectedCount}</span>
              <span className="badge-label">selected</span>
              <button
                className="badge-clear"
                onClick={() => setSelectedIds(new Set())}
                aria-label="Clear selection"
              >
                ✕
              </button>
            </div>
          )}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="theme-toggle-btn"
            aria-label="Toggle theme"
          >
            <span className="toggle-track">
              <span className={`toggle-thumb ${theme}`} />
            </span>
          </button>
        </div>
      </header>

      {error && (
        <div className="error-banner">
          <span>⚠ Failed to load: {error}</span>
        </div>
      )}

      <main className="table-wrapper">
        <DataTable<Artwork[]>
          value={artworks}
          dataKey="id"
          selectionMode="multiple"
          selection={selectedRows}
          onSelectionChange={handleSelectionChange}
          lazy
          paginator
          rows={ROWS_PER_PAGE}
          totalRecords={totalRecords}
          first={(page - 1) * ROWS_PER_PAGE}
          onPage={handlePageChange}
          loading={loading}
          loadingIcon="pi pi-spin pi-spinner"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
          emptyMessage={
            <div className="empty-state">
              <span className="empty-title">No artworks found</span>
            </div>
          }
          className="artwork-table"
          scrollable
          scrollHeight="calc(100vh - 260px)"
          stripedRows
        >
          <Column
            selectionMode="multiple"
            header={selectionHeader}
            headerStyle={{ width: '3.5rem' }}
            frozen
          />
          <Column field="title" header="Title" body={titleTemplate} style={{ minWidth: '220px' }} />
          <Column field="place_of_origin" header="Origin" body={originTemplate} style={{ minWidth: '140px' }} />
          <Column field="artist_display" header="Artist" body={artistTemplate} style={{ minWidth: '200px' }} />
          <Column field="inscriptions" header="Inscriptions" body={inscriptionsTemplate} style={{ minWidth: '240px' }} />
          <Column header="Dates" body={datesTemplate} style={{ minWidth: '120px' }} />
        </DataTable>
      </main>
    </div>
  )
}