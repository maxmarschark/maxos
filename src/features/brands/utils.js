import { ACCOUNTS_STORAGE_KEY } from "../accounts/constants"
import { SEED_ACCOUNTS } from "../accounts/seed"
import { loadFromStorage } from "../../lib/storage"

export function getActiveAccountCount(brandName) {
  const accounts = loadFromStorage(ACCOUNTS_STORAGE_KEY, SEED_ACCOUNTS)
  return accounts.filter((a) =>
    a.brandsCarried?.some(
      (b) => b.toLowerCase() === brandName.toLowerCase()
    )
  ).length
}

export function getAccountsForBrand(brandName) {
  const accounts = loadFromStorage(ACCOUNTS_STORAGE_KEY, SEED_ACCOUNTS)
  return accounts.filter((a) =>
    a.brandsCarried?.some(
      (b) => b.toLowerCase() === brandName.toLowerCase()
    )
  )
}
