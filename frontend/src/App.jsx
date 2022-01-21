import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GEDCOM, BIORG } from '@pages'

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/">
          <Route index element={<GEDCOM />} />
          <Route path="*" element={<BIORG />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App
