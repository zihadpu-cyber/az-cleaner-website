/* =====================================================================
   SITE CONFIG - the only file you need to edit for content and prices.
   ===================================================================== */
const SITE_CONFIG = {
  brand: {
    name: "A To Z Cleaner",            // TODO: your business name
    tagline: "Your Space,Our Care",
    city: "Dhaka, Bangladesh"
  },

  contact: {
    phoneDisplay: "+8801625694567",   // TODO: shown on the page
    email: "zihad.pu@gmail.com",// TODO
     hours: "Daily,11am-11pm",
    address: "Gulshan-2,Dhaka-1212"
    
  },

  whatsapp: {
    number: "8801625694567",            // TODO: digits only, country code first, no + or spaces
    configured: true                   // set to true once the number above is yours
  },

  // Optional free email delivery of the booking form (see README, Web3Forms).
  // Leave accessKey empty and the email button stays disabled - nothing is faked.
  emailForm: {
    endpoint: "https://api.web3forms.com/submit",
    accessKey: ""                       // TODO: paste your public Web3Forms access key
  },

  currency: "৳",                        // BDT symbol
payment: {
  methods: ["cash", "bkash", "nagad"],
  bkashNumber: "01625694567",
  nagadNumber: "01625694567"
},

  /* -------------------------------------------------------------------
     SERVICES - add, edit or delete entries freely.
     mode "sqft": estimate = max(rate * square feet, minCharge)
     mode "flat": estimate = flatPrice (fixed price)
     Leave a price as null until you decide it: the site shows
     "Rate to be confirmed" and the calculator will not invent a number.
     ------------------------------------------------------------------- */
  services: [
    { id: "home-premium", name: "Premium Residential Cleaning", icon: "💎",
      desc: "Premium residential cleaning with detailed attention to accessible areas, fixtures and surfaces.", 
      mode: "sqft", rate: 13, minCharge: 0 },
    { id: "home-standard", name: "Standard Residential Cleaning", icon: "🏠",
      desc: "Standard residential cleaning including dusting, floors and general tidying.",
      mode: "sqft", rate: 6, minCharge: 0 },
{
  id: "pest-control",
  name: "Pest Control",
  icon: "🐜",
  desc: "Professional pest control service for homes and workplaces in Dhaka.",
  mode: "sqft",
  rate: 4,
  minCharge: null
},
{
  id: "termite-control",
  name: "Termite Control",
  icon: "🪵",
  desc: "Pre & post-construction termite treatment that protects your wood, walls, and foundations for years.",
  mode: "sqft",
  rate: 13,
  minCharge: null
},
    { id: "move", name: "Move-in / move-out cleaning", icon: "📦",
      desc: "Get an empty or newly handed-over property ready for the next occupant.",
      mode: "sqft", rate: null, minCharge: null },
    { id: "kitchen-bath", name: "Kitchen & bathroom cleaning", icon: "🚿",
      desc: "Grease, limescale and stain removal. Priced per job, not by area.",
      mode: "flat", flatPrice: null },
    { id: "sofa-carpet", name: "Sofa, carpet & mattress", icon: "🛋️",
      desc: "Shampoo and extraction cleaning for fabrics and soft furnishings.
         
   Price:1300 tk",
       mode: "sqft",rate: null, minCharge:  },null
    { id: "office", name: "Office & commercial", icon: "🏢",
      desc: "Daily or weekly cleaning for offices, shops, clinics and restaurants.",
      mode: "sqft", rate: null, minCharge: null },
    { id: "post-construction", name: "Post-construction cleaning", icon: "🧱",
      desc: "Dust, cement and paint residue removed after renovation or building work.",
      mode: "sqft", rate: null, minCharge: null },
    { id: "glass", name: "Window & glass cleaning", icon: "🪟",
      desc: "Interior and exterior glass, frames and balcony railings.",
      mode: "flat", flatPrice: null }
  ],

  trust: [
    "Background-checked cleaners",
    "Supplies and equipment included and Free booking",
    "Confirmation before every visit"
  ]
};

if (typeof module !== "undefined") module.exports = SITE_CONFIG;
