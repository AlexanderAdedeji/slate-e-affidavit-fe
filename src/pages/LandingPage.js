import React from "react";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {

    const navigate =useNavigate()
  return (
    <div>
      Welcome To E-affidavit Appliocation
      <div>
        Who are you?
        <button onClick={()=> navigate("/create-template")}>I am An Admin</button>
        <button onClick={()=> navigate("/my-documents")}> I am An End User</button>
      </div>
    </div>
  );
};

export default LandingPage;
