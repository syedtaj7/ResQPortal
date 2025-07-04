import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaPhone, FaHandsHelping } from "react-icons/fa";
import Footer from "../components/Footer";
import Header from "../components/Header"; // Import Header component
import TranslatableText from "../components/TranslatableText"; // Import TranslatableText component
import { useTheme } from "../contexts/ThemeContext"; // Import useTheme hook

// Add this after your imports
const stateColors = {
  "North India": {
    gradient: "from-red-600 to-red-800",
    hover: "hover:shadow-red-500/10",
    border: "hover:border-red-500/50",
  },
  "South India": {
    gradient: "from-yellow-600 to-yellow-800",
    hover: "hover:shadow-yellow-500/10",
    border: "hover:border-yellow-500/50",
  },
  "East India": {
    gradient: "from-green-600 to-green-800",
    hover: "hover:shadow-green-500/10",
    border: "hover:border-green-500/50",
  },
  "West India": {
    gradient: "from-purple-600 to-purple-800",
    hover: "hover:shadow-purple-500/10",
    border: "hover:border-purple-500/50",
  },
  "Central India": {
    gradient: "from-blue-600 to-blue-800",
    hover: "hover:shadow-blue-500/10",
    border: "hover:border-blue-500/50",
  },
  "Northeast India": {
    gradient: "from-teal-600 to-teal-800",
    hover: "hover:shadow-teal-500/10",
    border: "hover:border-teal-500/50",
  },
};

// Add this function to determine state region
const getStateRegion = (stateName) => {
  const regions = {
    "North India": [
      "Delhi",
      "Haryana",
      "Himachal Pradesh",
      "Jammu and Kashmir",
      "Punjab",
      "Rajasthan",
      "Uttarakhand",
    ],
    "South India": [
      "Andhra Pradesh",
      "Karnataka",
      "Kerala",
      "Tamil Nadu",
      "Telangana",
    ],
    "East India": ["Bihar", "Jharkhand", "Odisha", "West Bengal"],
    "West India": ["Goa", "Gujarat", "Maharashtra"],
    "Central India": ["Chhattisgarh", "Madhya Pradesh", "Uttar Pradesh"],
    "Northeast India": [
      "Arunachal Pradesh",
      "Assam",
      "Manipur",
      "Meghalaya",
      "Mizoram",
      "Nagaland",
      "Sikkim",
      "Tripura",
    ],
  };

  for (const [region, states] of Object.entries(regions)) {
    if (states.includes(stateName)) {
      return region;
    }
  }
  return "Central India"; // default
};

// Add these animation variants after your imports
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
  },
};

const SearchBar = ({ onSearch }) => {
  const { darkMode } = useTheme();

  return (
    <div className="relative max-w-2xl mx-auto mb-12">
      <input
        type="text"
        placeholder="Search by state name or NGO..." // We can't use JSX in placeholder
        className={`w-full px-6 py-4 rounded-xl border transition-all
          ${
            darkMode
              ? "bg-dark-bg-secondary text-white border-gray-700 placeholder-gray-500"
              : "bg-[#F8F8F8] text-black border-gray-300 placeholder-gray-400"
          }
          focus:ring-2 focus:ring-yellow-500 focus:border-transparent`}
        onChange={(e) => onSearch(e.target.value)}
      />
      <div
        className={`absolute right-4 top-1/2 -translate-y-1/2 ${
          darkMode ? "text-gray-400" : "text-gray-500"
        }`}
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
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
    </div>
  );
};

const DetailModal = ({ state, onClose }) => {
  const { darkMode } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-[9999] overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className={`${
          darkMode ? "bg-gray-900" : "bg-white"
        } rounded-xl w-full max-w-2xl my-8`}
      >
        <div className="max-h-[90vh] overflow-y-auto">
          <div
            className={`sticky top-0 ${
              darkMode
                ? "bg-gray-900 border-gray-800"
                : "bg-white border-gray-200"
            } px-8 py-6 border-b z-20`}
          >
            <div className="flex justify-between items-center">
              <h2
                className={`text-2xl font-bold ml-2 ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {state.state}
              </h2>
              <button
                onClick={onClose}
                className={`transition-colors p-2 rounded-lg ${
                  darkMode
                    ? "text-gray-400 hover:text-white hover:bg-gray-800"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                }`}
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div className="px-10 py-8 space-y-6">
            <div className="space-y-4">
              <div
                className={`p-4 rounded-lg ${
                  darkMode ? "bg-blue-900/50" : "bg-blue-100"
                }`}
              >
                <h3
                  className={`text-lg font-semibold mb-2 ${
                    darkMode ? "text-blue-200" : "text-blue-800"
                  }`}
                >
                  <TranslatableText>Emergency Contacts</TranslatableText>
                </h3>
                <div
                  className={`space-y-2 ${
                    darkMode ? "text-blue-100" : "text-blue-900"
                  }`}
                >
                  <p>
                    <span className="font-medium">
                      <TranslatableText>Main:</TranslatableText>
                    </span>{" "}
                    {state.contacts.main}
                  </p>
                  <p>
                    <span className="font-medium">
                      <TranslatableText>Email:</TranslatableText>
                    </span>{" "}
                    {state.contacts.email}
                  </p>
                  <p>
                    <span className="font-medium">
                      <TranslatableText>Address:</TranslatableText>
                    </span>{" "}
                    {state.contacts.address}
                  </p>
                </div>
              </div>

              <div
                className={`p-4 rounded-lg ${
                  darkMode ? "bg-green-900/50" : "bg-green-100"
                }`}
              >
                <h3
                  className={`text-lg font-semibold mb-4 ${
                    darkMode ? "text-green-200" : "text-green-800"
                  }`}
                >
                  <TranslatableText>Local NGOs</TranslatableText>
                </h3>
                <div className="grid gap-4">
                  {state.ngos.map((ngo, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg transition-colors ${
                        darkMode
                          ? "bg-black/25 hover:bg-black/40"
                          : "bg-white hover:bg-gray-50 shadow-sm"
                      }`}
                    >
                      <p
                        className={`font-medium ${
                          darkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {ngo.name}
                      </p>
                      <p
                        className={`text-sm ${
                          darkMode ? "text-green-200" : "text-green-800"
                        }`}
                      >
                        <TranslatableText as="span">Address:</TranslatableText>{" "}
                        {ngo.address}
                      </p>
                      <p
                        className={`text-sm ${
                          darkMode ? "text-green-200" : "text-green-800"
                        }`}
                      >
                        <TranslatableText as="span">Phone:</TranslatableText>{" "}
                        {ngo.phone}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

function About() {
  const { darkMode } = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedState, setSelectedState] = useState(null);
  const [error] = useState(null);

  const stateContacts = {
    national: {
      name: "National Disaster Management Authority",
      address: "NDMA Bhawan A-1, Safdarjung Enclave New Delhi - 110029",
      phone: "+91-11-26701728",
      email: "controlroom@ndma.gov.in",
      fax: "+91-11-26701729",
    },
    states: [
      {
        state: "Andhra Pradesh",
        contacts: {
          main: "+91 8645246600, 0863-2377099",
          email: "ed-apsdma@ap.gov.in",
          address:
            "Genious JR Towers, D.No:21/2B, Pathuru Cross Road Centre, Tadepalli Mandal, Guntur District, AP-522501",
        },
        ngos: [
          {
            name: "Gayatri Rural Educational Society",
            address: "Bharathi Sriramulu Nivas, Bankars Colony, Srikakulam",
            phone: "08942-211069",
          },
          {
            name: "Voluntary Integrated Development Society",
            address: "D.no. 10-2-211/20-21, Teachers Colony, Rayadurg",
            phone: "08942-211069",
          },
          {
            name: "Adarsha Rural Development Society",
            address: "Kodikonda Village, Chilamathur, Anantapur",
            phone: "08942-211069",
          },
          {
            name: "Green Field Rural Development Society",
            address: "Somaghatta Village, Chilamathur Mandal",
            phone: "08556-201224",
          },
          {
            name: "Gramajeevan Youth Association",
            address: "Nallarallapalli, Kanisettypalli Post",
            phone: "08556-204050",
          },
        ],
      },
      {
        state: "Arunachal Pradesh",
        contacts: {
          main: "8974126892, 7085761208",
          email: "angujogam@gmail.com",
          address: "District Disaster Management Office, HQ",
        },
        ngos: [
          {
            name: "Tribal Welfare Development Society",
            address: "Chatim Lodge 1st Floor Near P.K.point, Changlang",
            phone: "03808-223020",
          },
          {
            name: "Mahabodhi Maitri Mandala",
            address: "Jyotipur Village, P.O. Diyun, Via- Namsai",
            phone: "8258881057",
          },
          {
            name: "Seva Kendra Arunachal East",
            address: "P.O. Miao, Changlang",
            phone: "9862239485",
          },
          {
            name: "Diocese of Miao",
            address: "Miao, P.O Miao, Changlang",
            phone: "8131851234",
          },
          {
            name: "Akarum Society",
            address: "Jairampur, Changlang District",
            phone: "9378131767",
          },
        ],
      },
      {
        state: "Assam",
        contacts: {
          main: "1070 (Toll Free), 0361-2237219",
          email: "sdma.assam@gmail.com",
          address: "State Control Room, Dispur",
        },
        ngos: [
          {
            name: "Uttar Betna Samaj Sangskarak",
            address: "Village Maharipara, Baksa",
            phone: "9859086738",
          },
          {
            name: "Ababeel Foundation",
            address: "Vill- Bhakuamari, Baksa",
            phone: "8812892931",
          },
          {
            name: "Nagada",
            address: "H.O/P.O: Doomni dist: Baksa",
            phone: "9101126993",
          },
          {
            name: "Anbesha Group of Society",
            address: "Vill- Niz Juluki, Baksa",
            phone: "8402996494",
          },
          {
            name: "Namsecdo",
            address: "Bareigaon, Ghagra Chowk, Baksa",
            phone: "7002932558",
          },
        ],
      },
      {
        state: "Bihar",
        contacts: {
          main: "0612-2547232",
          email: "info@bsdma.org",
          address: "Sardar Patel Bhawan, 5th Floor, Nehru Path, Patna-800023",
        },
        ngos: [
          {
            name: "Fight For Right Association",
            address: "Alimuddin Iqbal Market, Araria",
            phone: "9973607875",
          },
          {
            name: "Xavier Foundation",
            address: "Keshri Tola, Kothi Hat Road, Forbesganj",
            phone: "9939260016",
          },
          {
            name: "Bharti Sewa Sadan Trust",
            address: "Shivpuri, Ward No- 09 Bhudan",
            phone: "7782833655",
          },
          {
            name: "Bhardwaj Sewa Kendra",
            address: "Sultan Pokhar, Forbesganj",
            phone: "7781804022",
          },
          {
            name: "Manokamana",
            address: "Hanumant Nagar, Araria",
            phone: "9931028432",
          },
        ],
      },
      {
        state: "Chhattisgarh",
        contacts: {
          main: "07751-221004",
          email: "relief.cg@nic.in",
          address: "Office of the Collector and District Magistrate",
        },
        ngos: [
          {
            name: "Association of Professional Social Workers",
            address: "Krishna Enclave, Raipur",
            phone: "9417170356",
          },
          {
            name: "Institute for Social Research",
            address: "Sector 15, Bhilai",
            phone: "9872709772",
          },
          {
            name: "Environment Society of India",
            address: "Karuna Sadan, Raipur",
            phone: "9417004937",
          },
          {
            name: "Srisai Cultural Development Society",
            address: "Nayanapalli Village, Raipur",
            phone: "8701843732",
          },
          {
            name: "Assembly of Believers Trust",
            address: "Astha Apartments, Raipur",
            phone: "8289016677",
          },
        ],
      },
      {
        state: "Goa",
        contacts: {
          main: "0832-2419550",
          email: "controlroom.goa@nic.in",
          address: "Secretariat, Alto-Porvorim, Goa-403501",
        },
        ngos: [
          {
            name: "Amar Bharati Gram Vikas Sanstha",
            address: "Anandi Rajput Niwas, Bicholim",
            phone: "9247352663",
          },
          {
            name: "El Shaddai Charitable Trust",
            address: "Socol Vaddo, Assagao",
            phone: "9260671710",
          },
          {
            name: "Eco Kshatriya Foundation",
            address: "Bairo Palmar, St. Estevam",
            phone: "7757002102",
          },
          {
            name: "Futsal Association of Goa",
            address: "Pearl Building, Assolna",
            phone: "9423837501",
          },
          {
            name: "Carmelite Monestry",
            address: "Cloistered Carmel, Chicalim",
            phone: "9545925938",
          },
        ],
      },
      {
        state: "Gujarat",
        contacts: {
          main: "+91-79-23259283",
          email: "smgr5-gsdma@gujarat.gov.in",
          address: "Block No.11, 5th Floor, Udyog Bhavan, Gandhinagar",
        },
        ngos: [
          {
            name: "Mahiti",
            address: "Dholera opp. Bhimtalav",
            phone: "9558803902",
          },
          {
            name: "Nehru Foundation for Development",
            address: "Thaltej Tekra, Ahmedabad",
            phone: "9825415319",
          },
          {
            name: "Dharti Charitable Trust",
            address: "Dahegamda, Bavla",
            phone: "9824424371",
          },
          {
            name: "Khushbu Jivan Jyot Vikas Trust",
            address: "G.H.Board, Bapunagar",
            phone: "9898961684",
          },
          {
            name: "Sahyog Pragati Mandal",
            address: "Ambica Nagar Society",
            phone: "9426948537",
          },
        ],
      },
      {
        state: "Haryana",
        contacts: {
          main: "8558893911",
          email: "sdma@haryana.gov.in",
          address: "Revenue & Disaster Management Department, Chandigarh",
        },
        ngos: [
          {
            name: "Infosys Federation",
            address: "Sharda Nagar, Ambala",
            phone: "9416665790",
          },
          {
            name: "Logos Faith Foundation",
            address: "Himmat Pura, Ambala",
            phone: "9896491313",
          },
          {
            name: "District Red Cross Society",
            address: "Court Road, Ambala",
            phone: "9416494782",
          },
          {
            name: "Samuh",
            address: "Kanwla Near Gurudwara",
            phone: "9888005979",
          },
          {
            name: "Amolly Foundation",
            address: "Dayal Bagh, Ambala Cantt",
            phone: "7988788519",
          },
        ],
      },
      {
        state: "Himachal Pradesh",
        contacts: {
          main: "0177-2880331",
          email: "sdma-hp@nic.in",
          address: "HP Secretariat, Shimla-171002",
        },
        ngos: [
          {
            name: "Shitikantha Welfare Society",
            address: "Village Glassin, Ghumarwin",
            phone: "9736085002",
          },
          {
            name: "Arpan Foundation",
            address: "Amarpur, Ghumarwin",
            phone: "9418017280",
          },
          {
            name: "Krishak Vikas Association",
            address: "Village Swara, Ghumarwin",
            phone: "7018060961",
          },
          {
            name: "Baglamukhi Human Being Society",
            address: "Vill Soi, Ghumarwin",
            phone: "7974310549",
          },
          {
            name: "High Tech Education Society",
            address: "Purthi Tehsil Pangi",
            phone: "8988281433",
          },
        ],
      },
      {
        state: "Jharkhand",
        contacts: {
          main: "2400220, 2400700",
          email: "homejharkhand@gmail.com",
          address: "2nd Floor, Project Bhawan, Dhurwa, Ranchi-834004",
        },
        ngos: [
          {
            name: "Sahyogini",
            address: "Bahadurpur, Bokaro",
            phone: "9431145778",
          },
          {
            name: "Shree Amar Sanskar Kalyan Kendra",
            address: "Prasad Bhawan, Jainamore",
            phone: "9430768685",
          },
          {
            name: "IITTS Private Education Trust",
            address: "Bari Co-operative Colony, Bokaro",
            phone: "9430771117",
          },
          {
            name: "Aastha Rehabilitation Centre",
            address: "Main Road Phusro, Bermo",
            phone: "9905338888",
          },
          {
            name: "Adhunik Mahila Utthan Samiti",
            address: "Sector-2/d, Bokaro Steel City",
            phone: "7654874721",
          },
        ],
      },
      {
        state: "Karnataka",
        contacts: {
          main: "+91 080 67355000",
          email: "Director@ksndmc.org",
          address: "Major Sandeep Unnikrishnan Road, Bangalore-560064",
        },
        ngos: [
          {
            name: "BCM Grameen Abhivrddai",
            address: "Badaradinni, Bilagi",
            phone: "9972841191",
          },
          {
            name: "Matrushakti Grameen",
            address: "Basaveshwar Nagar Bilagi",
            phone: "9535428143",
          },
          {
            name: "Village Foundation",
            address: "Main Road Channal",
            phone: "9740946030",
          },
          {
            name: "Navodaya Rural Development",
            address: "Engineering College Road, Bagalkot",
            phone: "9441101306",
          },
          {
            name: "Vrutti",
            address: "AECS Layout, RMV 2nd Stage",
            phone: "9480990870",
          },
        ],
      },
      {
        state: "Kerala",
        contacts: {
          main: "0471-2364424",
          email: "keralasdma@gmail.com",
          address:
            "Observatory Hills, Vikas Bhavan P.O, Thiruvananthapuram-695033",
        },
        ngos: [
          {
            name: "Alleppey Diocesan Charitable Society",
            address: "Convent Square, Alappuzha",
            phone: "9446544899",
          },
          {
            name: "Malankara Orthodox Church Mission",
            address: "St Pauls Mission, Mavelikkara",
            phone: "9947399066",
          },
          {
            name: "Sriyog Sadhanapadham",
            address: "Educational Trust, Alappuzha",
            phone: "9497112606",
          },
          {
            name: "Winfrid Students Social Welfare",
            address: "Samina Manzil, Alappuzha",
            phone: "8943155331",
          },
          {
            name: "Moksha Charitable Foundation",
            address: "Vadakketh House, Alappuzha",
            phone: "9048098940",
          },
        ],
      },
      {
        state: "Madhya Pradesh",
        contacts: {
          main: "0755-2446132",
          email: "mpstatecoord.sdma@mp.gov.in",
          address: "Paryavaran Parisar, Bhopal-462016",
        },
        ngos: [
          {
            name: "Aastha Gramothan Samiti",
            address: "Village Nipaniya, Agar Malwa",
            phone: "7999845733",
          },
          {
            name: "Aadivasi Sabhayta",
            address: "Patel Falya, Jobat",
            phone: "8305553525",
          },
          {
            name: "Virat Social Welfare Society",
            address: "Amarkantak Road, Anuppur",
            phone: "9713374567",
          },
          {
            name: "Devendra Kumar Foundation",
            address: "Village Post Cholna, Anuppur",
            phone: "7566003154",
          },
          {
            name: "Gurudev Samaj Kalyan Samiti",
            address: "Sharma Colony, Ashoknagar",
            phone: "9826219324",
          },
        ],
      },
      {
        state: "Maharashtra",
        contacts: {
          main: "022-22694719",
          email: "dmcell.mumbai@gmail.com",
          address: "Municipal Head Office, Mumbai-400001",
        },
        ngos: [
          {
            name: "Smruti Gramin Adivasi Vikas",
            address: "K.G.Road, Akole, Ahmednagar",
            phone: "9423462260",
          },
          {
            name: "Lokmudra Foundation",
            address: "Manusawali, Akole",
            phone: "9765308811",
          },
          {
            name: "Rashtratej Gramin Vikas Sanstha",
            address: "Ambalica Sugar Factory, Karjat",
            phone: "8805941515",
          },
          {
            name: "Muskan Social Welfare",
            address: "Ekta Colony, Ahmednagar",
            phone: "9545687868",
          },
          {
            name: "Dnyanganga Gramin Sheti",
            address: "Nirmal Nagar, Sangamner",
            phone: "9689981166",
          },
        ],
      },
      {
        state: "Manipur",
        contacts: {
          main: "0385-2458385",
          email: "sdma.manipur@gov.in",
          address: "Deputy Commissioner Office, Imphal East",
        },
        ngos: [
          {
            name: "Peoples Foundation Manipur",
            address: "Kumbi Bazar, Bishnupur",
            phone: "9856611334",
          },
          {
            name: "Rural Development Association",
            address: "Keinou Bazar, Nambol",
            phone: "9615446446",
          },
          {
            name: "Youth Development Association",
            address: "Keinou Thongkha, Bishnupur",
            phone: "9862502040",
          },
          {
            name: "Tidim Peoples Foundation",
            address: "Kwakta Sabal Leikai, Moirang",
            phone: "9615119081",
          },
          {
            name: "Rural Educational Development",
            address: "Thanga Tongbram, Moirang",
            phone: "9436039543",
          },
        ],
      },
      {
        state: "Meghalaya",
        contacts: {
          main: "0364-2502098",
          email: "sdmadeptt-meg@gov.in",
          address: "Lower Lachumiere, Shillong-793001",
        },
        ngos: [
          {
            name: "Khyrim Multipurpose Society",
            address: "Nongkrem",
            phone: "9862471383",
          },
          {
            name: "Khasi Cultural Society",
            address: "Mawsynram",
            phone: "8794997834",
          },
          {
            name: "Kayzey Society",
            address: "Mawngap Mawsmai",
            phone: "9402554223",
          },
          {
            name: "Bosco Reach Out",
            address: "Sacred Heart College, Shillong",
            phone: "9435569149",
          },
          {
            name: "Missionary Sisters of Mary",
            address: "East Khasi Hills",
            phone: "9435341836",
          },
        ],
      },
      {
        state: "Mizoram",
        contacts: {
          main: "0389-2329202",
          email: "sdma-miz@nic.in",
          address: "Disaster Management & Rehabilitation, Aizawl-796001",
        },
        ngos: [
          {
            name: "COD NERC",
            address: "Dr C. Lalthanga Building, Aizawl",
            phone: "9862551753",
          },
          {
            name: "Gan Sabra Society",
            address: "Zonuam, Aizawl",
            phone: "9436362493",
          },
          {
            name: "Mission Foundation Movement",
            address: "Bawngkawn, Lunglei Road",
            phone: "9862558637",
          },
          {
            name: "Zomi Cultural Society",
            address: "Bawngkawn South, Aizawl",
            phone: "9089239299",
          },
          {
            name: "Hoi Philoi",
            address: "Tuikual North, Aizawl",
            phone: "9862539298",
          },
        ],
      },
      {
        state: "Nagaland",
        contacts: {
          main: "0370-2291122",
          email: "sdma.nagaland@nsdma.org",
          address: "Civil Secretariat, Kohima-797001",
        },
        ngos: [
          {
            name: "Bethesda Youth Welfare Centre",
            address: "Circuit House Colony, Dimapur",
            phone: "9436003967",
          },
          {
            name: "Abiogenesis Society",
            address: "Nuton Bosti, Dimapur",
            phone: "9436003009",
          },
          {
            name: "Development Association of Nagaland",
            address: "Bishops House, Dimapur",
            phone: "9862919542",
          },
          {
            name: "Pro Rural",
            address: "OK Complex, Dimapur",
            phone: "9436832176",
          },
          {
            name: "Khala Lagha Welfare Society",
            address: "Thilixu Village, Dimapur",
            phone: "9089140461",
          },
        ],
      },
      {
        state: "Odisha",
        contacts: {
          main: "18001218242",
          email: "revsec.od@nic.in",
          address:
            "Revenue & Disaster Management Department, Bhubaneswar-751001",
        },
        ngos: [
          {
            name: "Thermal Youth Club",
            address: "Talcher Thermal, Anugul",
            phone: "9938741114",
          },
          {
            name: "Centre for Development Service",
            address: "Banarpal, Anugul",
            phone: "9937683561",
          },
          {
            name: "Social Research Institute",
            address: "Manpur, Bantala",
            phone: "9937795291",
          },
          {
            name: "FREMSS Odisha",
            address: "Podagarh, Rengali",
            phone: "9937509718",
          },
          {
            name: "National Education Society",
            address: "Mohanipal, Derang",
            phone: "9437821823",
          },
        ],
      },
      {
        state: "Punjab",
        contacts: {
          main: "0172-2740611",
          email: "punjabdisaster@gmail.com",
          address: "2nd Floor, Punjab Civil Secretariat-1, Chandigarh",
        },
        ngos: [
          {
            name: "Captain Gurdeep Singh Society",
            address: "National City Homes, Amritsar",
            phone: "9501141111",
          },
          {
            name: "Lok Kalyan Samiti",
            address: "New Ranjitpura-3, Chheharta",
            phone: "9872465799",
          },
          {
            name: "SSAI Creations",
            address: "Partap Avenue, Amritsar",
            phone: "9888282228",
          },
          {
            name: "United Khalsa Foundation",
            address: "Ganda Singh Colony, Amritsar",
            phone: "9779798601",
          },
          {
            name: "Kirtan Promotion Society",
            address: "Ganda Singh Colony, Tarn Taran Road",
            phone: "8288987140",
          },
        ],
      },
      {
        state: "Rajasthan",
        contacts: {
          main: "0141-2227084",
          email: "relief-rj@nic.in",
          address: "DM & Relief Department, Jaipur",
        },
        ngos: [
          {
            name: "Social Participation Rural Health",
            address: "Mission Compound, Nasirabad",
            phone: "9414379407",
          },
          {
            name: "Saaransh",
            address: "Housing Board Colony, Ajmer",
            phone: "9828371806",
          },
          {
            name: "Roman Catholic Social Service",
            address: "Near Power House, Madar",
            phone: "9460177710",
          },
          {
            name: "Gramin Mahila Vikash Sansthan",
            address: "Sumer Nagar, Madanganj",
            phone: "9672979032",
          },
          {
            name: "Kalyani Rural Development",
            address: "Panchsheel Housing Board, Ajmer",
            phone: "9413501910",
          },
        ],
      },
      {
        state: "Sikkim",
        contacts: {
          main: "03592-202675",
          email: "sikkimsdma@gmail.com",
          address: "Secretariat, Gangtok",
        },
        ngos: [
          {
            name: "Sikkim Development Foundation",
            address: "Gangtok",
            phone: "03592-202675",
          },
          {
            name: "Sikkim Manipal University",
            address: "Gangtok",
            phone: "03592-202675",
          },
          {
            name: "Sikkim State AIDS Control Society",
            address: "Gangtok",
            phone: "03592-202675",
          },
          {
            name: "Sikkim State Legal Services Authority",
            address: "Gangtok",
            phone: "03592-202675",
          },
          {
            name: "Sikkim State Social Welfare Board",
            address: "Gangtok",
            phone: "03592-202675",
          },
        ],
      },
      {
        state: "Tamil Nadu",
        contacts: {
          main: "044-25671545",
          email: "tnsdma@tn.gov.in",
          address: "Ezhilagam, Chepauk, Chennai-600005",
        },
        ngos: [
          {
            name: "Tamil Nadu Voluntary Health Association",
            address: "Chennai",
            phone: "044-25671545",
          },
          {
            name: "Tamil Nadu Science Forum",
            address: "Chennai",
            phone: "044-25671545",
          },
          {
            name: "Tamil Nadu Women's Collective",
            address: "Chennai",
            phone: "044-25671545",
          },
          {
            name: "Tamil Nadu Social Service Society",
            address: "Chennai",
            phone: "044-25671545",
          },
          {
            name: "Tamil Nadu State AIDS Control Society",
            address: "Chennai",
            phone: "044-25671545",
          },
        ],
      },
      {
        state: "Telangana",
        contacts: {
          main: "040-23456005",
          email: "sdma.telangana@gmail.com",
          address: "BRKR Bhavan, Tank Bund Road, Hyderabad-500063",
        },
        ngos: [
          {
            name: "Telangana State AIDS Control Society",
            address: "Hyderabad",
            phone: "040-23456005",
          },
          {
            name: "Telangana State Legal Services Authority",
            address: "Hyderabad",
            phone: "040-23456005",
          },
          {
            name: "Telangana State Social Welfare Board",
            address: "Hyderabad",
            phone: "040-23456005",
          },
          {
            name: "Telangana State Women's Commission",
            address: "Hyderabad",
            phone: "040-23456005",
          },
          {
            name: "Telangana State Youth Welfare Board",
            address: "Hyderabad",
            phone: "040-23456005",
          },
        ],
      },
      {
        state: "Tripura",
        contacts: {
          main: "0381-2416045",
          email: "sdma.tripura@gmail.com",
          address: "Secretariat, Agartala",
        },
        ngos: [
          {
            name: "Tripura State AIDS Control Society",
            address: "Agartala",
            phone: "0381-2416045",
          },
          {
            name: "Tripura State Legal Services Authority",
            address: "Agartala",
            phone: "0381-2416045",
          },
          {
            name: "Tripura State Social Welfare Board",
            address: "Agartala",
            phone: "0381-2416045",
          },
          {
            name: "Tripura State Women's Commission",
            address: "Agartala",
            phone: "0381-2416045",
          },
          {
            name: "Tripura State Youth Welfare Board",
            address: "Agartala",
            phone: "0381-2416045",
          },
        ],
      },
      {
        state: "Uttar Pradesh",
        contacts: {
          main: "0522-2238419",
          email: "sdma.up@gmail.com",
          address: "Bapu Bhawan, Secretariat, Lucknow-226001",
        },
        ngos: [
          {
            name: "Uttar Pradesh State AIDS Control Society",
            address: "Lucknow",
            phone: "0522-2238419",
          },
          {
            name: "Uttar Pradesh State Legal Services Authority",
            address: "Lucknow",
            phone: "0522-2238419",
          },
          {
            name: "Uttar Pradesh State Social Welfare Board",
            address: "Lucknow",
            phone: "0522-2238419",
          },
          {
            name: "Uttar Pradesh State Women's Commission",
            address: "Lucknow",
            phone: "0522-2238419",
          },
          {
            name: "Uttar Pradesh State Youth Welfare Board",
            address: "Lucknow",
            phone: "0522-2238419",
          },
        ],
      },
      {
        state: "Uttarakhand",
        contacts: {
          main: "0135-2710334",
          email: "sdma.uk@gmail.com",
          address: "Secretariat, Dehradun",
        },
        ngos: [
          {
            name: "Uttarakhand State AIDS Control Society",
            address: "Dehradun",
            phone: "0135-2710334",
          },
          {
            name: "Uttarakhand State Legal Services Authority",
            address: "Dehradun",
            phone: "0135-2710334",
          },
          {
            name: "Uttarakhand State Social Welfare Board",
            address: "Dehradun",
            phone: "0135-2710334",
          },
          {
            name: "Uttarakhand State Women's Commission",
            address: "Dehradun",
            phone: "0135-2710334",
          },
          {
            name: "Uttarakhand State Youth Welfare Board",
            address: "Dehradun",
            phone: "0135-2710334",
          },
        ],
      },
      {
        state: "West Bengal",
        contacts: {
          main: "033-22143526",
          email: "sdma.wb@gmail.com",
          address: "Nabanna, Howrah",
        },
        ngos: [
          {
            name: "West Bengal State AIDS Control Society",
            address: "Howrah",
            phone: "033-22143526",
          },
          {
            name: "West Bengal State Legal Services Authority",
            address: "Howrah",
            phone: "033-22143526",
          },
          {
            name: "West Bengal State Social Welfare Board",
            address: "Howrah",
            phone: "033-22143526",
          },
          {
            name: "West Bengal State Women's Commission",
            address: "Howrah",
            phone: "033-22143526",
          },
          {
            name: "West Bengal State Youth Welfare Board",
            address: "Howrah",
            phone: "033-22143526",
          },
        ],
      },
    ],
  };

  const filteredStates = stateContacts.states.filter((state) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      state.state.toLowerCase().includes(searchLower) ||
      state.ngos.some((ngo) => ngo.name.toLowerCase().includes(searchLower))
    );
  });

  // Add this before your return statement
  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 overflow-x-hidden">
      <Header transparent={true} />

      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-green-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <main className="relative z-10 pt-32 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {" "}
        {/* Added pt-24 */}
        {/* Modern Hero Section */}
        <div className="text-center mb-16">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold text-white mb-6 bg-gradient-to-r from-red-400 via-blue-400 to-green-400 bg-clip-text text-transparent"
          >
            <TranslatableText>Emergency Services Directory</TranslatableText>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
          >
            <TranslatableText>
              Quick access to emergency contacts and helplines across India for
              immediate assistance during disasters
            </TranslatableText>
          </motion.p>
        </div>
        <SearchBar onSearch={setSearchTerm} />
        {/* State Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-16 max-w-full">
          {filteredStates.map((state, index) => {
            const region = getStateRegion(state.state);
            const colors = stateColors[region];

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedState(state)}
                className={`bg-gray-800 rounded-xl overflow-hidden cursor-pointer hover:bg-gray-750
                  transition-all hover:shadow-xl ${colors.hover} border border-gray-700
                  ${colors.border}`}
              >
                <div className={`bg-gradient-to-r ${colors.gradient} p-4`}>
                  <h3 className="text-xl font-bold text-white">
                    <TranslatableText>{state.state}</TranslatableText>
                  </h3>
                </div>

                <div className="p-4 space-y-4">
                  <div className="flex items-center space-x-2 text-gray-300">
                    <FaPhone className="w-4 h-4" />
                    <span>{state.contacts.main}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-300">
                    <FaHandsHelping className="w-4 h-4" />
                    <span>
                      <TranslatableText>
                        {state.ngos.length} <span>NGOs Available</span>
                      </TranslatableText>
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
        {/* About Section - Moved down */}
        <section
          className={`max-w-4xl mx-auto mb-20 ${
            darkMode ? "bg-dark-bg-secondary" : "bg-[#F8F8F8]"
          }`}
        >
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className={`${
              darkMode
                ? "bg-dark-bg-secondary border-gray-700/50"
                : "bg-[#F8F8F8] border-gray-300/50"
            } backdrop-blur-sm border rounded-2xl p-8 shadow-xl`}
          >
            <motion.h2
              variants={itemVariants}
              className="text-3xl font-bold text-transparent bg-clip-text bg-yellow-300
                 mb-8 text-center"
            >
              <TranslatableText>About ResQTech</TranslatableText>
            </motion.h2>

            <motion.div
              variants={itemVariants}
              className="grid md:grid-cols-2 gap-8 mb-8"
            >
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-yellow-400">
                  <TranslatableText>Our Mission</TranslatableText>
                </h3>
                <p
                  className={`${
                    darkMode ? "text-gray-300" : "text-gray-600"
                  } leading-relaxed`}
                >
                  <TranslatableText>
                    ResQTech is dedicated to revolutionizing disaster management
                    through technology. We provide real-time monitoring, early
                    warnings, and comprehensive support during various types of
                    disasters.
                  </TranslatableText>
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-yellow-400">
                  <TranslatableText>Our Impact</TranslatableText>
                </h3>
                <p
                  className={`${
                    darkMode ? "text-gray-300" : "text-gray-600"
                  } leading-relaxed`}
                >
                  <TranslatableText>
                    We've helped communities across India prepare for, respond
                    to, and recover from disasters effectively. Our platform
                    connects those in need with emergency services and relief
                    organizations.
                  </TranslatableText>
                </p>
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="grid md:grid-cols-3 gap-6 text-center"
            >
              <div
                className={`${
                  darkMode
                    ? "bg-dark-bg-tertiary/50 border-gray-700/50"
                    : "bg-[#F8F8F8]/50 border-gray-300/50"
                } p-6 rounded-xl border`}
              >
                <div
                  className={`${
                    darkMode ? "text-white" : "text-black"
                  } text-4xl font-bold mb-2`}
                >
                  24/7
                </div>
                <div
                  className={`${darkMode ? "text-gray-300" : "text-gray-500"}`}
                >
                  <TranslatableText>Emergency Support</TranslatableText>
                </div>
              </div>

              <div
                className={`${
                  darkMode
                    ? "bg-dark-bg-tertiary/50 border-gray-700/50"
                    : "bg-[#F8F8F8]/50 border-gray-300/50"
                } p-6 rounded-xl border`}
              >
                <div
                  className={`${
                    darkMode ? "text-white" : "text-black"
                  } text-4xl font-bold mb-2`}
                >
                  <TranslatableText>One Stop</TranslatableText>
                </div>
                <div
                  className={`${darkMode ? "text-gray-300" : "text-gray-500"}`}
                >
                  <TranslatableText>For all Disaster needs</TranslatableText>
                </div>
              </div>

              <div
                className={`${
                  darkMode
                    ? "bg-dark-bg-tertiary/50 border-gray-700/50"
                    : "bg-[#F8F8F8]/50 border-gray-300/50"
                } p-6 rounded-xl border`}
              >
                <div
                  className={`${
                    darkMode ? "text-white" : "text-black"
                  } text-4xl font-bold mb-2`}
                >
                  28+
                </div>
                <div
                  className={`${darkMode ? "text-gray-300" : "text-gray-500"}`}
                >
                  <TranslatableText>States Covered</TranslatableText>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </section>
      </main>
      {/* Update Footer */}
      <Footer />
      <AnimatePresence>
        {selectedState && (
          <DetailModal
            state={selectedState}
            onClose={() => setSelectedState(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default About;
