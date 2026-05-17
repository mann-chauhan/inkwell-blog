import React, { useState, useEffect } from "react";
import Header from "./Components/Header/Header";
import Pages from "./Pages/Pages";
import { BrowserRouter } from "react-router-dom";
import "./i18n";

function App() {
  const [headerHeight, setHeaderHeight] = useState(56);

  useEffect(() => {
    const saved = localStorage.getItem("inkwell-theme") || "dark";
    document.documentElement.setAttribute("data-theme", saved);
  }, []);

  return (
    <BrowserRouter>
      <Header onHeightChange={setHeaderHeight} />
      <Pages headerHeight={headerHeight} footerHeight={0} />
    </BrowserRouter>
  );
}

export default App;
