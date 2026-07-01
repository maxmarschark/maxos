import { RouterProvider } from "react-router-dom"
import { router } from "./app/router"
import { GoogleCalendarProvider } from "./features/google-calendar/GoogleCalendarProvider"
import { GmailProvider } from "./features/gmail/GmailProvider"

function App() {
  return (
    <GoogleCalendarProvider>
      <GmailProvider>
        <RouterProvider router={router} />
      </GmailProvider>
    </GoogleCalendarProvider>
  )
}

export default App
