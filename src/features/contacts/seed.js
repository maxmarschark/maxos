import { generateId } from "../../lib/id"
import { loadFromStorage } from "../../lib/storage"
import { ACCOUNTS_STORAGE_KEY } from "../accounts/constants"
import { SEED_ACCOUNTS } from "../accounts/seed"
import { BRANDS_STORAGE_KEY } from "../brands/constants"
import { SEED_BRANDS } from "../brands/seed"

function findAccount(accounts, name) {
  return accounts.find((a) => a.businessName === name)
}

function findBrand(brands, name) {
  return brands.find((b) => b.brandName === name)
}

function contact(data) {
  const now = new Date().toISOString()
  return {
    id: generateId(),
    createdAt: now,
    updatedAt: now,
    ...data,
  }
}

export function buildSeedContacts() {
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

  const seeds = [
    {
      firstName: "Marcus",
      lastName: "Chen",
      accountId: greenLeaf?.id ?? "",
      brandId: "",
      company: "",
      role: "Owner",
      type: "Owner",
      phone: "(512) 555-0142",
      email: "marcus@greenleafdisp.com",
      preferredContactMethod: "Call",
      city: "Austin",
      state: "TX",
      notes: "Prefers in-person visits. Best reached before noon.",
      lastContactDate: "2025-06-25",
      nextFollowUpDate: "2025-07-01",
    },
    {
      firstName: "Diana",
      lastName: "Reyes",
      accountId: sunrise?.id ?? "",
      brandId: "",
      company: "",
      role: "Owner / Buyer",
      type: "Buyer",
      phone: "(512) 555-0890",
      email: "diana@sunrisesmoke.com",
      preferredContactMethod: "Text",
      city: "Austin",
      state: "TX",
      notes: "High NOKO velocity — keep display stocked.",
      lastContactDate: "2025-06-28",
      nextFollowUpDate: "2025-07-05",
    },
    {
      firstName: "James",
      lastName: "Okonkwo",
      accountId: cloudNine?.id ?? "",
      brandId: "",
      company: "",
      role: "Store Manager",
      type: "Retailer",
      phone: "(737) 555-0445",
      email: "james@cloudnineretail.com",
      preferredContactMethod: "Email",
      city: "Austin",
      state: "TX",
      notes: "Requested full catalog — warm lead after sample delivery.",
      lastContactDate: "2025-06-18",
      nextFollowUpDate: "2025-07-02",
    },
    {
      firstName: "Tom",
      lastName: "Bradley",
      accountId: hempCo?.id ?? "",
      brandId: "",
      company: "",
      role: "Purchasing Director",
      type: "Distributor",
      phone: "(210) 555-0317",
      email: "tom@hempcowholesale.com",
      preferredContactMethod: "Call",
      city: "San Antonio",
      state: "TX",
      notes: "Order #1042 pending — confirm shipment ASAP.",
      lastContactDate: "2025-06-27",
      nextFollowUpDate: "2025-07-01",
    },
    {
      firstName: "Sarah",
      lastName: "Mitchell",
      accountId: valleyHemp?.id ?? "",
      brandId: "",
      company: "",
      role: "Buyer",
      type: "Buyer",
      phone: "(512) 555-0220",
      email: "sarah@valleyhemp.co",
      preferredContactMethod: "Email",
      city: "Round Rock",
      state: "TX",
      notes: "Interested in Thrive Supreme line for Q3.",
      lastContactDate: "2025-06-22",
      nextFollowUpDate: "2025-06-30",
    },
    {
      firstName: "Elena",
      lastName: "Vasquez",
      accountId: rockyMountain?.id ?? "",
      brandId: "",
      company: "",
      role: "Owner",
      type: "Owner",
      phone: "(303) 555-0198",
      email: "elena@rmvapes.com",
      preferredContactMethod: "Text",
      city: "Denver",
      state: "CO",
      notes: "Colorado account — Sherpa performing well.",
      lastContactDate: "2025-06-10",
      nextFollowUpDate: "2025-07-08",
    },
    {
      firstName: "Alex",
      lastName: "Rivera",
      accountId: "",
      brandId: mitWellness?.id ?? "",
      company: "MitWellness",
      role: "Regional Sales Rep",
      type: "Rep",
      phone: "(512) 555-0201",
      email: "alex@mitwellness.com",
      preferredContactMethod: "Call",
      city: "Austin",
      state: "TX",
      notes: "Primary brand contact for Austin metro.",
      lastContactDate: "2025-06-28",
      nextFollowUpDate: "2025-07-10",
    },
    {
      firstName: "Sam",
      lastName: "Ortiz",
      accountId: "",
      brandId: noko?.id ?? "",
      company: "NOKO",
      role: "Account Manager",
      type: "Brand",
      phone: "(512) 555-0448",
      email: "sam@nokosmoke.com",
      preferredContactMethod: "Email",
      city: "Austin",
      state: "TX",
      notes: "Coordinates display units and co-op marketing.",
      lastContactDate: "2025-06-29",
      nextFollowUpDate: "2025-07-06",
    },
    {
      firstName: "Jordan",
      lastName: "Lee",
      accountId: "",
      brandId: thrive?.id ?? "",
      company: "Thrive Supreme",
      role: "Brand Ambassador",
      type: "Brand",
      phone: "(737) 555-0312",
      email: "jordan@thrivesupreme.co",
      preferredContactMethod: "Text",
      city: "Austin",
      state: "TX",
      notes: "Pushing mushroom supplements into smoke shops.",
      lastContactDate: "2025-06-25",
      nextFollowUpDate: "2025-07-12",
    },
    {
      firstName: "Priya",
      lastName: "Sharma",
      accountId: "",
      brandId: sherpa?.id ?? "",
      company: "Sherpa",
      role: "Territory Rep",
      type: "Rep",
      phone: "(303) 555-0177",
      email: "priya@sherpahemp.com",
      preferredContactMethod: "Call",
      city: "Denver",
      state: "CO",
      notes: "Texas expansion lead — samples in Austin pipeline.",
      lastContactDate: "2025-06-20",
      nextFollowUpDate: "2025-07-15",
    },
    {
      firstName: "Chris",
      lastName: "Nguyen",
      accountId: "",
      brandId: totallyBaked?.id ?? "",
      company: "Totally Baked",
      role: "Sales Director",
      type: "Brand",
      phone: "(512) 555-0555",
      email: "chris@totallybaked.com",
      preferredContactMethod: "Email",
      city: "Austin",
      state: "TX",
      notes: "Seasonal flavor updates — check Q3 menu.",
      lastContactDate: "2025-06-27",
      nextFollowUpDate: "2025-07-20",
    },
  ]

  return seeds.map((s) => contact(s))
}
