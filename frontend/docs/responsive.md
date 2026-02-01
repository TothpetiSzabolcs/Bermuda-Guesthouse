# Responsive Design Guidelines

This document outlines the responsive design baseline and best practices for the Bermuda Vendégház website.

## Breakpoint System

We use Tailwind's default breakpoints with the following target devices:

- **320px** - iPhone SE (minimum width)
- **390px** - iPhone 12/13/14/15 (small mobile)
- **640px** - Large phones to small tablets (sm: breakpoint)
- **768px** - iPad/standard tablets (md: breakpoint)
- **1024px** - Small laptops (lg: breakpoint)
- **1280px** - Desktop/large laptops (xl: breakpoint)
- **1440px** - Large desktop (2xl: breakpoint)
- **1920px+** - Ultrawide displays

## Global Container Pattern

Use the following container pattern for consistent layouts:

```html
<div class="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
  <!-- Content -->
</div>
```

Or use the utility class:
```html
<div class="container-responsive">
  <!-- Content -->
</div>
```

## Global Baseline Rules

### Overflow Protection
- `html`, `body`, and `#root` have `overflow-x: hidden` to prevent horizontal scroll
- All text elements use `overflow-wrap: break-word` and `word-wrap: break-word`
- SVG icons have `flex-shrink: 0` to prevent layout issues

### Header Offset
- Fixed header height is 64px (16 * 4 in Tailwind)
- Main content sections use `pt-16` to account for fixed header
- Section targets use `scroll-mt-16` for proper anchor positioning

### Image Guidelines
- All images use `object-cover` for consistent aspect ratios
- Images have `max-w-full` to prevent overflow
- Use responsive `srcset` and `sizes` attributes for performance
- Include `loading="lazy"` and `decoding="async"` for performance

### Icon Guidelines
- All inline icons should have `shrink-0` class
- Icons should be properly sized (typically w-4 h-4 or w-5 h-5)
- Icons should be used with proper `aria-hidden` when decorative

### Text Guidelines
- Long emails and URLs use `break-all` class to prevent overflow
- Headings use `text-wrap: balance` for better text distribution
- Consider `text-wrap: pretty` for important headings

## Component-Specific Guidelines

### Navigation
- Mobile-first approach: desktop menu hidden on mobile (`hidden md:flex`)
- Hamburger menu for mobile with proper touch targets (min 44px)
- Dropdown navigation has proper backdrop blur and transparency

### Cards (Room Cards, Experience Cards)
- Use aspect ratio containers (`aspect-[4/3]` for consistency)
- Responsive grid: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- Hover effects with proper transitions
- Icons in badges have `shrink-0`

### Forms
- Responsive form layouts: single column on mobile, multi-column on desktop
- Proper input sizes for mobile (`text-sm` to `text-base`)
- Touch-friendly button sizes (minimum 44px height)
- Error states with proper visual indicators

### Modals
- Responsive max-width with proper mobile padding
- Scroll behavior on mobile devices
- Proper backdrop blur and z-index management

## Testing Breakpoints

When testing responsive behavior, verify the following:

### 320px (iPhone SE)
- All text is readable without horizontal scroll
- Navigation menu is properly hidden and accessible
- Form inputs are large enough for touch
- Cards stack vertically
- No content overflow

### 390px (iPhone 12/13)
- Consistent layout with 320px
- Better text distribution with additional width
- Improved touch target spacing

### 768px (Tablet)
- Navigation switches to desktop view
- Cards start to appear in 2-column layouts
- Improved content density
- Modal sizing is appropriate

### 1024px+ (Desktop)
- Full desktop navigation
- Multi-column layouts (3-column for cards)
- Hover effects and micro-interactions
- Optimized spacing and typography

## Performance Considerations

### Images
- Use Cloudinary transformations for responsive images
- Implement lazy loading for below-the-fold images
- Provide appropriate `alt` text for accessibility
- Use modern image formats (WebP) when available

### CSS
- Prefer Tailwind utilities over custom CSS
- Use `@layer` directives for custom styles
- Minimize layout shifts with proper aspect ratios

### JavaScript
- Optimize scroll event handlers with `requestAnimationFrame`
- Use intersection observers for lazy loading
- Implement proper event cleanup in useEffect

## Accessibility Notes

- Maintain minimum touch target size of 44px
- Ensure proper color contrast ratios
- Use semantic HTML elements appropriately
- Provide skip links for navigation
- Test keyboard navigation on all breakpoints

## Common Issues to Avoid

1. **Horizontal Scroll**: Always check for overflow at smallest breakpoint
2. **Text Overflow**: Use proper text wrapping for long content
3. **Fixed Positioning**: Account for mobile viewports and browser chrome
4. **Touch Targets**: Ensure interactive elements are large enough
5. **Content Jumps**: Use proper aspect ratios for media elements
6. **Z-index Conflicts**: Maintain consistent z-index scale

## Browser Support

- Modern browsers (Chrome 80+, Firefox 75+, Safari 13+, Edge 80+)
- Graceful degradation for older browsers
- Progressive enhancement with CSS Grid and Flexbox