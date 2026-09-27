import React from "react";
import { Outlet } from "react-router-dom";

import CandidateNav from "./CandidateNav";

function CandidateLayout() {
  return (
    <>
      <CandidateNav />
      <Outlet />
    </>
  );
}

export default CandidateLayout;