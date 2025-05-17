import React, { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import TranslatableText from "../components/TranslatableText";
import { useTheme } from "../contexts/ThemeContext";

export const AlertCard = ({
  alert,
  onUpvote,
  onShare,
  onSave,
  onImageClick,
  isSaved,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "";
    try {
      return formatDistanceToNow(timestamp.toDate(), { addSuffix: true });
    } catch (error) {
      console.error("Error formatting timestamp:", error);
      return "";
    }
  };

  const getSeverityBadge = (category) => {
    const badges = {
      "Natural Disasters": "bg-red-500/20 text-red-400",
      "Weather Conditions": "bg-yellow-500/20 text-yellow-400",
      "Urban Incidents": "bg-orange-500/20 text-orange-400",
    };
    return badges[category] || "bg-gray-500/20 text-gray-400";
  };

  const { darkMode } = useTheme();

  return (
    <div
      className={`${
        darkMode
          ? "bg-dark-bg-secondary border-gray-700/50"
          : "bg-white border-gray-300/50"
      } backdrop-blur-sm rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 border`}
    >
      <div className="relative">
        <img
          src={alert.imageUrl}
          alt={alert.description}
          className="w-full h-48 object-cover cursor-pointer transition-transform hover:scale-105"
          onClick={() => onImageClick(alert.imageUrl)}
        />
        <div className="absolute top-2 right-2 flex space-x-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${getSeverityBadge(
              alert.category
            )}`}
          >
            <TranslatableText>{alert.category}</TranslatableText>
          </span>
        </div>
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3
              className={`text-lg font-semibold ${
                darkMode ? "text-dark-text-primary" : "text-gray-900"
              } mb-1`}
            >
              <TranslatableText>{alert.location}</TranslatableText>
            </h3>
            <p
              className={`text-sm ${
                darkMode ? "text-dark-text-muted" : "text-gray-500"
              }`}
            >
              {formatTimestamp(alert.timestamp)}
            </p>
          </div>
          <button
            onClick={onUpvote}
            className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
              darkMode
                ? "bg-dark-bg-tertiary hover:bg-gray-600/50"
                : "bg-gray-100 hover:bg-gray-200"
            } transition-colors`}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 15l7-7 7 7"
              />
            </svg>
            <span className="text-sm">{alert.upvotes || 0}</span>
          </button>
        </div>

        <p
          className={`${
            darkMode ? "text-dark-text-secondary" : "text-gray-700"
          } ${!isExpanded && "line-clamp-3"}`}
        >
          <TranslatableText>{alert.description}</TranslatableText>
        </p>
        {alert.description.length > 150 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`${
              darkMode
                ? "text-blue-400 hover:text-blue-300"
                : "text-blue-600 hover:text-blue-700"
            } text-sm mt-2`}
          >
            <TranslatableText>
              {isExpanded ? "Show less" : "Read more"}
            </TranslatableText>
          </button>
        )}

        <div
          className={`flex items-center justify-between mt-4 pt-4 ${
            darkMode ? "border-gray-700" : "border-gray-300"
          } border-t`}
        >
          <div
            className={`text-sm ${
              darkMode ? "text-dark-text-muted" : "text-gray-500"
            } flex items-center space-x-2`}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <span>{alert.userEmail}</span>
            <span
              className={`ml-2 px-2 py-1 rounded text-xs font-semibold ${
                alert.postedByVolunteer
                  ? "bg-green-600 text-white"
                  : "bg-gray-600 text-white"
              }`}
            >
              <TranslatableText>
                {alert.postedByVolunteer
                  ? "Posted by Volunteer"
                  : "Posted by Non-Volunteer"}
              </TranslatableText>
            </span>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={onShare}
              className={`p-2 ${
                darkMode ? "hover:bg-dark-bg-tertiary" : "hover:bg-gray-100"
              } rounded-full transition-colors`}
              title="Share alert" // Note: HTML attributes can't use React components
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316"
                />
              </svg>
            </button>
            <button
              onClick={() => onSave(alert)}
              className={`p-2 rounded-full transition-colors ${
                isSaved
                  ? "text-blue-400 hover:text-blue-300 bg-blue-500/10"
                  : darkMode
                  ? "text-dark-text-muted hover:text-white hover:bg-dark-bg-tertiary"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
              title={isSaved ? "Remove from saved" : "Save alert"} // HTML attributes can't use React components
            >
              <svg
                className="w-5 h-5"
                fill={isSaved ? "currentColor" : "none"}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
