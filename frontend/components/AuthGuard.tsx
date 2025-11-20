// component/AuthGuard.tsx


'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'

export default function AuthGuard({
  allowedRole,
  children,
}: {
  allowedRole: 'admin' | 'contributor' | 'user'
  children: React.ReactNode
}) {
  const { data: session } = useSession()
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    // Get numeric role from session
    const userRole = (session?.user as any)?.role ?? 2

    // Required role levels
    const requiredLevels = {
      'admin': 4,
      'contributor': 3,
      'user': 2,
    }

    const requiredLevel = requiredLevels[allowedRole] || 2
    const userRoleLevel = typeof userRole === 'number' ? userRole : 2

    setAuthorized(userRoleLevel >= requiredLevel)
  }, [session, allowedRole])

  if (!session) {
    return <p className="text-yellow-300">🔐 Please sign in to continue.</p>
  }

  if (!authorized) {
    return <p className="text-red-500">🚫 You do not have the required access level.</p>
  }

  return <>{children}</>
}






