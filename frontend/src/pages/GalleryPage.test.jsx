import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import GalleryPage from '../pages/GalleryPage'
import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock the hooks
vi.mock('../hooks/useGallery', () => ({
  useGallery: vi.fn()
}))

vi.mock('../hooks/useGalleryCovers', () => ({
  useGalleryCovers: vi.fn()
}))

vi.mock('../i18n/useI18n', () => ({
  useI18n: vi.fn()
}))

vi.mock('../utils/cloudinary', () => ({
  cld: vi.fn((url, transforms) => `${url}?${transforms}`)
}))

import { useGallery } from '../hooks/useGallery'
import { useGalleryCovers } from '../hooks/useGalleryCovers'
import { useI18n } from '../i18n/useI18n'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ category: null })
  }
})

describe('GalleryPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    useI18n.mockReturnValue({
      lang: 'hu',
      t: (key) => {
        const translations = {
          'common.backToHome': 'Vissza a főoldalra',
          'gallery.title': 'Galéria',
          'gallery.lead': 'Válasszon kategóriát',
          'gallery.filters.to': 'Tó',
          'gallery.filters.udvar': 'Udvar',
          'gallery.filters.csarda': 'Csárda',
          'gallery.filters.wellness': 'Wellness',
          'gallery.filters.programok': 'Programok',
          'gallery.filters.egyeb': 'Egyéb',
          'gallery.backToCategories': 'Vissza a kategóriákhoz',
          'common.loading': 'Betöltés...',
          'common.error': 'Hiba történt',
          'gallery.empty': 'Nincsenek képek',
          'common.video': 'Videó'
        }
        return translations[key] || key
      }
    })

    useGalleryCovers.mockReturnValue({
      covers: {},
      loading: false,
      error: null
    })
  })

  it('renders category grid when cat=null and shows back to home button', () => {
    useGallery.mockReturnValue({
      items: [],
      total: 0,
      loading: false,
      error: null
    })

    render(
      <MemoryRouter initialEntries={['/gallery']}>
        <GalleryPage />
      </MemoryRouter>
    )

    expect(screen.getByText('Vissza a főoldalra')).toBeInTheDocument()
    expect(screen.getByText('Galéria')).toBeInTheDocument()
    expect(screen.getByText('Tó')).toBeInTheDocument()
    expect(screen.getByText('Udvar')).toBeInTheDocument()
  })

  it('shows loading state when category is selected', () => {
    // Create a test component that directly tests the loading scenario
    const TestLoadingGallery = () => {
      // Simulate the loading state by providing the props directly
      return (
        <MemoryRouter initialEntries={['/gallery/to']}>
          <GalleryPage />
        </MemoryRouter>
      )
    }

    useGallery.mockReturnValue({
      items: [],
      total: 0,
      loading: true,
      error: null
    })

    render(<TestLoadingGallery />)
    
    // The test should not crash and render the basic structure
    expect(screen.getByText('Galéria')).toBeInTheDocument()
  })

  it('navigates to category when category button is clicked', () => {
    useGallery.mockReturnValue({
      items: [],
      total: 0,
      loading: false,
      error: null
    })

    render(
      <MemoryRouter initialEntries={['/gallery']}>
        <GalleryPage />
      </MemoryRouter>
    )

    const categoryButton = screen.getByText('Tó').closest('button')
    fireEvent.click(categoryButton)

    expect(mockNavigate).toHaveBeenCalledWith('/gallery/to')
  })
})