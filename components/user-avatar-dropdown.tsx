"use client"

import { useRouter } from "next/navigation"
import { User, LogOut, Settings } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/contexts/auth-context"

export function UserAvatarDropdown() {
  const router = useRouter()
  const { user, logout } = useAuth()

  if (!user) return null

  const handleLogout = async () => {
    await logout()
  }

  const getInitials = (name: string, email: string) => {
    if (name && name.trim().length > 0) {
      return name.trim().charAt(0).toUpperCase()
    }
    if (email && email.trim().length > 0) {
      return email.trim().charAt(0).toUpperCase()
    }
    return "U"
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-12 w-12 rounded-full hover-scale transition-all duration-300 p-0 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          <Avatar className="h-12 w-12 ring-2 ring-primary/30 hover:ring-primary/50 transition-all duration-300">
            <AvatarImage src={user.photoURL || ''} alt={user.displayName || ''} />
            <AvatarFallback
              className="bg-gradient-to-br from-primary via-accent to-secondary text-white font-bold text-xl"
            >
              {getInitials(user.displayName || '', user.email || '')}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 glassmorphism-strong animate-scale-in" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-semibold leading-none text-foreground">{user.displayName || "User"}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push('/profile')} className="cursor-pointer hover-glow focus:bg-accent/10">
          <User className="mr-2 h-4 w-4" />
          <span>View Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push('/settings')} className="cursor-pointer hover-glow focus:bg-accent/10">
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          className="cursor-pointer hover-glow text-destructive focus:text-destructive focus:bg-destructive/10"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
