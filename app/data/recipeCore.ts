export type RecipeIngredientLine = {
  ingredientId: string;
  quantity: number;
  unit: "g" | "kg" | "ml" | "liter" | "piece" | "bunch";
};

export type CoreRecipe = {
  id: string;
  slug: string;
  name: string;
  category: string;
  sellingPrice: number;
  status: "พร้อมใช้" | "กำลังปรับ" | "ยังไม่ครบ";
  ingredients: RecipeIngredientLine[];
  steps: string[];
};

export const coreRecipes: CoreRecipe[] = [
  {
    id: "recipe-krapao-moo",
    slug: "krapao-moo",
    name: "กะเพราหมู",
    category: "เมนูขายดี",
    sellingPrice: 69,
    status: "พร้อมใช้",
    ingredients: [
      { ingredientId: "pork-mince", quantity: 80, unit: "g" },
      { ingredientId: "holy-basil", quantity: 1, unit: "bunch" },
      { ingredientId: "chili-garlic", quantity: 40, unit: "g" },
      { ingredientId: "stir-fry-sauce", quantity: 45, unit: "ml" },
    ],
    steps: [
      "ตั้งกระทะไฟแรง ใส่น้ำมันเล็กน้อย",
      "ผัดพริกกระเทียมให้หอม",
      "ใส่หมูสับ ผัดจนสุก",
      "ใส่ซอสผัดและใบกะเพรา",
      "ผัดให้เข้ากันแล้วเสิร์ฟทันที",
    ],
  },
  {
    id: "recipe-fried-rice-pork",
    slug: "fried-rice-pork",
    name: "ข้าวผัดหมู",
    category: "ข้าวผัด",
    sellingPrice: 69,
    status: "กำลังปรับ",
    ingredients: [
      { ingredientId: "rice-cooked", quantity: 150, unit: "g" },
      { ingredientId: "pork-mince", quantity: 80, unit: "g" },
      { ingredientId: "egg", quantity: 1, unit: "piece" },
      { ingredientId: "stir-fry-sauce", quantity: 45, unit: "ml" },
    ],
    steps: [
      "เตรียมข้าวสวยและวัตถุดิบให้พร้อม",
      "ตั้งกระทะ ใส่กระเทียมผัดให้หอม",
      "ใส่หมูและไข่ ผัดให้สุก",
      "ใส่ข้าวและซอสผัด",
      "ผัดให้แห้ง หอม แล้วจัดเสิร์ฟ",
    ],
  },
];