"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ShoppingCart, Search, Menu, X, User } from "lucide-react"
import ProfileMenu from "./ProfileMenu"
import { useAuth } from "@/lib/contexts/auth-context"

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()
  const { user, logout } = useAuth()

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/categories", label: "Categories" },
    { href: "/compare", label: "Compare Products" },
    { href: "/cart", label: "Cart" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ]

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery("")
      setIsMobileMenuOpen(false)
    }
  }

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center animate-pulse-gentle">
              <ShoppingCart className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Smart Compare
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-gray-700 hover:text-primary transition-colors duration-300 font-medium"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Search Bar and Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-64 rounded-lg bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </form>

            {!user ? (
              <Link href="/login">
                <button className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors duration-300">
                  <User className="w-4 h-4" />
                  <span>Login</span>
                </button>
              </Link>
            ) : (
              <ProfileMenu />
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-700 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 py-4">
            <div className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-gray-700 hover:text-primary transition-colors duration-300 font-medium px-4"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <div className="px-4">
                <form onSubmit={handleSearch} className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full rounded-lg bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </form>

                {!user ? (
                  <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <button className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors duration-300 w-full justify-center">
                      <User className="w-4 h-4" />
                      <span>Login</span>
                    </button>
                  </Link>
                ) : (
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
                      <div className="flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-br from-primary via-accent to-secondary text-white font-bold text-xl">
                        {user.photoURL ? (
                          <img
                            src={user.photoURL}
                            alt={user.displayName || "User Avatar"}
                            className="h-12 w-12 rounded-full object-cover"
                          />
                        ) : (
                          <span>{user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email ? user.email.charAt(0).toUpperCase() : "U"}</span>
                        )}
                      </div>
                      <div className="flex flex-col flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{user.displayName || "User"}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        router.push("/profile")
                        setIsMobileMenuOpen(false)
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                    >
                      <User className="w-4 h-4" />
                      <span>View Profile</span>
                    </button>
                    <button
                      onClick={() => {
                        router.push("/settings")
                        setIsMobileMenuOpen(false)
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </button>
                    <button
                      onClick={async () => {
                        await logout()
                        setIsMobileMenuOpen(false)
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-100 flex items-center space-x-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
