import { RouterProvider } from "react-router-dom"
import { router } from "./app/router"
import { GoogleCalendarProvider } from "./features/google-calendar/GoogleCalendarProvider"

function App() {
  return (
    <GoogleCalendarProvider>
      <RouterProvider router={router} />
    </GoogleCalendarProvider>
  )
}

export default App
