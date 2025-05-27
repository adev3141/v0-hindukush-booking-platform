"use client"

import { Component, type ErrorInfo, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <Card className="w-full max-w-md mx-auto my-8">
          <CardHeader>
            <CardTitle>Something went wrong</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              An error occurred while loading this component. Please try refreshing the page.
            </p>
            {this.state.error && (
              <pre className="mt-4 p-4 bg-muted rounded-md overflow-auto text-xs">{this.state.error.toString()}</pre>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={() => window.location.reload()}>Refresh Page</Button>
          </CardFooter>
        </Card>
      )
    }

    return this.props.children
  }
}
