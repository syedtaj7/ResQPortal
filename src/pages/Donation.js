import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "../components/Header";
import Footer from "../components/Footer";

// Dummy data for disaster areas needing donations
const disasterData = [
  {
    id: 1,
    name: "Kerala Flood Relief",
    location: "Kerala, India",
    organization: "Kerala Disaster Relief Fund",
    description:
      "Severe flooding has affected over 200,000 people in Kerala. The region has experienced unprecedented rainfall, causing rivers to overflow and displacing thousands of families from their homes.",
    impact:
      "The floods have destroyed homes, crops, and infrastructure. Many families have lost everything and are currently living in temporary shelters.",
    howHelpWorks:
      "Your donation will provide emergency shelter, clean water, food, and medical supplies to affected families. It will also support long-term recovery efforts including rebuilding homes and restoring livelihoods.",
    images: ["/kerala1.jpg", "/kerala2.jpg", "/kerala3.jpeg"],
    amountNeeded: "₹50,00,000",
    amountRaised: "₹18,75,000",
    urgencyLevel: "High",
  },
  {
    id: 2,
    name: "Assam Earthquake Recovery",
    location: "Assam, India",
    organization: "Assam Disaster Management Authority",
    description:
      "A 6.4 magnitude earthquake struck Assam, causing significant damage to buildings, roads, and other infrastructure. Many villages in remote areas are still cut off from aid.",
    impact:
      "The earthquake has damaged over 1,000 buildings and left many families homeless. Critical infrastructure including hospitals and schools have been severely affected.",
    howHelpWorks:
      "Your donation will fund emergency response teams, provide temporary housing, and support rebuilding efforts. Funds will also be used to restore essential services like healthcare and education.",
    images: ["/assam1.jpeg", "/assam2.jpeg"],
    amountNeeded: "₹35,00,000",
    amountRaised: "₹12,25,000",
    urgencyLevel: "Medium",
  },
  {
    id: 3,
    name: "Gujarat Drought Relief",
    location: "Gujarat, India",
    organization: "Gujarat Rural Development Society",
    description:
      "Severe drought conditions have affected agricultural communities across Gujarat. Farmers are struggling with crop failures and water scarcity is affecting daily life.",
    impact:
      "The drought has led to crop failures, livestock deaths, and severe water shortages. Many families are facing food insecurity and economic hardship.",
    howHelpWorks:
      "Your donation will provide immediate relief through water distribution, food aid, and support for affected farmers. Long-term initiatives include water conservation projects and sustainable agriculture training.",
    images: ["/gujarat1.jpeg", "/gujarat2.jpeg"],
    amountNeeded: "₹25,00,000",
    amountRaised: "₹8,75,000",
    urgencyLevel: "Medium",
  },
  {
    id: 4,
    name: "Odisha Cyclone Recovery",
    location: "Odisha, India",
    organization: "Odisha State Disaster Management Authority",
    description:
      "A severe cyclone hit coastal areas of Odisha, causing widespread destruction. Strong winds and heavy rainfall have damaged homes, infrastructure, and agricultural lands.",
    impact:
      "The cyclone has affected over 500,000 people, destroying homes and critical infrastructure. Coastal communities have lost fishing boats and equipment, impacting their livelihoods.",
    howHelpWorks:
      "Your donation will support immediate relief operations including food, clean water, and medical aid. It will also help rebuild homes, restore livelihoods, and strengthen community resilience against future disasters.",
    images: ["/odisha1.jpeg", "/odisha2.jpg"],
    amountNeeded: "₹45,00,000",
    amountRaised: "₹22,50,000",
    urgencyLevel: "High",
  },
  {
    id: 5,
    name: "Uttarakhand Landslide Relief",
    location: "Uttarakhand, India",
    organization: "Himalayan Environmental Trust",
    description:
      "Heavy rainfall triggered devastating landslides in the mountainous regions of Uttarakhand. Several villages have been affected, with roads and bridges washed away.",
    impact:
      "The landslides have destroyed homes, blocked roads, and cut off access to essential services. Many communities are isolated and in urgent need of assistance.",
    howHelpWorks:
      "Your donation will fund rescue operations, emergency supplies, and temporary shelter for affected communities. It will also support rebuilding infrastructure and implementing landslide prevention measures.",
    images: ["/uttarakhand1.jpeg", "/uttarakhand2.jpg"],
    amountNeeded: "₹30,00,000",
    amountRaised: "₹9,00,000",
    urgencyLevel: "High",
  },
];

// Dummy data for volunteer opportunities
const volunteerData = [
  {
    id: 1,
    name: "Kerala Flood Relief Volunteers",
    location: "Kerala, India",
    organization: "Kerala Disaster Relief Fund",
    description:
      "Join our team of volunteers helping flood victims in Kerala. We need assistance with distribution of supplies, medical aid, and shelter construction.",
    skillsNeeded: ["Medical", "Construction", "Logistics", "Food Distribution"],
    timeCommitment: "Flexible (Minimum 4 hours per week)",
    impact:
      "Your time will directly help families affected by the floods. Volunteers will assist in rebuilding homes, distributing essential supplies, and providing medical support.",
    requirements: "Age 18+, Basic training provided, Transportation to site",
    images: ["/kerala1.jpg", "/kerala2.jpg"],
    volunteersNeeded: 50,
    volunteersRegistered: 18,
    urgencyLevel: "High",
    disasterId: 1,
  },
  {
    id: 2,
    name: "Assam Earthquake Recovery Team",
    location: "Assam, India",
    organization: "Assam Disaster Management Authority",
    description:
      "Volunteers needed for earthquake recovery efforts in Assam. Help with debris clearing, temporary shelter construction, and community support.",
    skillsNeeded: [
      "Construction",
      "Engineering",
      "First Aid",
      "Community Outreach",
    ],
    timeCommitment: "2-3 days per week",
    impact:
      "Your contribution will help rebuild communities devastated by the earthquake. Volunteers will assist in restoring basic infrastructure and providing support to affected families.",
    requirements:
      "Physical fitness, Basic construction knowledge helpful but not required",
    images: ["/assam1.jpeg", "/assam2.jpeg"],
    volunteersNeeded: 35,
    volunteersRegistered: 12,
    urgencyLevel: "Medium",
    disasterId: 2,
  },
  {
    id: 3,
    name: "Gujarat Water Distribution Volunteers",
    location: "Gujarat, India",
    organization: "Gujarat Rural Development Society",
    description:
      "Volunteers needed to help with water distribution and agricultural support during the drought in Gujarat.",
    skillsNeeded: [
      "Water Management",
      "Agriculture",
      "Driving",
      "Coordination",
    ],
    timeCommitment: "Weekends or 1-2 days per week",
    impact:
      "Your help will ensure communities have access to clean water and agricultural support during the drought. Volunteers will distribute water, assist farmers, and educate communities on water conservation.",
    requirements:
      "Valid driver's license preferred for some roles, Knowledge of local language helpful",
    images: ["/gujarat1.jpeg", "/gujarat2.jpeg"],
    volunteersNeeded: 25,
    volunteersRegistered: 8,
    urgencyLevel: "Medium",
    disasterId: 3,
  },
  {
    id: 4,
    name: "Odisha Cyclone Recovery Assistance",
    location: "Odisha, India",
    organization: "Odisha State Disaster Management Authority",
    description:
      "Join our cyclone recovery efforts in coastal Odisha. Help rebuild homes, restore fishing equipment, and provide community support.",
    skillsNeeded: [
      "Construction",
      "Fishing Knowledge",
      "Counseling",
      "Teaching",
    ],
    timeCommitment: "Minimum 1 week commitment",
    impact:
      "Your time will help coastal communities recover from the devastating cyclone. Volunteers will rebuild homes, repair fishing boats, and help restore livelihoods.",
    requirements:
      "Ability to stay on-site for minimum 1 week, Physical stamina for rebuilding work",
    images: ["/odisha1.jpeg", "/odisha2.jpg"],
    volunteersNeeded: 40,
    volunteersRegistered: 22,
    urgencyLevel: "High",
    disasterId: 4,
  },
  {
    id: 5,
    name: "Uttarakhand Landslide Relief Team",
    location: "Uttarakhand, India",
    organization: "Himalayan Environmental Trust",
    description:
      "Volunteers needed for landslide relief in remote Uttarakhand villages. Help with supply distribution, temporary housing, and road clearing.",
    skillsNeeded: [
      "Hiking/Trekking",
      "First Aid",
      "Civil Engineering",
      "Logistics",
    ],
    timeCommitment: "1-2 weeks (full-time)",
    impact:
      "Your contribution will help isolated communities affected by landslides. Volunteers will deliver essential supplies, help clear roads, and assist with temporary shelter construction.",
    requirements:
      "Good physical fitness, Ability to work in mountainous terrain, Basic first aid knowledge",
    images: ["/uttarakhand1.jpeg", "/uttarakhand2.jpg"],
    volunteersNeeded: 30,
    volunteersRegistered: 9,
    urgencyLevel: "High",
    disasterId: 5,
  },
];

// Volunteer registration data structure for tracking hours and contributions
const initialVolunteerStats = {
  hoursLogged: 0,
  activitiesCompleted: 0,
  peopleHelped: 0,
  skillsUtilized: [],
  lastActivity: null,
};

// Volunteer Registration Form Component
const VolunteerRegistrationForm = ({
  volunteer,
  onClose,
  onVolunteerRegistration,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    skills: [],
    availability: "",
    experience: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const availabilityOptions = [
    "Weekdays",
    "Weekends",
    "Evenings",
    "Full-time (1+ weeks)",
    "On-call (Emergency)",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSkillChange = (skill) => {
    setFormData((prev) => {
      const updatedSkills = prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill];
      return { ...prev, skills: updatedSkills };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);

      // Call the parent's handler to update volunteer stats
      onVolunteerRegistration(formData);
    }, 1500);
  };

  if (isSubmitted) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-lg p-8 max-w-md w-full"
        >
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              Registration Successful!
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Thank you for volunteering with {volunteer.name}. Your skills and
              time will make a real difference.
            </p>
            <div className="mt-6">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-500 text-base font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            Volunteer for {volunteer.name}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700"
            >
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              required
              value={formData.phone}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Skills (Select all that apply)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {volunteer.skillsNeeded.map((skill) => (
                <div key={skill} className="flex items-center">
                  <input
                    id={`skill-${skill}`}
                    type="checkbox"
                    checked={formData.skills.includes(skill)}
                    onChange={() => handleSkillChange(skill)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor={`skill-${skill}`}
                    className="ml-2 block text-sm text-gray-700"
                  >
                    {skill}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label
              htmlFor="availability"
              className="block text-sm font-medium text-gray-700"
            >
              Availability
            </label>
            <select
              id="availability"
              name="availability"
              required
              value={formData.availability}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select your availability</option>
              {availabilityOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="experience"
              className="block text-sm font-medium text-gray-700"
            >
              Relevant Experience
            </label>
            <textarea
              id="experience"
              name="experience"
              rows="2"
              value={formData.experience}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            ></textarea>
          </div>

          <div>
            <label
              htmlFor="message"
              className="block text-sm font-medium text-gray-700"
            >
              Additional Information (Optional)
            </label>
            <textarea
              id="message"
              name="message"
              rows="2"
              value={formData.message}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            ></textarea>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                isSubmitting ? "opacity-75 cursor-not-allowed" : ""
              }`}
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </>
              ) : (
                "Register as Volunteer"
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// Volunteer Detail Modal Component
const VolunteerDetailModal = ({ volunteer, onClose, onVolunteer }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg overflow-hidden max-w-4xl w-full max-h-[90vh] flex flex-col"
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-gray-900">{volunteer.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto p-6 flex-grow">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {volunteer.images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`${volunteer.name} scene ${index + 1}`}
                className="w-full h-64 object-cover rounded-lg shadow-md"
              />
            ))}
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                About the Volunteer Opportunity
              </h3>
              <p className="text-gray-700">{volunteer.description}</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Impact
              </h3>
              <p className="text-gray-700">{volunteer.impact}</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Skills Needed
              </h3>
              <div className="flex flex-wrap gap-2">
                {volunteer.skillsNeeded.map((skill) => (
                  <span
                    key={skill}
                    className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Requirements
              </h3>
              <p className="text-gray-700">{volunteer.requirements}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-500">
                  Organization
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  {volunteer.organization}
                </span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-500">
                  Location
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  {volunteer.location}
                </span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-500">
                  Time Commitment
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  {volunteer.timeCommitment}
                </span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-500">
                  Urgency Level
                </span>
                <span
                  className={`text-sm font-semibold ${
                    volunteer.urgencyLevel === "High"
                      ? "text-red-600"
                      : volunteer.urgencyLevel === "Medium"
                      ? "text-orange-600"
                      : "text-yellow-600"
                  }`}
                >
                  {volunteer.urgencyLevel}
                </span>
              </div>
              <div className="mt-4">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-500">
                    Volunteers Registered
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {volunteer.volunteersRegistered} of{" "}
                    {volunteer.volunteersNeeded}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-500 h-2.5 rounded-full"
                    style={{
                      width: `${
                        (volunteer.volunteersRegistered /
                          volunteer.volunteersNeeded) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t bg-gray-50">
          <button
            onClick={() => onVolunteer(volunteer)}
            className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg
              className="mr-2 -ml-1 h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            Register as Volunteer
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// Volunteer Card Component
const VolunteerCard = ({ volunteer, onClick }) => {
  return (
    <motion.div
      whileHover={{
        y: -5,
        boxShadow:
          "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      }}
      className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all cursor-pointer"
      onClick={() => onClick(volunteer)}
    >
      <img
        src={volunteer.images[0]}
        alt={volunteer.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-gray-900">
            {volunteer.name}
          </h3>
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              volunteer.urgencyLevel === "High"
                ? "bg-red-100 text-red-800"
                : volunteer.urgencyLevel === "Medium"
                ? "bg-orange-100 text-orange-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {volunteer.urgencyLevel}
          </span>
        </div>
        <p className="text-sm text-gray-500 mt-1">{volunteer.location}</p>
        <p className="text-sm text-gray-500 mt-1">
          Organization: {volunteer.organization}
        </p>
        <p className="text-sm text-gray-700 mt-2 line-clamp-2">
          {volunteer.description}
        </p>

        <div className="mt-3">
          <p className="text-xs font-medium text-gray-500 mb-1">
            Skills Needed:
          </p>
          <div className="flex flex-wrap gap-1">
            {volunteer.skillsNeeded.slice(0, 3).map((skill) => (
              <span
                key={skill}
                className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded"
              >
                {skill}
              </span>
            ))}
            {volunteer.skillsNeeded.length > 3 && (
              <span className="text-xs text-gray-500">
                +{volunteer.skillsNeeded.length - 3} more
              </span>
            )}
          </div>
        </div>

        <div className="mt-4">
          <div className="flex justify-between mb-1">
            <span className="text-xs font-medium text-gray-500">
              Volunteers Registered
            </span>
            <span className="text-xs font-semibold text-gray-900">
              {volunteer.volunteersRegistered} of {volunteer.volunteersNeeded}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-blue-500 h-1.5 rounded-full"
              style={{
                width: `${
                  (volunteer.volunteersRegistered /
                    volunteer.volunteersNeeded) *
                  100
                }%`,
              }}
            ></div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Volunteer Hours Tracking Component
const VolunteerDashboard = ({ volunteerStats, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg overflow-hidden max-w-2xl w-full max-h-[90vh] flex flex-col"
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            Volunteer Dashboard
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <p className="text-3xl font-bold text-blue-600">
                {volunteerStats.hoursLogged}
              </p>
              <p className="text-sm text-gray-600">Hours Logged</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <p className="text-3xl font-bold text-green-600">
                {volunteerStats.activitiesCompleted}
              </p>
              <p className="text-sm text-gray-600">Activities</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <p className="text-3xl font-bold text-purple-600">
                {volunteerStats.peopleHelped}
              </p>
              <p className="text-sm text-gray-600">People Helped</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg text-center">
              <p className="text-3xl font-bold text-yellow-600">
                {volunteerStats.skillsUtilized.length}
              </p>
              <p className="text-sm text-gray-600">Skills Used</p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Skills Utilized
            </h3>
            <div className="flex flex-wrap gap-2">
              {volunteerStats.skillsUtilized.length > 0 ? (
                volunteerStats.skillsUtilized.map((skill) => (
                  <span
                    key={skill}
                    className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <p className="text-sm text-gray-500">No skills recorded yet</p>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Log Hours
            </h3>
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Activity
                  </label>
                  <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                    <option>Select an activity</option>
                    <option>Supply Distribution</option>
                    <option>Medical Support</option>
                    <option>Construction</option>
                    <option>Logistics</option>
                    <option>Community Outreach</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Hours
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Date
                </label>
                <input
                  type="date"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Notes
                </label>
                <textarea
                  rows="2"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Log Hours
              </button>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Donation Form Component
const DonationForm = ({ disaster, onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    amount: "",
    paymentMethod: "creditCard",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 1500);
  };

  if (isSubmitted) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-lg p-8 max-w-md w-full"
        >
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              Donation Successful!
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Thank you for your generous donation to {disaster.name}. Your
              contribution will make a real difference.
            </p>
            <div className="mt-6">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-yellow-500 text-base font-medium text-white hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 sm:text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            Donate to {disaster.name}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500"
            />
          </div>

          <div>
            <label
              htmlFor="amount"
              className="block text-sm font-medium text-gray-700"
            >
              Donation Amount (₹)
            </label>
            <input
              type="number"
              id="amount"
              name="amount"
              required
              min="10"
              value={formData.amount}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Payment Method
            </label>
            <div className="mt-2 space-y-2">
              <div className="flex items-center">
                <input
                  id="creditCard"
                  name="paymentMethod"
                  type="radio"
                  value="creditCard"
                  checked={formData.paymentMethod === "creditCard"}
                  onChange={handleChange}
                  className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300"
                />
                <label
                  htmlFor="creditCard"
                  className="ml-3 block text-sm font-medium text-gray-700"
                >
                  Credit/Debit Card
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="upi"
                  name="paymentMethod"
                  type="radio"
                  value="upi"
                  checked={formData.paymentMethod === "upi"}
                  onChange={handleChange}
                  className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300"
                />
                <label
                  htmlFor="upi"
                  className="ml-3 block text-sm font-medium text-gray-700"
                >
                  UPI
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="netBanking"
                  name="paymentMethod"
                  type="radio"
                  value="netBanking"
                  checked={formData.paymentMethod === "netBanking"}
                  onChange={handleChange}
                  className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300"
                />
                <label
                  htmlFor="netBanking"
                  className="ml-3 block text-sm font-medium text-gray-700"
                >
                  Net Banking
                </label>
              </div>
            </div>
          </div>

          <div>
            <label
              htmlFor="message"
              className="block text-sm font-medium text-gray-700"
            >
              Message (Optional)
            </label>
            <textarea
              id="message"
              name="message"
              rows="3"
              value={formData.message}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500"
            ></textarea>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 ${
                isSubmitting ? "opacity-75 cursor-not-allowed" : ""
              }`}
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </>
              ) : (
                "Donate Now"
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// Disaster Detail Modal Component
const DisasterDetailModal = ({
  disaster,
  onClose,
  onDonate,
  onSwitchToVolunteer,
}) => {
  // Find volunteer opportunities for this disaster
  const relatedVolunteers = volunteerData.filter(
    (volunteer) => volunteer.disasterId === disaster.id
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg overflow-hidden max-w-4xl w-full max-h-[90vh] flex flex-col"
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-gray-900">{disaster.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto p-6 flex-grow">
          <div
            className={`grid grid-cols-1 ${
              disaster.images.length > 2 ? "md:grid-cols-3" : "md:grid-cols-2"
            } gap-6 mb-6`}
          >
            {disaster.images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`${disaster.name} disaster scene ${index + 1}`}
                className="w-full h-64 object-cover rounded-lg shadow-md"
              />
            ))}
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                About the Disaster
              </h3>
              <p className="text-gray-700">{disaster.description}</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Impact
              </h3>
              <p className="text-gray-700">{disaster.impact}</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                How Your Donation Helps
              </h3>
              <p className="text-gray-700">{disaster.howHelpWorks}</p>
            </div>

            {relatedVolunteers.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Volunteer Opportunities
                </h3>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-gray-700 mb-2">
                    We need volunteers to help with this disaster relief effort.
                    There are currently {relatedVolunteers.length} volunteer
                    opportunities available.
                  </p>
                  <button
                    onClick={() =>
                      onSwitchToVolunteer &&
                      onSwitchToVolunteer(relatedVolunteers[0])
                    }
                    className="inline-flex items-center text-blue-600 hover:text-blue-800"
                  >
                    <svg
                      className="mr-1 h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                    View volunteer opportunities
                  </button>
                </div>
              </div>
            )}

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-500">
                  Organization
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  {disaster.organization}
                </span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-500">
                  Location
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  {disaster.location}
                </span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-500">
                  Urgency Level
                </span>
                <span
                  className={`text-sm font-semibold ${
                    disaster.urgencyLevel === "High"
                      ? "text-red-600"
                      : disaster.urgencyLevel === "Medium"
                      ? "text-orange-600"
                      : "text-yellow-600"
                  }`}
                >
                  {disaster.urgencyLevel}
                </span>
              </div>
              <div className="mt-4">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-500">
                    Funds Raised
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {disaster.amountRaised} of {disaster.amountNeeded}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-yellow-500 h-2.5 rounded-full"
                    style={{
                      width: `${
                        (parseInt(
                          disaster.amountRaised.replace(/[^0-9]/g, "")
                        ) /
                          parseInt(
                            disaster.amountNeeded.replace(/[^0-9]/g, "")
                          )) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => onDonate(disaster)}
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
            >
              <svg
                className="mr-2 -ml-1 h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Donate Now
            </button>

            {relatedVolunteers.length > 0 && (
              <button
                onClick={() =>
                  onSwitchToVolunteer &&
                  onSwitchToVolunteer(relatedVolunteers[0])
                }
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg
                  className="mr-2 -ml-1 h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                Volunteer Instead
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Disaster Card Component
const DisasterCard = ({ disaster, onClick }) => {
  return (
    <motion.div
      whileHover={{
        y: -5,
        boxShadow:
          "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      }}
      className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all cursor-pointer"
      onClick={() => onClick(disaster)}
    >
      <img
        src={disaster.images[0]}
        alt={disaster.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-gray-900">
            {disaster.name}
          </h3>
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              disaster.urgencyLevel === "High"
                ? "bg-red-100 text-red-800"
                : disaster.urgencyLevel === "Medium"
                ? "bg-orange-100 text-orange-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {disaster.urgencyLevel}
          </span>
        </div>
        <p className="text-sm text-gray-500 mt-1">{disaster.location}</p>
        <p className="text-sm text-gray-500 mt-1">
          Organization: {disaster.organization}
        </p>
        <p className="text-sm text-gray-700 mt-2 line-clamp-2">
          {disaster.description}
        </p>

        <div className="mt-4">
          <div className="flex justify-between mb-1">
            <span className="text-xs font-medium text-gray-500">
              Funds Raised
            </span>
            <span className="text-xs font-semibold text-gray-900">
              {disaster.amountRaised} of {disaster.amountNeeded}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-yellow-500 h-1.5 rounded-full"
              style={{
                width: `${
                  (parseInt(disaster.amountRaised.replace(/[^0-9]/g, "")) /
                    parseInt(disaster.amountNeeded.replace(/[^0-9]/g, ""))) *
                  100
                }%`,
              }}
            ></div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Main Donation Page Component
function Donation() {
  const [selectedDisaster, setSelectedDisaster] = useState(null);
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [showDonationForm, setShowDonationForm] = useState(false);
  const [showVolunteerForm, setShowVolunteerForm] = useState(false);
  const [showVolunteerDashboard, setShowVolunteerDashboard] = useState(false);
  const [activeTab, setActiveTab] = useState("donations");
  const [userVolunteerStats, setUserVolunteerStats] = useState(
    initialVolunteerStats
  );

  const handleDisasterClick = (disaster) => {
    setSelectedDisaster(disaster);
  };

  const handleVolunteerClick = (volunteer) => {
    setSelectedVolunteer(volunteer);
  };

  const handleDonateClick = () => {
    setShowDonationForm(true);
  };

  const handleVolunteerRegisterClick = () => {
    setShowVolunteerForm(true);
  };

  const handleCloseModal = () => {
    setSelectedDisaster(null);
    setSelectedVolunteer(null);
  };

  const handleCloseDonationForm = () => {
    setShowDonationForm(false);
    setSelectedDisaster(null);
  };

  const handleCloseVolunteerForm = () => {
    setShowVolunteerForm(false);
    setSelectedVolunteer(null);
  };

  const handleOpenDashboard = () => {
    setShowVolunteerDashboard(true);
  };

  const handleCloseDashboard = () => {
    setShowVolunteerDashboard(false);
  };

  // Update volunteer stats when a new volunteer registers
  const handleVolunteerRegistration = (volunteerData) => {
    setUserVolunteerStats((prev) => ({
      ...prev,
      activitiesCompleted: prev.activitiesCompleted + 1,
      skillsUtilized: [...prev.skillsUtilized, ...volunteerData.skills],
      lastActivity: new Date().toISOString(),
    }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-grow md:ml-48 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4"
            >
              Support Disaster Relief Efforts
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="max-w-2xl mx-auto text-lg text-gray-600"
            >
              Your contribution can make a significant difference in the lives
              of those affected by natural disasters across India.
            </motion.p>
          </div>

          {/* Tabs for Donations and Volunteers */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex rounded-md shadow-sm" role="group">
              <button
                type="button"
                onClick={() => setActiveTab("donations")}
                className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
                  activeTab === "donations"
                    ? "bg-yellow-500 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                Donate Funds
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("volunteers")}
                className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
                  activeTab === "volunteers"
                    ? "bg-blue-500 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                Volunteer Time
              </button>
            </div>
            {activeTab === "volunteers" && (
              <button
                onClick={handleOpenDashboard}
                className="ml-4 inline-flex items-center px-3 py-2 text-sm font-medium rounded-md bg-green-500 text-white hover:bg-green-600"
              >
                <svg
                  className="mr-2 -ml-1 h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                My Volunteer Dashboard
              </button>
            )}
          </div>

          {activeTab === "donations" ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {disasterData.map((disaster) => (
                <DisasterCard
                  key={disaster.id}
                  disaster={disaster}
                  onClick={handleDisasterClick}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {volunteerData.map((volunteer) => (
                <VolunteerCard
                  key={volunteer.id}
                  volunteer={volunteer}
                  onClick={handleVolunteerClick}
                />
              ))}
            </motion.div>
          )}
        </div>
      </main>

      <Footer />

      <AnimatePresence>
        {/* Disaster Detail Modal */}
        {selectedDisaster && !showDonationForm && activeTab === "donations" && (
          <DisasterDetailModal
            disaster={selectedDisaster}
            onClose={handleCloseModal}
            onDonate={handleDonateClick}
            onSwitchToVolunteer={(volunteer) => {
              setActiveTab("volunteers");
              setSelectedVolunteer(volunteer);
            }}
          />
        )}

        {/* Donation Form */}
        {showDonationForm && selectedDisaster && (
          <DonationForm
            disaster={selectedDisaster}
            onClose={handleCloseDonationForm}
          />
        )}

        {/* Volunteer Detail Modal */}
        {selectedVolunteer &&
          !showVolunteerForm &&
          activeTab === "volunteers" && (
            <VolunteerDetailModal
              volunteer={selectedVolunteer}
              onClose={handleCloseModal}
              onVolunteer={handleVolunteerRegisterClick}
            />
          )}

        {/* Volunteer Registration Form */}
        {showVolunteerForm && selectedVolunteer && (
          <VolunteerRegistrationForm
            volunteer={selectedVolunteer}
            onClose={handleCloseVolunteerForm}
            onVolunteerRegistration={handleVolunteerRegistration}
          />
        )}

        {/* Volunteer Dashboard */}
        {showVolunteerDashboard && (
          <VolunteerDashboard
            volunteerStats={userVolunteerStats}
            onClose={handleCloseDashboard}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default Donation;
