export const BRAND_FILES_BUCKET = "brand-files"

/** UI label: Asset Type. Stored in brand_files.category column. */
export const ASSET_TYPES = [
  "Sales Sheet",
  "Catalog",
  "Price List",
  "Marketing",
  "Images",
  "Logos",
  "COA / Lab Results",
  "Compliance",
  "Contracts",
  "Training",
  "Video",
  "Other",
]

/** @deprecated Use ASSET_TYPES — kept for imports that reference FILE_CATEGORIES */
export const FILE_CATEGORIES = ASSET_TYPES

export const DEFAULT_ASSET_TYPE = "Other"

/** @deprecated Use DEFAULT_ASSET_TYPE */
export const DEFAULT_FILE_CATEGORY = DEFAULT_ASSET_TYPE

/** Maps legacy category values from earlier uploads to current asset types. */
export const LEGACY_CATEGORY_MAP = {
  Pricing: "Price List",
}

export const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024
