export interface InteriorStyle {
  id: string;
  name: string;
  icon: string;
  prompt: string;
  stagingStyle: string;
}

export const INTERIOR_STYLES: InteriorStyle[] = [
  {
    id: "modern",
    name: "Nowoczesny",
    icon: "🏢",
    prompt: "modern interior design, sleek furniture, clean lines, neutral colors with accent pieces, contemporary lighting, minimalist decor, high-end finishes",
    stagingStyle: "Modern",
  },
  {
    id: "scandinavian",
    name: "Skandynawski",
    icon: "🌿",
    prompt: "scandinavian interior design, light wood furniture, white and beige tones, cozy textiles, hygge atmosphere, natural materials, simple elegant forms",
    stagingStyle: "Scandinavian",
  },
  {
    id: "classic",
    name: "Klasyczny",
    icon: "🏛️",
    prompt: "classic traditional interior design, elegant furniture, rich fabrics, warm wood tones, ornamental details, sophisticated lighting, timeless decor",
    stagingStyle: "Traditional",
  },
  {
    id: "industrial",
    name: "Industrialny",
    icon: "🏭",
    prompt: "industrial interior design, exposed brick, metal accents, raw wood, Edison bulbs, leather furniture, loft-style decor, urban atmosphere",
    stagingStyle: "Urban Industrial",
  },
  {
    id: "minimalist",
    name: "Minimalistyczny",
    icon: "⬜",
    prompt: "minimalist interior design, essential furniture only, monochromatic palette, clean surfaces, plenty of open space, zen-like atmosphere, less is more",
    stagingStyle: "Modern Organic",
  },
  {
    id: "boho",
    name: "Boho",
    icon: "🌺",
    prompt: "bohemian interior design, eclectic mix of patterns and textures, warm earthy colors, plants, macrame, vintage furniture, layered textiles, cozy and artistic",
    stagingStyle: "Farmhouse",
  },
];

export type RoomType = {
  id: string;
  name: string;
  icon: string;
  promptHint: string;
  stagingRoom: string;
};

export const ROOM_TYPES: RoomType[] = [
  {
    id: "living-room",
    name: "Salon",
    icon: "🛋️",
    promptHint: "living room furnished with: one large sofa, one coffee table, one TV stand with TV, one area rug, curtains on windows",
    stagingRoom: "Living Room",
  },
  {
    id: "living-kitchen",
    name: "Salon z aneksem",
    icon: "🛋️🍳",
    promptHint: "open-plan living room with kitchen area furnished with: one sofa, one coffee table, one kitchen island with two bar stools, one small dining table with chairs",
    stagingRoom: "Living Room",
  },
  {
    id: "bedroom",
    name: "Sypialnia",
    icon: "🛏️",
    promptHint: "bedroom furnished with: one double bed with headboard and bedding, two nightstands with lamps, one wardrobe or dresser",
    stagingRoom: "Bedroom",
  },
  {
    id: "kitchen",
    name: "Kuchnia",
    icon: "🍳",
    promptHint: "kitchen furnished with: one dining table, four chairs, organized countertops with small appliances",
    stagingRoom: "Kitchen",
  },
  {
    id: "bathroom",
    name: "Łazienka",
    icon: "🚿",
    promptHint: "bathroom with: towels on rack, bath mat on floor, soap dispenser, one small plant, organized vanity with mirror",
    stagingRoom: "Bathroom",
  },
  {
    id: "office",
    name: "Biuro",
    icon: "💼",
    promptHint: "home office furnished with: one large desk, one ergonomic office chair, one bookshelf with books, one desk lamp, monitor on desk",
    stagingRoom: "Office",
  },
  {
    id: "dining",
    name: "Jadalnia",
    icon: "🍽️",
    promptHint: "dining room furnished with: one large dining table, six dining chairs, one pendant light above table, one sideboard cabinet",
    stagingRoom: "Dining Room",
  },
  {
    id: "hallway",
    name: "Korytarz",
    icon: "🚪",
    promptHint: "hallway furnished with: one narrow console table, one wall mirror, coat hooks on wall, one shoe cabinet, one pendant light",
    stagingRoom: "Hallway",
  },
];
