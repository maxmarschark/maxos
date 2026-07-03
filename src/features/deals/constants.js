export const DEALS_STORAGE_KEY = "max-os-deals"

export const DEAL_STAGES = ["Prospect", "Qualified", "Proposal", "Negotiation", "Won", "Lost"]

export const STAGE_VARIANTS = {
  Prospect: "default",
  Qualified: "primary",
  Proposal: "primary",
  Negotiation: "warning",
  Won: "success",
  Lost: "danger",
}

export const EMPTY_DEAL = {
  title: "",
  accountId: "",
  brandId: "",
  stage: "Prospect",
  value: 0,
  notes: "",
}
