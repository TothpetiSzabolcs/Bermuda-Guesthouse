import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import RoomCard from './RoomCard';

// Mock the i18n hook
vi.mock('../i18n/useI18n', () => ({
  useI18n: () => ({
    t: (key) => {
      const translations = {
        'common.noImage': 'No image',
        'common.pricePerNight': 'night',
        'common.guests': 'guests',
        'rooms.placeholderDescription': 'No description available',
        'rooms.bookCta': 'Book Now',
        'common.viewDetails': 'View Details'
      };
      return translations[key] || key;
    }
  })
}));

// Mock Cloudinary
vi.mock('../utils/cloudinary', () => ({
  cld: (src, options) => src ? `${src}?${options}` : null
}));

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    Link: ({ children, to, ...props }) => <a href={to} {...props}>{children}</a>
  }
});

describe('RoomCard', () => {
  const mockRoom = {
    id: '1',
    name: 'Test Room',
    description: 'A nice test room',
    capacity: 2,
    price: 100,
    amenities: ['WiFi', 'TV'],
    slug: 'test-room'
  };

  it('renders room with placeholder when no images', () => {
    render(
      <MemoryRouter>
        <RoomCard room={mockRoom} onBookingClick={vi.fn()} />
      </MemoryRouter>
    );
    
    expect(screen.getByText('Test Room')).toBeInTheDocument();
    expect(screen.getByText('A nice test room')).toBeInTheDocument();
    expect(screen.getByText('2 guests')).toBeInTheDocument();
    expect(screen.getByText('No image')).toBeInTheDocument();
  });

  it('renders room with single image without carousel controls', () => {
    const roomWithImage = {
      ...mockRoom,
      images: [{ url: 'https://example.com/image.jpg', alt: 'Room image' }]
    };

    render(
      <MemoryRouter>
        <RoomCard room={roomWithImage} onBookingClick={vi.fn()} />
      </MemoryRouter>
    );
    
    const img = screen.getByAltText('Room image');
    expect(img).toBeInTheDocument();
    
    // Should not show carousel controls for single image
    expect(screen.queryByLabelText('Previous image')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Next image')).not.toBeInTheDocument();
  });

  it('renders carousel controls when multiple images', () => {
    const roomWithMultipleImages = {
      ...mockRoom,
      images: [
        { url: 'https://example.com/image1.jpg', alt: 'Room image 1' },
        { url: 'https://example.com/image2.jpg', alt: 'Room image 2' }
      ]
    };

    render(
      <MemoryRouter>
        <RoomCard room={roomWithMultipleImages} onBookingClick={vi.fn()} />
      </MemoryRouter>
    );
    
    expect(screen.getByLabelText('Previous image')).toBeInTheDocument();
    expect(screen.getByLabelText('Next image')).toBeInTheDocument();
    
    // Should show image indicators
    expect(screen.getAllByRole('button')).toHaveLength(5); // 2 nav buttons + 2 indicators + 2 action buttons
  });

  it('handles image navigation', () => {
    const roomWithMultipleImages = {
      ...mockRoom,
      images: [
        { url: 'https://example.com/image1.jpg', alt: 'Room image 1' },
        { url: 'https://example.com/image2.jpg', alt: 'Room image 2' }
      ]
    };

    render(
      <MemoryRouter>
        <RoomCard room={roomWithMultipleImages} onBookingClick={vi.fn()} />
      </MemoryRouter>
    );
    
    const img = screen.getByAltText('Room image 1');
    expect(img).toBeInTheDocument();
    
    // Click next button
    const nextButton = screen.getByLabelText('Next image');
    fireEvent.click(nextButton);
    
    // Should show second image
    expect(screen.getByAltText('Room image 2')).toBeInTheDocument();
  });

  it('calls onBookingClick when booking button is clicked', () => {
    const onBookingClick = vi.fn();
    render(
      <MemoryRouter>
        <RoomCard room={mockRoom} onBookingClick={onBookingClick} />
      </MemoryRouter>
    );
    
    const bookButton = screen.getByText('Book Now');
    fireEvent.click(bookButton);
    
    expect(onBookingClick).toHaveBeenCalledWith(mockRoom);
  });

  it('stops propagation on carousel controls', () => {
    const roomWithMultipleImages = {
      ...mockRoom,
      images: [
        { url: 'https://example.com/image1.jpg', alt: 'Room image 1' },
        { url: 'https://example.com/image2.jpg', alt: 'Room image 2' }
      ]
    };

    render(
      <MemoryRouter>
        <RoomCard room={roomWithMultipleImages} onBookingClick={vi.fn()} />
      </MemoryRouter>
    );
    
    const nextButton = screen.getByLabelText('Next image');
    
    // Mock the stopPropagation method on the event
    const mockStopPropagation = vi.fn();
    
    // Create a click event with the mock method
    const clickEvent = new MouseEvent('click', { bubbles: true });
    clickEvent.stopPropagation = mockStopPropagation;
    
    // Directly call the click handler
    nextButton.dispatchEvent(clickEvent);
    
    expect(mockStopPropagation).toHaveBeenCalled();
  });
});