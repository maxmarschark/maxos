import { useContext } from "react"
import { BrandsContext } from "./brands-context"

export function useBrands() {
  const ctx = useContext(BrandsContext)
  if (!ctx) {
    throw new Error("useBrands must be used within BrandsProvider")
  }
  return ctx
}
