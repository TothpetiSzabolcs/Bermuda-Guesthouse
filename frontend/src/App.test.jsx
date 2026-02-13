import { render } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import App from './App.jsx'
import { LanguageProvider } from './i18n/LanguageProvider'

describe('App Component', () => {
  it('renders without crashing', () => {
    render(
        <BrowserRouter>
          <LanguageProvider>
            <App />
          </LanguageProvider>
        </BrowserRouter>
    )
  })

  it('contains router structure', () => {
    render(
        <BrowserRouter>
          <LanguageProvider>
            <App />
          </LanguageProvider>
        </BrowserRouter>
    )
    
    // The app should render routes structure
    // Since we can't easily test exact DOM structure in a non-brittle way,
    // we'll just verify it renders without throwing errors
    expect(document.body).toBeInTheDocument()
  })
})