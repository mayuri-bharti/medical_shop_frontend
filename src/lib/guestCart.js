/**
 * Guest Cart Utility
 * Manages cart for non-logged-in users using localStorage
 */

import { broadcastCartUpdate } from './cartEvents'

const GUEST_CART_KEY = 'guest_cart'

/**
 * Get guest cart from localStorage
 */
export const getGuestCart = () => {
  try {
    const cartData = localStorage.getItem(GUEST_CART_KEY)
    if (cartData) {
      return JSON.parse(cartData)
    }
  } catch (error) {
    console.error('Error reading guest cart:', error)
  }
  return {
    items: [],
    subtotal: 0,
    deliveryFee: 50,
    taxes: 0,
    total: 0
  }
}

/**
 * Save guest cart to localStorage
 */
export const saveGuestCart = (cart) => {
  try {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart))
  } catch (error) {
    console.error('Error saving guest cart:', error)
  }
}

/**
 * Calculate cart totals
 */
const calculateTotals = (items) => {
  const subtotal = items.reduce((total, item) => {
    return total + (Number(item.price) || 0) * (Number(item.quantity) || 0)
  }, 0)
  
  // Free delivery above ₹499
  const deliveryFee = subtotal >= 499 ? 0 : 50
  
  // Calculate taxes (18% GST)
  const taxes = Math.round(subtotal * 0.18)
  
  const total = subtotal + deliveryFee + taxes
  
  return { subtotal, deliveryFee, taxes, total }
}

/**
 * Add item to guest cart
 */
export const addToGuestCart = ({ itemType = 'product', productId, medicineId, quantity = 1, price, name, image }) => {
  const cart = getGuestCart()
  
  // Find existing item
  const existingItemIndex = cart.items.findIndex((item) => {
    if (itemType === 'medicine') {
      return item.itemType === 'medicine' && item.medicineId === medicineId
    }
    return item.itemType === 'product' && item.productId === productId
  })
  
  if (existingItemIndex >= 0) {
    // Update quantity
    cart.items[existingItemIndex].quantity += quantity
  } else {
    // Add new item
    cart.items.push({
      itemType,
      productId: productId || null,
      medicineId: medicineId || null,
      quantity,
      price: Number(price) || 0,
      name: name || '',
      image: image || ''
    })
  }
  
  // Recalculate totals
  const totals = calculateTotals(cart.items)
  cart.subtotal = totals.subtotal
  cart.deliveryFee = totals.deliveryFee
  cart.taxes = totals.taxes
  cart.total = totals.total
  
  saveGuestCart(cart)
  
  // Broadcast cart update
  broadcastCartUpdate(cart)
  
  return cart
}

/**
 * Update item quantity in guest cart
 */
export const updateGuestCartItem = ({ itemType = 'product', productId, medicineId, quantity }) => {
  const cart = getGuestCart()
  
  const itemIndex = cart.items.findIndex((item) => {
    if (itemType === 'medicine') {
      return item.itemType === 'medicine' && item.medicineId === medicineId
    }
    return item.itemType === 'product' && item.productId === productId
  })
  
  if (itemIndex >= 0) {
    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1)
    } else {
      cart.items[itemIndex].quantity = quantity
    }
    
    // Recalculate totals
    const totals = calculateTotals(cart.items)
    cart.subtotal = totals.subtotal
    cart.deliveryFee = totals.deliveryFee
    cart.taxes = totals.taxes
    cart.total = totals.total
    
    saveGuestCart(cart)
    
    // Broadcast cart update
    broadcastCartUpdate(cart)
    
    return cart
  }
  
  return cart
}

/**
 * Remove item from guest cart
 */
export const removeFromGuestCart = ({ itemType = 'product', productId, medicineId }) => {
  const cart = getGuestCart()
  
  cart.items = cart.items.filter((item) => {
    if (itemType === 'medicine') {
      return !(item.itemType === 'medicine' && item.medicineId === medicineId)
    }
    return !(item.itemType === 'product' && item.productId === productId)
  })
  
  // Recalculate totals
  const totals = calculateTotals(cart.items)
  cart.subtotal = totals.subtotal
  cart.deliveryFee = totals.deliveryFee
  cart.taxes = totals.taxes
  cart.total = totals.total
  
  saveGuestCart(cart)
  
  // Broadcast cart update
  broadcastCartUpdate(cart)
  
  return cart
}

/**
 * Clear guest cart
 */
export const clearGuestCart = () => {
  localStorage.removeItem(GUEST_CART_KEY)
}

/**
 * Get cart item count
 */
export const getGuestCartItemCount = () => {
  const cart = getGuestCart()
  return cart.items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0)
}

/**
 * Merge guest cart with user cart (for when user logs in)
 * Returns items that need to be synced to server
 */
export const getGuestCartItems = () => {
  const cart = getGuestCart()
  return cart.items || []
}

