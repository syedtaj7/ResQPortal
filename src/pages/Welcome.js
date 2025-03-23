import React from "react";
import Header from "../components/Header";

function Welcome() {
  // Define icon positions - scattered around like in the GitHub image
  const iconPositions = [
    {
      name: "icons8-helicopter-64",
      top: "10%",
      left: "35%",
      rotation: "-5deg",
    }, // Shifted more to the right
    {
      name: "icons8-ambulance-24",
      top: "25%",
      left: "25%",
      rotation: "10deg",
      size: "60px",
    }, // Shifted more to the right and increased size
    { name: "icons8-flood-car-50", top: "65%", left: "28%", rotation: "0deg" }, // Shifted more to the right
    { name: "icons8-vest-50", top: "80%", left: "30%", rotation: "-8deg" }, // Shifted more to the right
    { name: "icons8-fire-hose-64", top: "15%", right: "10%", rotation: "5deg" },
    {
      name: "icons8-medical-bag-24",
      top: "30%",
      right: "15%",
      rotation: "-10deg",
    },
    { name: "icons8-lifebuoy-32", top: "50%", right: "8%", rotation: "0deg" },
    {
      name: "icons8-fire-station-50",
      top: "70%",
      right: "15%",
      rotation: "8deg",
    },
    {
      name: "icons8-helping-hand-50",
      top: "40%",
      left: "25%",
      rotation: "-5deg",
    }, // Shifted more to the right
    { name: "icons8-lifeboat-50", top: "60%", right: "5%", rotation: "12deg" },
    { name: "icons8-rescue-50", top: "85%", right: "25%", rotation: "-15deg" },
  ];

  return (
    <div className="h-[90vh] flex flex-col text-black relative overflow-hidden">

      <Header />

      {/* Scattered icons */}
      {iconPositions.map((icon, index) => (
        <div
          key={index}
          className="absolute"
          style={{
            top: icon.top,
            left: icon.left,
            right: icon.right,
            transform: `rotate(${icon.rotation})`,
            zIndex: 0,
          }}
        >
          <img
            src={`/images/${icon.name}.png`}
            alt="Rescue icon"
            className="opacity-40 hover:opacity-100 transition-opacity duration-300"
            style={{ width: icon.size || "50px" }} // Set size for ambulance icon
          />
        </div>
      ))}

      {/* Main content with GitHub-like styling */}
      <main className="flex-grow md:ml-48 flex flex-col items-center justify-center relative z-10">
        <div className="text-center p-5 rounded-xl  max-w-2xl ">
          <h1 className="text-3xl font-bold mb-6 text-gray-700">Welcome To</h1>
          <h2 className="text-8xl font-bold mb-6 text-gray-900">ResQPortal</h2>
          <p className="text-lg mb-2 text-yellow-300 font-medium">
            BY ResQTech
          </p>

          <p className="text-lg mb-6">
            Ask questions, share information, and coordinate rescue efforts with
            each other. ResQPortal enables
            effective and timely disaster response collaboration.
          </p>

          <div className="flex justify-center gap-4">
            <button className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-md flex items-center">
              Register
              <span className="ml-2">→</span>
            </button>
          </div>

          <div className="mt-8 text-gray-700 font-medium">
            Dedicated space for emergency response coordination.
          </div>
        </div>
      </main>
    </div>
  );
}

export default Welcome;
