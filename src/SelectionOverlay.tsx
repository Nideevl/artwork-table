import { useRef, useState } from 'react'
import { OverlayPanel } from 'primereact/overlaypanel'
import { Button } from 'primereact/button'
import { InputNumber } from 'primereact/inputnumber'

interface SelectionOverlayProps {
  currentPageSize: number
  onSelectN: (n: number) => void
}

export function SelectionOverlay({ currentPageSize, onSelectN }: SelectionOverlayProps) {
  const op = useRef<OverlayPanel>(null)
  const [count, setCount] = useState<number | null>(null)

  const handleSubmit = () => {
    if (count === null || count <= 0) return

    const capped = Math.min(count, currentPageSize)
    onSelectN(capped)
    op.current?.hide()
    setCount(null)
  }

  return (
    <>
      <Button
        icon="pi pi-chevron-down"
        className="p-button-text p-button-sm selection-chevron-btn mr-2"
        onClick={(e) => op.current?.toggle(e)}
        aria-label="Custom row selection"
        tooltip="Custom row selection"
        tooltipOptions={{ position: 'top'}}
      />

      <OverlayPanel ref={op} className="selection-overlay-panel">
        <div className="overlay-inner">
          <h4 className="overlay-title">Select rows</h4>
          <p className="overlay-subtitle">
            Enter number of rows to select from the current page
          </p>
          <div className="overlay-input-row">
            <InputNumber
              value={count}
              onValueChange={(e) => setCount(e.value ?? null)}
              min={1}
              max={currentPageSize}
              placeholder={`1 – ${currentPageSize}`}
              className="overlay-input"
              inputClassName="overlay-input-field"
              showButtons={false}
            />
            <Button
              label="Select"
              className="p-button-sm overlay-submit-btn"
              onClick={handleSubmit}
              disabled={count === null || count <= 0}
            />
          </div>
          {count !== null && count > currentPageSize && (
            <p className="overlay-cap-note">
              Capped to {currentPageSize} — only current page rows are available
            </p>
          )}
        </div>
      </OverlayPanel>
    </>
  )
}