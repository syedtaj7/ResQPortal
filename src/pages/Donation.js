import React, { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { ArrowRight, Lock } from "lucide-react";

const Donation = () => {
  const [donationType, setDonationType] = useState("one-time");
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [showComment, setShowComment] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />
      <div className="flex-grow flex flex-col items-center justify-center py-10 md:ml-28">
        <div className="bg-white rounded-lg shadow-md w-full max-w-md overflow-hidden border border-gray-200">
          {/* Yellow header section */}
          <div className="bg-[#FFD54F] p-6 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">Choose amount</h2>
            <div className="flex items-center gap-4">
              <Lock size={18} className="text-gray-600" />
              <div className="flex gap-2">
                <div className="w-4 h-4 rounded-full bg-black"></div>
                <div className="w-4 h-4 rounded-full border border-gray-400"></div>
                <div className="w-4 h-4 rounded-full border border-gray-400"></div>
              </div>
              <ArrowRight size={20} />
            </div>
          </div>

          <div className="p-6">
            {/* Donation type toggle */}
            <div className="flex justify-center mb-6">
              <div className="inline-flex rounded-md border border-[#FFD54F] overflow-hidden">
                <button
                  className={`px-6 py-2 text-sm font-medium ${
                    donationType === "one-time" ? "bg-[#FFD54F]" : "bg-white"
                  }`}
                  onClick={() => setDonationType("one-time")}
                >
                  One-time
                </button>
                <button
                  className={`px-6 py-2 text-sm font-medium ${
                    donationType === "monthly" ? "bg-[#FFD54F]" : "bg-white"
                  }`}
                  onClick={() => setDonationType("monthly")}
                >
                  Monthly
                </button>
              </div>
            </div>

            {/* Donation amount options */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              {["25", "50", "100"].map((amount) => (
                <button
                  key={amount}
                  className={`border ${
                    selectedAmount === amount
                      ? "border-[#FFD54F] ring-2 ring-[#FFD54F]/50"
                      : "border-gray-300"
                  } rounded-md p-4 flex justify-center items-center hover:border-[#FFD54F]`}
                  onClick={() => {
                    setSelectedAmount(amount);
                    setCustomAmount("");
                  }}
                >
                  <span className="text-gray-700 text-xl">₹ {amount}</span>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <button
                className={`border ${
                  selectedAmount === "500"
                    ? "border-[#FFD54F] ring-2 ring-[#FFD54F]/50"
                    : "border-gray-300"
                } rounded-md p-4 flex justify-center items-center hover:border-[#FFD54F]`}
                onClick={() => {
                  setSelectedAmount("500");
                  setCustomAmount("");
                }}
              >
                <span className="text-gray-700 text-xl">₹ 500</span>
              </button>
              <div className="col-span-2"></div>
            </div>

            {/* Custom amount input */}
            <div className="mb-6">
              <div
                className={`border ${
                  customAmount
                    ? "border-[#FFD54F] ring-2 ring-[#FFD54F]/50"
                    : "border-gray-300"
                } rounded-md p-4 flex items-center hover:border-[#FFD54F]`}
                onClick={() => setSelectedAmount(null)}
              >
                <span className="text-gray-700 text-xl mr-2">₹</span>
                <input
                  type="text"
                  className="flex-grow text-gray-700 text-xl outline-none"
                  placeholder="Custom Amount"
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value);
                    setSelectedAmount(null);
                  }}
                />
              </div>
            </div>

            {/* Employer donation matching */}
            <div className="border border-gray-300 rounded-md p-4 mb-6">
              <div className="mb-2">
                <label className="text-gray-600 mb-1 block">
                  Disaster Relief Fund
                </label>
                <input
                  type="text"
                  className="w-full border-b border-gray-300 pb-1 outline-none"
                  placeholder="Eg.assam floods"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>
            </div>

            {/* Comment checkbox */}
            <div className="mb-6 flex items-center">
              <input
                type="checkbox"
                id="comment"
                className="mr-2"
                checked={showComment}
                onChange={() => setShowComment(!showComment)}
              />
              <label htmlFor="comment" className="text-gray-600">
                Write us a comment
              </label>
            </div>

            {/* Next button */}
            <button
              className="w-full bg-[#FFD54F] hover:bg-[#FFCA28] text-gray-800 font-medium py-3 px-4 rounded-md flex items-center justify-center gap-2"
              type="button"
            >
              <span>Next</span>
              <ArrowRight size={18} />
            </button>

            {/* Powered by text */}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Donation;
