import { generateId } from "../../lib/id"
import { loadFromStorage } from "../../lib/storage"
import { ACCOUNTS_STORAGE_KEY } from "../accounts/constants"
import { SEED_ACCOUNTS } from "../accounts/seed"
import { BRANDS_STORAGE_KEY } from "../brands/constants"
import { SEED_BRANDS } from "../brands/seed"
import { calcCommissionAmount } from "./utils"

function findAccount(accounts, name) {
  return accounts.find((a) => a.businessName === name)
}

function findBrand(brands, name) {
  return brands.find((b) => b.brandName === name)
}

function order(data) {
  const commissionAmount = calcCommissionAmount(data.orderAmount, data.commissionPercent)
  const now = new Date().toISOString()
  return {
    id: generateId(),
    commissionAmount,
    createdAt: now,
    updatedAt: now,
    ...data,
  }
}

export function buildSeedOrders() {
  const accounts = loadFromStorage(ACCOUNTS_STORAGE_KEY, SEED_ACCOUNTS)
  const brands = loadFromStorage(BRANDS_STORAGE_KEY, SEED_BRANDS)

  const greenLeaf = findAccount(accounts, "Green Leaf Dispensary")
  const sunrise = findAccount(accounts, "Sunrise Smoke Shop")
  const cloudNine = findAccount(accounts, "Cloud Nine Retail")
  const valleyHemp = findAccount(accounts, "Valley Hemp Co.")
  const hempCo = findAccount(accounts, "HempCo Wholesale")
  const rockyMountain = findAccount(accounts, "Rocky Mountain Vapes")

  const mitWellness = findBrand(brands, "MitWellness")
  const thrive = findBrand(brands, "Thrive Supreme")
  const noko = findBrand(brands, "NOKO")
  const sherpa = findBrand(brands, "Sherpa")
  const totallyBaked = findBrand(brands, "Totally Baked")
  const hyeHarvest = findBrand(brands, "HYE Harvest")

  const seeds = [
    {
      account: hempCo,
      brand: noko,
      orderNumber: "1042",
      orderDate: "2025-06-27",
      productsNotes: "Original Blend Pre-Roll 5pk x 40, Mint Chill Pre-Roll 5pk x 20, NOKO Display Unit x 2",
      orderAmount: 2100,
      commissionPercent: noko?.commissionDefault ?? 10,
      orderStatus: "Confirmed",
      paymentStatus: "Unpaid",
      paymentDueDate: "2025-07-05",
      notes: "Pending 72hrs — confirm before 2 PM Friday to avoid cancellation.",
    },
    {
      account: greenLeaf,
      brand: totallyBaked,
      orderNumber: "1038",
      orderDate: "2025-06-20",
      productsNotes: "Cosmic Brownie 100mg x 24, Galaxy Gummies 10pk x 12",
      orderAmount: 1420,
      commissionPercent: totallyBaked?.commissionDefault ?? 13,
      orderStatus: "Delivered",
      paymentStatus: "Unpaid",
      paymentDueDate: "2025-06-25",
      notes: "5 days overdue — collect in person.",
    },
    {
      account: sunrise,
      brand: noko,
      orderNumber: "1045",
      orderDate: "2025-06-28",
      productsNotes: "Original Blend Pre-Roll 5pk x 30, Mint Chill Pre-Roll 5pk x 30",
      orderAmount: 1080,
      commissionPercent: noko?.commissionDefault ?? 10,
      orderStatus: "Shipped",
      paymentStatus: "Unpaid",
      paymentDueDate: "2025-07-10",
      notes: "Log commission after delivery confirmation.",
    },
    {
      account: cloudNine,
      brand: mitWellness,
      orderNumber: "1046",
      orderDate: "2025-06-29",
      productsNotes: "Green Maeng Da Caps x 18, Calm Blend Shot x 12 — sample order",
      orderAmount: 680,
      commissionPercent: mitWellness?.commissionDefault ?? 12,
      orderStatus: "Sent",
      paymentStatus: "Unpaid",
      paymentDueDate: "2025-07-08",
      notes: "Warm lead — requested full catalog after samples.",
    },
    {
      account: valleyHemp,
      brand: thrive,
      orderNumber: "1047",
      orderDate: "2025-06-26",
      productsNotes: "Lion's Mane Focus x 15, Daily Immunity Gummies x 20, Reishi Sleep Drops x 10",
      orderAmount: 1580,
      commissionPercent: thrive?.commissionDefault ?? 15,
      orderStatus: "Confirmed",
      paymentStatus: "Partially Paid",
      paymentDueDate: "2025-06-30",
      notes: "Pick up remaining units on next visit.",
    },
    {
      account: rockyMountain,
      brand: sherpa,
      orderNumber: "1035",
      orderDate: "2025-06-15",
      productsNotes: "Base Camp Flower 3.5g x 20, Summit Live Resin 1g x 8",
      orderAmount: 950,
      commissionPercent: sherpa?.commissionDefault ?? 14,
      orderStatus: "Delivered",
      paymentStatus: "Partially Paid",
      paymentDueDate: "2025-06-28",
      notes: "Balance due on next reorder.",
    },
    {
      account: greenLeaf,
      brand: mitWellness,
      orderNumber: "1040",
      orderDate: "2025-06-22",
      productsNotes: "Calm Blend Shot x 24, Green Maeng Da Caps x 12",
      orderAmount: 890,
      commissionPercent: mitWellness?.commissionDefault ?? 12,
      orderStatus: "Shipped",
      paymentStatus: "Paid",
      paymentDueDate: "2025-07-01",
      notes: "",
    },
    {
      account: hempCo,
      brand: totallyBaked,
      orderNumber: "1039",
      orderDate: "2025-06-18",
      productsNotes: "Galaxy Gummies 10pk x 40, Nebula Chocolate Bar x 20",
      orderAmount: 1240,
      commissionPercent: totallyBaked?.commissionDefault ?? 13,
      orderStatus: "Delivered",
      paymentStatus: "Paid",
      paymentDueDate: "2025-06-25",
      notes: "",
    },
    {
      account: sunrise,
      brand: thrive,
      orderNumber: "1043",
      orderDate: "2025-06-24",
      productsNotes: "Daily Immunity Gummies x 25, Reishi Sleep Drops x 15",
      orderAmount: 720,
      commissionPercent: thrive?.commissionDefault ?? 15,
      orderStatus: "Draft",
      paymentStatus: "Unpaid",
      paymentDueDate: "2025-07-12",
      notes: "Draft — waiting on buyer confirmation.",
    },
    {
      account: valleyHemp,
      brand: hyeHarvest,
      orderNumber: "1044",
      orderDate: "2025-06-30",
      productsNotes: "Texas Haze 3.5g x 10, Field Notes Pre-Roll 2pk x 15",
      orderAmount: 540,
      commissionPercent: hyeHarvest?.commissionDefault ?? 11,
      orderStatus: "Sent",
      paymentStatus: "Unpaid",
      paymentDueDate: "2025-07-15",
      notes: "New partnership trial order.",
    },
    {
      account: cloudNine,
      brand: noko,
      orderNumber: "1041",
      orderDate: "2025-06-10",
      productsNotes: "Original Blend Pre-Roll 5pk x 50",
      orderAmount: 900,
      commissionPercent: noko?.commissionDefault ?? 10,
      orderStatus: "Cancelled",
      paymentStatus: "Unpaid",
      paymentDueDate: null,
      notes: "Buyer switched to competitor line.",
    },
    {
      account: rockyMountain,
      brand: mitWellness,
      orderNumber: "1036",
      orderDate: "2025-06-08",
      productsNotes: "Green Maeng Da Caps x 30",
      orderAmount: 720,
      commissionPercent: 12,
      orderStatus: "Delivered",
      paymentStatus: "Paid",
      paymentDueDate: "2025-06-20",
      notes: "",
    },
  ]

  return seeds
    .filter((s) => s.account && s.brand)
    .map((s) =>
      order({
        orderNumber: s.orderNumber,
        accountId: s.account.id,
        brandId: s.brand.id,
        orderDate: s.orderDate,
        productsNotes: s.productsNotes,
        orderAmount: s.orderAmount,
        commissionPercent: s.commissionPercent,
        orderStatus: s.orderStatus,
        paymentStatus: s.paymentStatus,
        paymentDueDate: s.paymentDueDate,
        notes: s.notes,
      })
    )
}
