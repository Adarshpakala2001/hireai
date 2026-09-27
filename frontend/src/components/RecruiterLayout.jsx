import React from "react";
import { Outlet } from "react-router-dom";

import RecruiterNav from "./RecruiterNav";

function RecruiterLayout() {
  return (
    <>
      <RecruiterNav />
      <Outlet />
    </>
  );
}

export default RecruiterLayout;