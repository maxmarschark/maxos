export const CONTACTS_STORAGE_KEY = "max-os-contacts"
export const IMPORT_BATCHES_STORAGE_KEY = "max-os-import-batches"

export const CONTACT_TYPES = [
  "Retailer",
  "Distributor",
  "Brand",
  "Buyer",
  "Owner",
  "Rep",
  "Other",
]

export const PREFERRED_CONTACT_METHODS = ["Call", "Text", "Email"]

export const DUPLICATE_ACTIONS = ["skip", "replace", "merge"]

export const TYPE_VARIANTS = {
  Retailer: "primary",
  Distributor: "warning",
  Brand: "success",
  Buyer: "primary",
  Owner: "success",
  Rep: "default",
  Other: "default",
}

export const EMPTY_CONTACT = {
  firstName: "",
  lastName: "",
  accountId: "",
  brandId: "",
  company: "",
  role: "",
  type: "Buyer",
  phone: "",
  email: "",
  preferredContactMethod: "Call",
  city: "",
  state: "TX",
  notes: "",
  lastContactDate: null,
  nextFollowUpDate: null,
  importBatchId: null,
}

export const EMPTY_IMPORT_BATCH = {
  fileName: "",
  contactCount: 0,
  contactIds: [],
}
