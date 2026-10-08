import { Component, type ErrorInfo, type ReactNode } from 'react'

type FallbackProps = {
  error: unknown
  reset: () => void
}

type ErrorBoundaryProps = {
  children: ReactNode
  fallback: (props: FallbackProps) => ReactNode
  onError?: (error: unknown, info: ErrorInfo) => void
}

type ErrorBoundaryState = {
  hasError: boolean
  error: unknown
}

// Error Boundary досі можна написати лише класом: для getDerivedStateFromError/componentDidCatch
// немає хуків. Ловить помилки, кинуті під час РЕНДЕРУ дітей (і в їхніх хуках та конструкторах).
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null }

  // 1. Викликається під час рендеру після помилки: оновити state, щоб показати fallback
  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return { hasError: true, error }
  }

  // 2. Викликається після commit: місце для побічних дій — логування, відправка в Sentry
  componentDidCatch(error: unknown, info: ErrorInfo) {
    console.error('ErrorBoundary перехопив помилку:', error, info.componentStack)
    this.props.onError?.(error, info)
  }

  reset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback({ error: this.state.error, reset: this.reset })
    }
    return this.props.children
  }
}
