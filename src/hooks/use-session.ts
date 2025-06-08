import { useSession as useNextAuthSession } from "next-auth/react"

export function useSession() {
  const { data: session, status, update } = useNextAuthSession()
  
  return {
    session,
    status,
    update,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
    isError: status === 'unauthenticated'
  }
}
