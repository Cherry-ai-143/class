"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { platforms } from "@/lib/types"
import { getLowestPrice, getLowestPricePlatform } from "@/lib/utils/price-helpers"
import { MapPin, ShoppingCart, ExternalLink, TrendingDown, Clock, CheckCircle, XCircle, Trash2, Loader2 } from "lucide-react"
import { useCompare } from "@/lib/contexts/compare-context"
import { useCart } from "@/lib/contexts/cart-context"
import { useRouter } from "next/navigation"
import type { Product } from "@/lib/types"


export default function ComparePage() {
  const { compareProducts, removeFromCompare, clearCompare } = useCompare()
  const { setCartFromCompare } = useCart()
  const router = useRouter()
  const [detectedLocation, setDetectedLocation] = useState<{city: string, area: string, landmark: string, pincode: string} | null>(null)
  const [isDetecting, setIsDetecting] = useState(false)
  const [comparisonData, setComparisonData] = useState<any>(null)
  const [isComparing, setIsComparing] = useState(false)

  const getProductId = (product: Product): string => {
    return product._id || `${product.category}-${product.id}`
  }

  useEffect(() => {
    if (compareProducts.length > 0) {
      // No default location - require detection
    }
  }, [compareProducts])

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by this browser.")
      return
    }

    setIsDetecting(true)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
          )
          const data = await response.json()

          const city = data.address?.city || data.address?.town || data.address?.village || ""
          const area = data.address?.suburb || data.address?.neighbourhood || data.address?.subarea || ""
          const landmark = data.address?.amenity || data.address?.building || data.address?.road || ""
          const postcode = data.address?.postcode || ""

          setDetectedLocation({ city, area, landmark, pincode: postcode })
        } catch (error) {
          console.error("Error fetching location data:", error)
          alert("Unable to detect location. Please try again.")
        } finally {
          setIsDetecting(false)
        }
      },
      (error) => {
        console.error("Geolocation error:", error)
        alert("Unable to access location. Please try again.")
        setIsDetecting(false)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    )
  }

  const handleCompare = async () => {
    if (compareProducts.length < 1) {
      alert("Please add at least 1 product to compare")
      return
    }

    if (!detectedLocation) {
      alert("Please detect your location first")
      return
    }

    setIsComparing(true)

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const selectedProductsData = compareProducts

    // Calculate basket totals for each platform
    const basketTotals = platforms.reduce((acc, platform) => {
      const total = selectedProductsData.reduce((sum, product) => {
        if (product.availability[platform.id as keyof typeof product.availability]) {
          return sum + product.prices[platform.id as keyof typeof product.prices]
        }
        return sum
      }, 0)

      const availableCount = selectedProductsData.filter(
        (product) => product.availability[platform.id as keyof typeof product.availability],
      ).length

      acc[platform.id] = {
        total,
        availableCount,
        totalProducts: selectedProductsData.length,
        savings: 0,
      }
      return acc
    }, {} as any)

    // Find cheapest platform
    const cheapestPlatform = Object.entries(basketTotals)
      .filter(([_, data]: [string, any]) => data.availableCount === selectedProductsData.length)
      .reduce((a, b) => (basketTotals[a[0]].total <= basketTotals[b[0]].total ? a : b))

    // Calculate savings
    Object.keys(basketTotals).forEach((platformId) => {
      if (
        platformId !== cheapestPlatform[0] &&
        basketTotals[platformId].availableCount === selectedProductsData.length
      ) {
        basketTotals[platformId].savings = basketTotals[platformId].total - basketTotals[cheapestPlatform[0]].total
      }
    })

    setComparisonData({
      products: selectedProductsData,
      basketTotals,
      cheapestPlatform: cheapestPlatform[0],
      location: detectedLocation.city || detectedLocation.pincode,
    })

    setIsComparing(false)
  }

  const openPlatformSearch = (platformName: string) => {
    const urls = {
      blinkit: "https://blinkit.com/search",
      zepto: "https://zepto.com/search",
      bigbasket: "https://www.bigbasket.com/search",
      jiomart: "https://www.jiomart.com/search",
    }
    window.open(urls[platformName as keyof typeof urls], "_blank")
  }

  const handleAddToCart = () => {
    if (compareProducts.length === 0) {
      alert("No products to add to cart")
      return
    }
    setCartFromCompare(compareProducts)
    // Don't clear compare list - user may want to keep comparing
    router.push("/cart")
  }

  const compareProductsList = compareProducts

  if (compareProducts.length === 0) {
    return (
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="glassmorphism p-12 rounded-2xl">
            <ShoppingCart className="w-24 h-24 mx-auto mb-6 text-muted-foreground" />
            <h1 className="text-3xl font-bold mb-4 text-foreground">No products selected for comparison</h1>
            <p className="text-lg text-muted-foreground mb-8">
              Please add items from Categories to start comparing prices across platforms.
            </p>
            <Button
              className="bg-gradient-to-r from-primary to-secondary hover-glow"
              size="lg"
              onClick={() => router.push("/categories")}
            >
              Browse Categories
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Compare Products
          </h1>
          <p className="text-lg text-muted-foreground">
            Compare prices across all platforms for your selected products
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="glassmorphism">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ShoppingCart className="w-5 h-5" />
                    <span>Selected Products ({compareProducts.length})</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={clearCompare} className="hover-glow bg-transparent">
                    Clear All
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {compareProductsList.map((product) => {
                    const uniqueProductId = getProductId(product)
                    return (
                      <div
                        key={uniqueProductId}
                        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <img
                          src={product.image || "/placeholder.svg"}
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <div className="font-medium">{product.name}</div>
                          <p className="text-sm text-muted-foreground">From ₹{getLowestPrice(product.prices)}</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeFromCompare(uniqueProductId)}
                          className="hover-glow bg-transparent text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Location & Compare */}
          <div className="space-y-6">
            <Card className="glassmorphism">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5" />
                  <span>Location</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  variant="outline"
                  onClick={handleDetectLocation}
                  disabled={isDetecting}
                  className="w-full"
                >
                  {isDetecting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Detecting...
                    </>
                  ) : (
                    <>
                      <MapPin className="mr-2 h-4 w-4" />
                      Detect My Location
                    </>
                  )}
                </Button>

                {detectedLocation && (
                  <div className="mt-4 p-3 bg-green-50 rounded-md border border-green-200">
                    <p className="text-sm font-medium text-green-800 mb-2">Detected:</p>
                    <div className="text-sm text-green-700 space-y-1">
                      <p>City: {detectedLocation.city || "Unknown"}</p>
                      <p>Area: {detectedLocation.area || "Unknown"}</p>
                      <p>Landmark: {detectedLocation.landmark || "Unknown"}</p>
                      <p>Pincode: {detectedLocation.pincode || "Unknown"}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Button
              onClick={handleCompare}
              disabled={compareProducts.length < 1 || !detectedLocation || isComparing}
              className="w-full bg-gradient-to-r from-primary to-secondary hover-glow text-lg py-6"
            >
              {isComparing ? "Comparing..." : "Compare Basket"}
            </Button>

            {comparisonData && (
              <Button
                onClick={handleAddToCart}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover-glow text-lg py-6"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Add to Cart
              </Button>
            )}
          </div>
        </div>

        {/* Comparison Results */}
        {comparisonData && (
          <div className="mt-12 space-y-8">
            {/* Basket Summary */}
            <Card className="glassmorphism">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingDown className="w-5 h-5" />
                  <span>Basket Comparison - {comparisonData.location}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {platforms.map((platform) => {
                    const data = comparisonData.basketTotals[platform.id]
                    const isCheapest = platform.id === comparisonData.cheapestPlatform
                    const isFullyAvailable = data.availableCount === data.totalProducts

                    return (
                      <Card
                        key={platform.id}
                        className={`glassmorphism ${isCheapest && isFullyAvailable ? "ring-2 ring-green-500 animate-glow" : ""}`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: platform.color }}></div>
                              <span className="font-semibold">{platform.name}</span>
                            </div>
                            {isCheapest && isFullyAvailable && (
                              <Badge className="bg-green-500 text-white">Cheapest</Badge>
                            )}
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Total:</span>
                              <span className="font-bold text-lg">₹{data.total}</span>
                            </div>

                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Available:</span>
                              <span className={`text-sm ${isFullyAvailable ? "text-green-600" : "text-red-600"}`}>
                                {data.availableCount}/{data.totalProducts}
                              </span>
                            </div>

                            {data.savings > 0 && (
                              <div className="text-sm text-red-600">+₹{data.savings} vs cheapest</div>
                            )}

                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full mt-2 hover-glow bg-transparent"
                              onClick={() => openPlatformSearch(platform.id)}
                              disabled={!isFullyAvailable}
                            >
                              <ExternalLink className="w-3 h-3 mr-1" />
                              Go to {platform.name}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Detailed Product Comparison */}
            <Card className="glassmorphism">
              <CardHeader>
                <CardTitle>Product-wise Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-4 font-semibold">Product</th>
                        {platforms.map((platform) => (
                          <th key={platform.id} className="text-center p-4 font-semibold">
                            <div className="flex items-center justify-center space-x-2">
                              <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: platform.color }}></div>
                              <span>{platform.name}</span>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {comparisonData.products.map((product: Product, index: number) => {
                        const lowestPricePlatform = getLowestPricePlatform(product.prices)
                        const uniqueProductId = getProductId(product)

                        return (
                          <tr
                            key={uniqueProductId}
                            className={`border-b border-border hover:bg-muted/50 transition-colors ${index % 2 === 0 ? "bg-muted/20" : ""}`}
                          >
                            <td className="p-4">
                              <div className="flex items-center space-x-3">
                                <img
                                  src={product.image || "/placeholder.svg"}
                                  alt={product.name}
                                  className="w-12 h-12 object-cover rounded-lg"
                                />
                                <div>
                                  <div className="font-medium">{product.name}</div>
                                  <div className="text-sm text-muted-foreground">Rating: {product.rating}★</div>
                                </div>
                              </div>
                            </td>
                            {platforms.map((platform) => {
                              const price = product.prices[platform.id as keyof typeof product.prices]
                              const isAvailable = product.availability[platform.id as keyof typeof product.availability]
                              const isLowest = platform.id === lowestPricePlatform
                              const deliveryTime =
                                product.deliveryTime[platform.id as keyof typeof product.deliveryTime]

                              return (
                                <td key={platform.id} className="p-4 text-center">
                                  {isAvailable ? (
                                    <div className="space-y-1">
                                      <div
                                        className={`font-semibold ${isLowest ? "text-green-600" : "text-foreground"}`}
                                      >
                                        ₹{price}
                                        {isLowest && (
                                          <Badge
                                            variant="secondary"
                                            className="ml-1 bg-green-100 text-green-800 text-xs"
                                          >
                                            Lowest
                                          </Badge>
                                        )}
                                      </div>
                                      <div className="flex items-center justify-center space-x-1 text-xs text-muted-foreground">
                                        <Clock className="w-3 h-3" />
                                        <span>{deliveryTime}</span>
                                      </div>
                                      <CheckCircle className="w-4 h-4 text-green-500 mx-auto" />
                                    </div>
                                  ) : (
                                    <div className="space-y-1">
                                      <div className="text-red-500 text-sm">Out of Stock</div>
                                      <XCircle className="w-4 h-4 text-red-500 mx-auto" />
                                    </div>
                                  )}
                                </td>
                              )
                            })}
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
