import { Component } from 'react'
import styles from './ErrorBoundary.module.css'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    // In production: send to Sentry / LogRocket
    console.error('[Nexus Error Boundary]', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className={styles.wrap}>
          <div className={styles.card}>
            <div className={styles.icon}>⚠</div>
            <h2 className={styles.title}>Something went wrong</h2>
            <p className={styles.msg}>
              {this.state.error?.message ?? 'An unexpected error occurred in this view.'}
            </p>
            <button
              className={styles.btn}
              onClick={() => this.setState({ hasError: false, error: null })}
            >
              Try again
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
