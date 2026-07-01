import { Outlet } from "react-router-dom"
import { BrandsProvider } from "./BrandsProvider"

export function BrandsLayout() {
  return (
    <BrandsProvider>
      <Outlet />
    </BrandsProvider>
  )
}
