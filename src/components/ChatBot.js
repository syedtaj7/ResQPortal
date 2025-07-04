import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { CHATBOT_RESPONSES } from "../data/chatbotResponses";
import TranslatableText from "../components/TranslatableText";

const ChatBot = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: "bot",
      content: CHATBOT_RESPONSES.greetings.welcome,
      suggestions: CHATBOT_RESPONSES.quickLinks,
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateResponse = (message) => {
    const lowercaseMsg = message.toLowerCase();

    // Check for help command
    if (lowercaseMsg.includes("help")) {
      return CHATBOT_RESPONSES.help;
    }

    // Check for disaster keywords
    for (const [disaster, responses] of Object.entries(
      CHATBOT_RESPONSES.keywords
    )) {
      if (lowercaseMsg.includes(disaster)) {
        if (
          lowercaseMsg.includes("prevent") ||
          lowercaseMsg.includes("prepare")
        ) {
          return responses.prevention;
        }
        if (
          lowercaseMsg.includes("during") ||
          lowercaseMsg.includes("response")
        ) {
          return responses.response;
        }
        // Return both if query is general
        return `${responses.prevention}\n\n${responses.response}`;
      }
    }

    // Fallback response
    return CHATBOT_RESPONSES.fallback[
      Math.floor(Math.random() * CHATBOT_RESPONSES.fallback.length)
    ];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    // Add user message
    setMessages((prev) => [...prev, { type: "user", content: inputMessage }]);
    setInputMessage("");
    setIsTyping(true);

    // Process message through handleMessageSend
    handleMessageSend(inputMessage);

    // Simulate bot thinking
    setTimeout(() => {
      const response = generateResponse(inputMessage);
      setMessages((prev) => [...prev, { type: "bot", content: response }]);
      setIsTyping(false);
    }, 1000);
  };

  const handleSuggestionClick = (suggestion) => {
    setMessages((prev) => [
      ...prev,
      { type: "user", content: suggestion.text },
    ]);
    setIsTyping(true);

    setTimeout(() => {
      const response =
        CHATBOT_RESPONSES.keywords[suggestion.type][suggestion.category];
      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          content: `${response.content}\n${response.steps.join("\n")}`,
          link: response.link,
          suggestions: CHATBOT_RESPONSES.quickLinks,
        },
      ]);
      setIsTyping(false);
    }, 1000);
  };

  const handleLinkClick = (link) => {
    // Extract the disaster type from the link
    const disasterType = link.split("/").pop();

    // Navigate to mitigation page with the correct tab and disaster selected
    if (link.includes("mitigation")) {
      navigate("/mitigation", {
        state: {
          activeTab: "pre",
          selectedDisaster: disasterType,
        },
      });
    } else if (link.includes("recovery")) {
      navigate("/mitigation", {
        state: {
          activeTab: "post",
          selectedDisaster: disasterType,
        },
      });
    }
    setIsOpen(false);
  };

  // Add this mapping of keywords to disaster IDs
  const disasterMapping = {
    flood: "floods",
    earthquake: "earthquakes",
    cyclone: "cyclones",
    landslide: "landslides",
    wildfire: "wildfires",
    industrial: "industrialAccidents",
    structural: "structuralCollapse",
    terrorist: "terroristAttacks",
    "heat wave": "heatwave",
    "cold wave": "coldwave",
    drought: "drought",
    "air quality": "airQuality",
    storm: "thunderstorms",
    pandemic: "pandemic",
    tsunami: "tsunami",
    volcano: "volcano",
    avalanche: "avalanche",
    cyber: "cyberAttack",
    nuclear: "nuclearIncident",
    chemical: "chemicalSpill",
    epidemic: "epidemic",
    bioterrorism: "bioterrorism",
    pest: "pestInfestation",
    invasive: "invasiveSpecies",
  };

  // Add this function to handle guide navigation
  const handleViewGuide = (message) => {
    const lowerMessage = message.toLowerCase();

    // Determine if it's prevention or recovery
    const isPrevention =
      lowerMessage.includes("prevent") ||
      lowerMessage.includes("prepare") ||
      lowerMessage.includes("before");

    // Find matching disaster type
    const disasterType = Object.entries(disasterMapping).find(([key]) =>
      lowerMessage.includes(key)
    )?.[1];

    if (disasterType) {
      navigate("/mitigation", {
        state: {
          activeTab: isPrevention ? "pre" : "post",
          selectedDisaster: disasterType,
        },
      });
      setIsOpen(false); // Close chatbot after navigation
    }
  };

  // Update your existing message handler to include guide navigation
  const handleMessageSend = (message) => {
    // ... existing message handling code ...

    if (
      message.toLowerCase().includes("view") &&
      message.toLowerCase().includes("guide")
    ) {
      handleViewGuide(message);
    }

    // ... rest of your existing code ...
  };

  return (
    <>
      <motion.button
        className="fixed bottom-6 left-6 md:bottom-[7rem] md:right-6 md:left-auto ml-0 bg-yellow-400 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
          />
        </svg>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-16 md:bottom-[8.5rem] left-2 md:right-6 md:left-auto w-[calc(100vw-1rem)] max-w-sm md:w-80 bg-gray-900 rounded-lg shadow-xl border border-gray-800 z-50"
          >
            <div className="flex items-center justify-between p-2 md:p-3 border-b border-gray-800">
              <h3 className="text-sm md:text-base font-semibold text-white">
                <TranslatableText>Disaster Support</TranslatableText>
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg
                  className="w-4 h-4 md:w-5 md:h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="h-48 md:h-64 overflow-y-auto p-2 md:p-3 space-y-2 md:space-y-3">
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex flex-col ${
                    message.type === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] md:max-w-[80%] p-2 rounded-lg text-xs md:text-sm ${
                      message.type === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-800 text-gray-300"
                    }`}
                  >
                    <pre className="whitespace-pre-wrap font-sans">
                      <TranslatableText>{message.content}</TranslatableText>
                    </pre>
                    {message.link && (
                      <button
                        onClick={() => handleLinkClick(message.link)}
                        className="mt-2 text-blue-400 hover:text-blue-300 text-sm underline"
                      >
                        <TranslatableText>View detailed guide</TranslatableText>{" "}
                        →
                      </button>
                    )}
                  </div>

                  {message.type === "bot" && message.suggestions && (
                    <div className="mt-2 flex flex-wrap gap-1 md:gap-2">
                      {message.suggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="text-xs md:text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 px-2 md:px-3 py-1 md:py-1.5 rounded-full transition-colors"
                        >
                          <TranslatableText>{suggestion.text}</TranslatableText>
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-gray-800 text-gray-300 p-3 rounded-lg">
                    <TranslatableText>Typing...</TranslatableText>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-2 md:p-3 border-t border-gray-800"
            >
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask about disasters..." // HTML attributes can't use React components directly
                  className="flex-1 bg-gray-800 text-white rounded-lg px-3 md:px-4 py-1.5 md:py-2 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="bg-blue-600 text-white p-1.5 md:p-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <svg
                    className="w-4 h-4 md:w-5 md:h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatBot;
