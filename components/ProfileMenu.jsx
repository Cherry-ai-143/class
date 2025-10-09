"use client"

import React, { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { User, LogOut, Settings } from "lucide-react"
import { useAuth } from "@/lib/contexts/auth-context"

export default function ProfileMenu() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef(null)

  if (!user) return null

  const getInitials = (name, email) => {
    if (name && name.trim().length > 0) {
      return name.trim().charAt(0).toUpperCase()
    }
    if (email && email.trim().length > 0) {
      return email.trim().charAt(0).toUpperCase()
    }
    return "U"
  }

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  const closeMenu = () => {
    setIsOpen(false)
  }

  const handleLogout = async () => {
    await logout()
    closeMenu()
  }

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        closeMenu()
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    } else {
      document.removeEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        onClick={toggleMenu}
        className="flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-br from-primary via-accent to-secondary text-white font-bold text-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName || "User Avatar"}
            className="h-12 w-12 rounded-full object-cover"
          />
        ) : (
          <span>{getInitials(user.displayName || "", user.email || "")}</span>
        )}
      </button>

      {isOpen && (
        <div
          className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="menu-button"
          tabIndex="-1"
        >
          <div className="py-1" role="none">
            <div className="px-4 py-2 border-b border-gray-200">
              <p className="text-sm font-semibold text-gray-900 truncate">{user.displayName || "User"}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
            <button
              onClick={() => {
                router.push("/profile")
                closeMenu()
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
              role="menuitem"
              tabIndex="-1"
            >
              <User className="w-4 h-4" />
              <span>View Profile</span>
            </button>
            <button
              onClick={() => {
                router.push("/settings")
                closeMenu()
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
              role="menuitem"
              tabIndex="-1"
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>
            <div className="border-t border-gray-200"></div>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-100 flex items-center space-x-2"
              role="menuitem"
              tabIndex="-1"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
