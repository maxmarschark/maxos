export const BRANDS_STORAGE_KEY = "max-os-brands"

export const BRAND_STATUSES = ["Active", "Prospect", "Paused"]

export const STATUS_VARIANTS = {
  Active: "success",
  Prospect: "primary",
  Paused: "warning",
}

export const EMPTY_BRAND = {
  brandName: "",
  description: "",
  website: "",
  mainContact: "",
  contactEmail: "",
  contactPhone: "",
  commissionDefault: 0,
  status: "Active",
  notes: "",
  monthlySales: 0,
}

export const EMPTY_PRODUCT = {
  productName: "",
  sku: "",
  category: "",
  distributorPrice: 0,
  wholesalePrice: 0,
  msrp: 0,
  commissionOverride: null,
  notes: "",
}

export const PRODUCT_CATEGORIES = [
  "Flower",
  "Pre-Rolls",
  "Edibles",
  "Vapes",
  "Concentrates",
  "Tinctures",
  "Topicals",
  "Drinks",
  "Accessories",
]
