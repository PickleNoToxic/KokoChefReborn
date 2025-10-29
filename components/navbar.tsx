"use client"

import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect, useRef } from "react"

export function Navbar() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    router.push("/login")
    setShowMenu(false)
  }

  if (!user) {
    return null
  }

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="text-2xl font-bold text-primary">KokoChef</div>
          </Link>

          <div className="flex items-center gap-4">
            {/* Profile Menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary/50 transition-colors"
                aria-label="Profile menu"
              >
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                  {user?.username?.charAt(0)?.toUpperCase() ?? "-"}
                </div>
                <span className="text-sm font-medium hidden sm:inline">{user?.username ?? "User"}</span>
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg py-2 z-50">
                  <Link href="/my-recipes">
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-secondary/50 transition-colors text-sm"
                      onClick={() => setShowMenu(false)}
                    >
                      Resep Saya
                    </button>
                  </Link>
                  <Link href="/bookmarks">
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-secondary/50 transition-colors text-sm"
                      onClick={() => setShowMenu(false)}
                    >
                      Bookmarks
                    </button>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 hover:bg-destructive/10 text-destructive transition-colors text-sm"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
