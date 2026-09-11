export const stores = [
  {
    id: "s1",
    slug: "urban-style",
    name: "Urban Style",
    description: "La mejor ropa urbana y zapatillas de edición limitada.",
    whatsappNumber: "5491112345678", // Example number
    bannerUrl: "https://images.unsplash.com/photo-1555529771-835f59bfc50c?auto=format&fit=crop&q=80&w=1200",
    logoUrl: "https://ui-avatars.com/api/?name=US&background=6366f1&color=fff&size=128",
    themeColor: "#6366f1"
  },
  {
    id: "s2",
    slug: "tech-gadgets",
    name: "Tech Gadgets PRO",
    description: "Accesorios, fundas y tecnología de punta.",
    whatsappNumber: "5491198765432",
    bannerUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=1200",
    logoUrl: "https://ui-avatars.com/api/?name=TG&background=10b981&color=fff&size=128",
    themeColor: "#10b981"
  }
];

export const categories = [
  { id: "c1", storeId: "s1", name: "Zapatillas" },
  { id: "c2", storeId: "s1", name: "Remeras" },
  { id: "c3", storeId: "s1", name: "Pantalones" },
  { id: "c4", storeId: "s2", name: "Fundas" },
  { id: "c5", storeId: "s2", name: "Cargadores" }
];

export const products = [
  {
    id: "p1",
    storeId: "s1",
    categoryId: "c1",
    name: "Sneakers Air Max V2",
    price: 120.00,
    description: "Zapatillas urbanas súper cómodas para el día a día. Materiales de alta calidad.",
    imageUrl: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&q=80&w=600",
    variants: [
      {
        name: "Talle",
        options: ["39", "40", "41", "42", "43"]
      },
      {
        name: "Color",
        options: ["Negro", "Blanco", "Gris"]
      }
    ]
  },
  {
    id: "p2",
    storeId: "s1",
    categoryId: "c2",
    name: "Remera Oversize Básica",
    price: 35.50,
    description: "Remera 100% algodón peinado, corte oversize.",
    imageUrl: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=600",
    variants: [
      {
        name: "Talle",
        options: ["S", "M", "L", "XL"]
      }
    ]
  },
  {
    id: "p3",
    storeId: "s2",
    categoryId: "c4",
    name: "Funda de Silicona MagSafe",
    price: 25.00,
    description: "Funda resistente con imanes integrados para carga rápida.",
    imageUrl: "https://images.unsplash.com/photo-1601593346740-925612772716?auto=format&fit=crop&q=80&w=600",
    variants: [
      {
        name: "Modelo",
        options: ["iPhone 13", "iPhone 14", "iPhone 15 Pro"]
      },
      {
        name: "Color",
        options: ["Azul Noche", "Rosa Arena", "Negro"]
      }
    ]
  }
];
