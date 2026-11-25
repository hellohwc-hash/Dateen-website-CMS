// Default content — used when the KV store is empty (first run) and as the
// seed the admin edits. Everything here is editable in /admin.
export const DEFAULT_CONTENT = {
  phone: "012-201 5578",
  phoneIntl: "+60 12-201 5578",
  whatsapp: "60122015578",
  email: "dateen.catering@palaterium.com",
  address: "18, Jalan Perdana 6/8b, Pandan Perdana, 55300 Kuala Lumpur",
  menuPdf: "/Dateen-Corporate-Menu-2026.pdf",

  banners: {
    catering: "/photos/catering-banner.jpg",
    bento: "/photos/bento-banner.jpg",
    bungkus: "/photos/bungkus-banner.jpg",
    vegetarian: "/photos/veg-fried-rice.jpg",
    coldbrew: "/photos/cold-brew.png",
  },

  prices: {
    bentoFrom: "17.90",
    valueMeal: "10.50",
    vegBento: "17.90",
    coldbrewAmericano: "11.00",
    coldbrewLatte: "13.00",
    bungkusReseller: "3.90",
    cateringFullDayA: "63",
    cateringFullDayB: "75",
    cateringFullDayC: "86",
    cateringLunchLocal: "30",
    cateringLunchWestern: "40",
    cateringTeaLocal: "28",
    cateringTeaWestern: "31",
  },

  clientsTrusted: [
    "SC Johnson", "American Express", "Unilever", "Samsung", "PwC",
    "Sony PlayStation", "Dutch Lady",
  ],
  clientsWall: [
    "SC Johnson", "American Express", "Unilever", "Samsung", "Dutch Lady",
    "Sony PlayStation", "PwC", "Kenanga Investment", "Sunway Medical",
    "Linde Malaysia", "CMA CGM Ficom", "Iverson Associates", "Info Trek",
    "8VIC Jooymedia", "Wspace", "Hyatt House Mont Kiara", "INTI University",
    "MRCA", "TKCA Architect", "Corporate Information Travel",
  ],

  gallery: [
    { image: "/photos/catering-friedrice.jpg", caption: "Signature Rendang", tag: "Buffet" },
    { image: "/photos/catering-canapes.jpg", caption: "Canapé Spread", tag: "Tea Break" },
    { image: "/photos/catering-fruit.jpg", caption: "Fresh Fruit Platter", tag: "Catering" },
    { image: "/photos/catering-skyline.jpg", caption: "Buffet with a KL View", tag: "Corporate Event" },
    { image: "/photos/catering-rendang-buffet.jpg", caption: "Chafing-Dish Service", tag: "Buffet" },
    { image: "/photos/catering-tower.jpg", caption: "Festive Catering", tag: "Event" },
    { image: "/photos/catering-currypuff.jpg", caption: "Local Favourites", tag: "Canapés" },
    { image: "/photos/catering-lights.jpg", caption: "Evening Functions", tag: "Catering" },
  ],
};

// Fields the page templates reference as @@token@@ (scalars only; lists handled separately)
export function tokenMap(c) {
  return {
    "@@phone@@": c.phone,
    "@@phoneIntl@@": c.phoneIntl,
    "@@whatsapp@@": c.whatsapp,
    "@@email@@": c.email,
    "@@address@@": c.address,
    "@@menu_pdf@@": c.menuPdf,
    "@@banner_catering@@": c.banners.catering,
    "@@banner_bento@@": c.banners.bento,
    "@@banner_bungkus@@": c.banners.bungkus,
    "@@banner_vegetarian@@": c.banners.vegetarian,
    "@@banner_coldbrew@@": c.banners.coldbrew,
    "@@price_bentoFrom@@": c.prices.bentoFrom,
    "@@price_valueMeal@@": c.prices.valueMeal,
    "@@price_vegBento@@": c.prices.vegBento,
    "@@price_coldbrewAmericano@@": c.prices.coldbrewAmericano,
    "@@price_coldbrewLatte@@": c.prices.coldbrewLatte,
    "@@price_bungkusReseller@@": c.prices.bungkusReseller,
    "@@price_cateringFullDayA@@": c.prices.cateringFullDayA,
    "@@price_cateringFullDayB@@": c.prices.cateringFullDayB,
    "@@price_cateringFullDayC@@": c.prices.cateringFullDayC,
    "@@price_cateringLunchLocal@@": c.prices.cateringLunchLocal,
    "@@price_cateringLunchWestern@@": c.prices.cateringLunchWestern,
    "@@price_cateringTeaLocal@@": c.prices.cateringTeaLocal,
    "@@price_cateringTeaWestern@@": c.prices.cateringTeaWestern,
  };
}
