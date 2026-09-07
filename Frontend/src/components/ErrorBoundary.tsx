import { Component, type ErrorInfo, type ReactNode } from 'react'
import ErrorPage from '../pages/ErrorPage'

type Props = {
  children: ReactNode
  fallback?: ReactNode
}

type State = {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.groupCollapsed('%c[APP CRASH] %cUncaught render error', 'color:#b85448;font-weight:900', 'color:#5f736f')
    console.error('Error:', error)
    console.error('Component stack:', info.componentStack)
    console.error('Error stack:', error.stack)
    console.groupEnd()
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback
      return <ErrorPage error={this.state.error} onReset={this.handleReset} />
    }
    return this.props.children
  }
}
