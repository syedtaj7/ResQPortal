import React from "react";
import TranslatableText from "../components/TranslatableText";
import { useTheme } from "../contexts/ThemeContext";

export const FilterBar = ({ filters, setFilters }) => {
  const { darkMode } = useTheme();

  return (
    <div
      className={`${
        darkMode
          ? "bg-dark-bg-secondary/90 border-gray-700"
          : "bg-white/90 border-gray-300"
      } backdrop-blur-sm p-4 rounded-lg mb-6 space-y-4 shadow-lg mt-1 border`}
    >
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search alerts..." // HTML attributes can't use React components
            className={`w-full ${
              darkMode
                ? "bg-dark-bg-tertiary border-gray-700 text-dark-text-primary placeholder-gray-500"
                : "bg-gray-100 border-gray-300 text-gray-900 placeholder-gray-500"
            } border rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-yellow-500 focus:outline-none transition-all`}
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
          <svg
            className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
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
          className={`${
            darkMode
              ? "bg-dark-bg-tertiary border-gray-700 text-dark-text-primary"
              : "bg-gray-100 border-gray-300 text-gray-900"
          } border rounded-lg px-4 py-2 appearance-none cursor-pointer`}
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
                  ? "bg-yellow-500 text-white"
                  : darkMode
                  ? "bg-dark-bg-tertiary text-dark-text-primary border border-gray-700 hover:bg-yellow-600/70"
                  : "bg-gray-100 text-gray-800 border border-gray-300 hover:bg-yellow-400/70"
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
