import { LOCALES } from '../i18n/locales'

export const FREE_LISTING_LIMIT = 3
export const PLUS_LISTING_LIMIT = 10

export const BUSINESS_TYPES = ['Farm', 'Farmers market vendor', 'Grocery/store', 'Other']

export function businessTypeLabel(type, lang = 'en') {
  const dict = LOCALES[lang] ?? LOCALES.en
  return dict[`businessTypes.${type}`] ?? LOCALES.en[`businessTypes.${type}`] ?? type
}

export function getListingLimit(account) {
  if (account.type === 'business') return Infinity
  return account.subscription === 'plus' ? PLUS_LISTING_LIMIT : FREE_LISTING_LIMIT
}

export function countActiveListings(listings) {
  return listings.filter((listing) => !listing.demo).length
}

export function canCreateListing(account, listings) {
  const limit = getListingLimit(account)
  if (limit === Infinity) return true
  return countActiveListings(listings) < limit
}
