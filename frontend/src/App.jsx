import { useState } from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Auth, Tree, Line } from '@pages'

const App = () => {
  const [authorized, setAuthorized] = useState(false)

    if (authorized) {
      return (
        <BrowserRouter>
          <Routes>
            <Route path="/">
              <Route index element={<Tree/>} />
              <Route path="*" element={<Line/>} />
            </Route>
          </Routes>
        </BrowserRouter>
      )
    } else {
      return ( <Auth authorized={authorized} setAuthorized={setAuthorized} /> )
    }
}

export default App
