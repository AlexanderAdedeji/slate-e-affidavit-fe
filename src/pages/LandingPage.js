import React from "react";
import { useNavigate } from "react-router-dom";
import {  toast } from 'react-toastify';

const LandingPage = () => {
  const navigate = useNavigate();
  return (
    <div class="flex flex-col justify-center items-center h-screen">
      <h1 class="text-3xl font-bold mb-4">
        Welcome To E-affidavit Application
      </h1>
      <div class="text-center">
        <p class="text-xl mb-2">Who are you?</p>
        <div class="flex gap-4">
          <button
            class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => { toast.success("Welcome Admin!!");navigate("/create-template")}}
          >
            I am An Admin
          </button>
          <button
            class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => navigate("/my-documents")}
          >
            I am An End User
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
