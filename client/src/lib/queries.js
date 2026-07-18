import api from '../lib/api'

export const queryKeys = {
  business: ['business'],
  bookings: ['bookings'],
  slots: (date) => ['slots', 'mine', date],
  slotStats: ['slots', 'stats'],
  shops: (params) => ['shops', params],
  shop: (id) => ['shops', id],
  adminBusinesses: ['admin', 'businesses'],
  adminBookings: ['admin', 'bookings'],
  adminUsers: ['admin', 'users'],
  featuredShops: ['shops', 'featured'],
  nearestShops: ['shops', 'nearest'],
}

export async function fetchBusiness() {
  const { data } = await api.get('/businesses/mine')
  return data.business
}

export async function fetchBookings() {
  const { data } = await api.get('/bookings/owner')
  return data.bookings
}

export async function fetchSlots(date) {
  const { data } = await api.get('/slots/mine', { params: { date } })
  return data.slots
}

export async function fetchSlotStats() {
  const { data } = await api.get('/slots/stats')
  return data
}

export async function fetchShops(params) {
  if (params?.lat && params?.lng) {
    const { data } = await api.get('/businesses/nearest', { params })
    return data.businesses
  }
  const { data } = await api.get('/businesses', { params })
  return data.businesses
}

export async function fetchShop(id) {
  const { data } = await api.get(`/businesses/${id}`)
  return data.business
}

export async function fetchAdminBusinesses() {
  const { data } = await api.get('/admin/businesses')
  return data.businesses
}

export async function fetchAdminBookings() {
  const { data } = await api.get('/admin/bookings')
  return data.bookings
}

export async function fetchAdminUsers() {
  const { data } = await api.get('/admin/users')
  return data.users
}
