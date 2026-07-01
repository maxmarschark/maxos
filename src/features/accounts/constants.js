export const ACCOUNTS_STORAGE_KEY = "max-os-accounts"

export const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
]

export const SORT_FIELDS = {
  businessName: "Business Name",
  state: "State",
  outstandingBalance: "Balance",
  lastVisit: "Last Visit",
  nextFollowUp: "Next Follow-up",
}

export const EMPTY_ACCOUNT = {
  businessName: "",
  owner: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  state: "TX",
  website: "",
  brandsCarried: [],
  outstandingBalance: 0,
  lastVisit: null,
  nextFollowUp: null,
}
