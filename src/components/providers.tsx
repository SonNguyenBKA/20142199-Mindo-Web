"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import * as React from "react"

import { TooltipProvider } from "@/components/ui/tooltip"
import { isApiError } from "@/lib/api-error"

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            // Don't hammer the BE on auth/validation errors.
            retry: (count, error) =>
              count < 2 && !(isApiError(error) && error.status >= 400 && error.status < 500),
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delay={150}>{children}</TooltipProvider>
    </QueryClientProvider>
  )
}
