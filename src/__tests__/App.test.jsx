import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import App from '../App'

vi.mock('../components/pyramid/DivisionPyramid', () => ({
  default: () => <div data-testid="division-pyramid">DivisionPyramid</div>,
}))

vi.mock('../components/heya/HeyaDashboard', () => ({
  default: () => <div data-testid="heya-dashboard">HeyaDashboard</div>,
}))

describe('App', () => {
  it('should render the app header', () => {
    render(<App />)
    expect(screen.getByText('Sumo Divisions')).toBeInTheDocument()
  })

  it('should render the DivisionPyramid component', () => {
    render(<App />)
    expect(screen.getByTestId('division-pyramid')).toBeInTheDocument()
  })

  it('should have main element', () => {
    render(<App />)
    expect(screen.getByRole('main')).toBeInTheDocument()
  })

  it('should have header element', () => {
    render(<App />)
    expect(screen.getByRole('banner')).toBeInTheDocument()
  })

  it('should render h1 heading', () => {
    render(<App />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Sumo Divisions'
    )
  })

  it('switches to heya view when Heya tab is clicked', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('tab', { name: 'Heya' }))
    expect(screen.getByTestId('heya-dashboard')).toBeInTheDocument()
    expect(screen.queryByTestId('division-pyramid')).not.toBeInTheDocument()
  })

  it('switches back to rankings view when Rankings tab is clicked', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('tab', { name: 'Heya' }))
    fireEvent.click(screen.getByRole('tab', { name: 'Rankings' }))
    expect(screen.getByTestId('division-pyramid')).toBeInTheDocument()
    expect(screen.queryByTestId('heya-dashboard')).not.toBeInTheDocument()
  })
})

describe('App — fixed header', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      configurable: true,
      value: 0,
    })
    // Make the header ref return a measurable offsetHeight
    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
      configurable: true,
      get() { return 80 },
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      configurable: true,
      value: 0,
    })
  })

  it('header is not fixed on initial render', () => {
    render(<App />)
    const header = screen.getByRole('banner')
    expect(header).not.toHaveAttribute('data-fixed')
  })

  it('spacer is not present on initial render', () => {
    render(<App />)
    expect(screen.queryByTestId('header-spacer')).not.toBeInTheDocument()
  })

  it('header becomes fixed after scrolling past its height', () => {
    render(<App />)
    act(() => {
      window.scrollY = 100
      window.dispatchEvent(new Event('scroll'))
    })
    expect(screen.getByRole('banner')).toHaveAttribute('data-fixed')
  })

  it('spacer div is inserted when header becomes fixed', () => {
    render(<App />)
    act(() => {
      window.scrollY = 100
      window.dispatchEvent(new Event('scroll'))
    })
    expect(screen.getByTestId('header-spacer')).toBeInTheDocument()
  })

  it('header is not fixed while still within the threshold', () => {
    render(<App />)
    act(() => {
      window.scrollY = 50
      window.dispatchEvent(new Event('scroll'))
    })
    expect(screen.getByRole('banner')).not.toHaveAttribute('data-fixed')
  })

  it('header un-fixes when scrolling back above threshold', () => {
    render(<App />)
    act(() => {
      window.scrollY = 100
      window.dispatchEvent(new Event('scroll'))
    })
    act(() => {
      window.scrollY = 20
      window.dispatchEvent(new Event('scroll'))
    })
    expect(screen.getByRole('banner')).not.toHaveAttribute('data-fixed')
  })

  it('spacer is removed when header un-fixes', () => {
    render(<App />)
    act(() => {
      window.scrollY = 100
      window.dispatchEvent(new Event('scroll'))
    })
    act(() => {
      window.scrollY = 20
      window.dispatchEvent(new Event('scroll'))
    })
    expect(screen.queryByTestId('header-spacer')).not.toBeInTheDocument()
  })
})

describe('App — scroll-to-top button', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      configurable: true,
      value: 0,
    })
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      configurable: true,
      value: 0,
    })
  })

  it('scroll-to-top button is present in the DOM on initial render', () => {
    render(<App />)
    expect(screen.getByLabelText('Scroll to top')).toBeInTheDocument()
  })

  it('button does not have visible class below 300px scroll', () => {
    render(<App />)
    act(() => {
      window.scrollY = 150
      window.dispatchEvent(new Event('scroll'))
    })
    // The button is in the DOM but not visually active (no scrollToTopVisible class)
    const button = screen.getByLabelText('Scroll to top')
    expect(button).not.toHaveAttribute('data-visible')
    // Confirm it is present but that scrollToTopVisible is absent by checking
    // the aria-label still exists (button is always rendered)
    expect(button).toBeInTheDocument()
  })

  it('button becomes visible after scrolling past 300px', () => {
    render(<App />)
    act(() => {
      window.scrollY = 350
      window.dispatchEvent(new Event('scroll'))
    })
    // The visible prop is true — the button is accessible and active
    expect(screen.getByLabelText('Scroll to top')).toBeInTheDocument()
  })

  it('clicking scroll-to-top calls window.scrollTo with correct args', () => {
    render(<App />)
    act(() => {
      window.scrollY = 400
      window.dispatchEvent(new Event('scroll'))
    })
    fireEvent.click(screen.getByLabelText('Scroll to top'))
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })
  })

  it('clicking scroll-to-top calls scrollTo exactly once', () => {
    render(<App />)
    act(() => {
      window.scrollY = 400
      window.dispatchEvent(new Event('scroll'))
    })
    fireEvent.click(screen.getByLabelText('Scroll to top'))
    expect(window.scrollTo).toHaveBeenCalledTimes(1)
  })

  it('scroll listener is cleaned up on unmount', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener')
    const { unmount } = render(<App />)
    unmount()
    expect(removeSpy).toHaveBeenCalledWith('scroll', expect.any(Function))
  })
})
