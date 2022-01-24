import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Tree, Line } from '@pages'

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/">
          <Route index element={<Tree>} />
          <Route path="*" element={<Line>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App
