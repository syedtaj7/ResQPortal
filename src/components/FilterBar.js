import React from "react";
import TranslatableText from "../components/TranslatableText";

export const FilterBar = ({ filters, setFilters }) => {
  return (
    <div className="bg-[#F8F8F8]/90 backdrop-blur-sm p-4 rounded-lg mb-6 space-y-4 shadow-lg mt-1 border border-gray-200 - box shadow">
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search alerts..." // HTML attributes can't use React components
            className="w-full bg-[#F8F8F8] border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-black
              focus:ring-2 focus:ring-yellow-500 focus:outline-none transition-all"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
          <svg
            className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        <select
          className="bg-[#F8F8F8] border border-gray-600 rounded-lg px-4 py-2 text-black appearance-none cursor-pointer"
          value={filters.sortBy}
          onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
        >
          <option value="latest">
            <TranslatableText>Latest First</TranslatableText>
          </option>
          <option value="upvotes">
            <TranslatableText>Most Upvoted</TranslatableText>
          </option>
          <option value="severity">
            <TranslatableText>Highest Severity</TranslatableText>
          </option>
        </select>
      </div>

      <div className="flex flex-wrap gap-2">
        {["All", "High", "Medium", "Low"].map((severity) => (
          <button
            key={severity}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors
              ${
                filters.severity === severity.toLowerCase()
                  ? "bg-yellow-300 text-white"
                  : "bg-[#F8F8F8] text-black hover:bg-yellow-300"
              }`}
            onClick={() =>
              setFilters({ ...filters, severity: severity.toLowerCase() })
            }
          >
            <TranslatableText>{severity}</TranslatableText>
          </button>
        ))}
      </div>
    </div>
  );
};
