import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import RoomDetail from '../components/RoomDetail'
import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock the hooks
const mockUseRooms = vi.fn()
const mockUseI18n = vi.fn()

vi.mock('../hooks/useRooms', () => ({
  useRooms: () => mockUseRooms()
}))

vi.mock('../i18n/useI18n', () => ({
  useI18n: () => mockUseI18n()
}))

vi.mock('../utils/cloudinary', () => ({
  cld: vi.fn((url, transforms) => `${url}?${transforms}`)
}))

// Mock BookingModal
vi.mock('../components/BookingModal', () => {
  return {
    default: function MockBookingModal({ isOpen, onClose }) {
      if (!isOpen) return null
      return (
        <div data-testid="booking-modal">
          <button onClick={onClose}>Close Modal</button>
        </div>
      )
    }
  }
})

const mockNavigate = vi.fn()

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ slug: 'test-room' }),
    Link: ({ children, to, ...props }) => <a href={to} {...props}>{children}</a>
  }
})

describe('RoomDetail', () => {
  const mockRoom = {
    _id: '1',
    slug: 'test-room',
    name: 'Teszt Szoba',
    description: 'Ez egy teszt szoba leírás.',
    price: 100,
    guests: 2,
    image: 'https://example.com/room.jpg',
    amenities: ['WiFi', 'Klímás', 'TV']
  }

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Default mock implementations
    mockUseI18n.mockReturnValue({
      lang: 'hu',
      t: (key) => {
        const translations = {
          'common.loading': 'Betöltés...',
          'common.error': 'Hiba történt',
          'common.backToHome': 'Vissza a szobákhoz',
          'rooms.bookCta': 'Foglalás',
          'rooms.description': 'Leírás',
          'rooms.amenities': 'Felszereltség',
          'rooms.standardAmenities': 'Alap felszereltség',
          'rooms.privateBathroom': 'Privát fürdőszoba',
          'rooms.morePhotos': 'További képek',
          'rooms.placeholderDescription': 'Nincs leírás.',
          'common.noImage': 'Nincs kép',
          'common.guests': 'vendég',
          'common.pricePerNight': 'éjszaka'
        }
        return translations[key] || key
      }
    })
  })

  it('renders room details correctly', () => {
    mockUseRooms.mockReturnValue({
      data: [mockRoom],
      loading: false,
      error: null
    })

    render(
      <MemoryRouter initialEntries={['/rooms/test-room']}>
        <RoomDetail />
      </MemoryRouter>
    )

    // Check basic room information
    expect(screen.getByText('Teszt Szoba')).toBeInTheDocument()
    expect(screen.getByText('Ez egy teszt szoba leírás.')).toBeInTheDocument()
    expect(screen.getByText('2 vendég')).toBeInTheDocument()
    expect(screen.getByText('$100/éjszaka')).toBeInTheDocument()
    
    // Check amenities (in badges)
    expect(screen.getByText('Klímás')).toBeInTheDocument()
    
    // Check standard amenities
    expect(screen.getByText('Kávé/Tea')).toBeInTheDocument()
    expect(screen.getByText('Privát fürdőszoba')).toBeInTheDocument()
    expect(screen.getByText('Konyhai rész')).toBeInTheDocument()
    
    // Check WiFi appears at least once (it appears in both sections)
    expect(screen.getAllByText('WiFi').length).toBeGreaterThan(0)
    // Check TV appears at least once (it appears in both sections)
    expect(screen.getAllByText('TV').length).toBeGreaterThan(0)
  })

  it('shows back link with correct href pointing to rooms section', () => {
    mockUseRooms.mockReturnValue({
      data: [mockRoom],
      loading: false,
      error: null
    })

    render(
      <MemoryRouter initialEntries={['/rooms/test-room']}>
        <RoomDetail />
      </MemoryRouter>
    )

    const backLink = screen.getByText('Vissza a szobákhoz')
    expect(backLink).toBeInTheDocument()
    expect(backLink.closest('a')).toHaveAttribute('href', '/#rooms')
  })

  it('opens booking modal when booking button is clicked', () => {
    mockUseRooms.mockReturnValue({
      data: [mockRoom],
      loading: false,
      error: null
    })

    render(
      <MemoryRouter initialEntries={['/rooms/test-room']}>
        <RoomDetail />
      </MemoryRouter>
    )

    const bookingButton = screen.getByText('Foglalás')
    fireEvent.click(bookingButton)

    expect(screen.getByTestId('booking-modal')).toBeInTheDocument()
  })

  it('closes booking modal', () => {
    mockUseRooms.mockReturnValue({
      data: [mockRoom],
      loading: false,
      error: null
    })

    render(
      <MemoryRouter initialEntries={['/rooms/test-room']}>
        <RoomDetail />
      </MemoryRouter>
    )

    // Open modal
    const bookingButton = screen.getByText('Foglalás')
    fireEvent.click(bookingButton)

    // Close modal
    const closeButton = screen.getByText('Close Modal')
    fireEvent.click(closeButton)

    expect(screen.queryByTestId('booking-modal')).not.toBeInTheDocument()
  })

  it('shows loading state', () => {
    mockUseRooms.mockReturnValue({
      data: null,
      loading: true,
      error: null
    })

    render(
      <MemoryRouter initialEntries={['/rooms/test-room']}>
        <RoomDetail />
      </MemoryRouter>
    )

    expect(screen.getByText('Betöltés...')).toBeInTheDocument()
  })

  it('shows error state', () => {
    mockUseRooms.mockReturnValue({
      data: null,
      loading: false,
      error: new Error('API Error')
    })

    render(
      <MemoryRouter initialEntries={['/rooms/test-room']}>
        <RoomDetail />
      </MemoryRouter>
    )

    expect(screen.getByText('Hiba történt')).toBeInTheDocument()
  })

  it('redirects to home if room not found', () => {
    mockUseRooms.mockReturnValue({
      data: [], // Empty array - room not found
      loading: false,
      error: null
    })

    render(
      <MemoryRouter initialEntries={['/rooms/test-room']}>
        <RoomDetail />
      </MemoryRouter>
    )

    expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true })
  })

  it('renders additional images if available', () => {
    const roomWithImages = {
      ...mockRoom,
      images: [
        { url: 'https://example.com/room1.jpg' },
        { url: 'https://example.com/room2.jpg' },
        { url: 'https://example.com/room3.jpg' }
      ]
    }

    mockUseRooms.mockReturnValue({
      data: [roomWithImages],
      loading: false,
      error: null
    })

    render(
      <MemoryRouter initialEntries={['/rooms/test-room']}>
        <RoomDetail />
      </MemoryRouter>
    )

    expect(screen.getByText('További képek')).toBeInTheDocument()
    
    // Check if additional images are rendered (excluding the main image)
    const images = screen.getAllByRole('img')
    expect(images.length).toBeGreaterThan(1) // Main image + additional images
  })
})