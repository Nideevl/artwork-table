import { useState, useEffect } from 'react'
import type { Artwork, ApiResponse } from './types'

const FIELDS = 'id,title,place_of_origin,artist_display,inscriptions,date_start,date_end'

interface UseFetchArtworksResult {
  artworks: Artwork[]
  totalRecords: number
  loading: boolean
  error: string | null
}

export function useFetchArtworks(page: number, limit: number): UseFetchArtworksResult {
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [totalRecords, setTotalRecords] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

   fetch(`https://api.artic.edu/api/v1/artworks?page=${page}&limit=${limit}&fields=${FIELDS}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json() as Promise<ApiResponse>
      })
      .then((data) => {
        if (cancelled) return
        setArtworks(data.data)
        setTotalRecords(data.pagination.total)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Unknown error')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [page , limit])

  return { artworks, totalRecords, loading, error }
}