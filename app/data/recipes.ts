export type IngredientLine = {
  name: string;
  amount: string;
  cost: number;
};

export type Recipe = {
  name: string;
  slug: string;
  category: string;
  price: number;
  status: "พร้อมใช้" | "กำลังปรับ" | "ยังไม่ครบ";
  ingredients: IngredientLine[];
  steps: string[];
};

export const recipes: Recipe[] = [
  {
    name: "กะเพราหมู",
    slug: "krapao-moo",
    category: "เมนูขายดี",
    price: 69,
    status: "พร้อมใช้",
    ingredients: [
      { name: "หมูสับ", amount: "80 กรัม", cost: 18 },
      { name: "ใบกะเพรา", amount: "1 กำมือ", cost: 3 },
      { name: "พริกกระเทียม", amount: "1 ช้อนโต๊ะ", cost: 4 },
      { name: "ซอสผัด", amount: "1.5 ช้อนโต๊ะ", cost: 3 },
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
    name: "ข้าวผัดหมู",
    slug: "fried-rice-pork",
    category: "ข้าวผัด",
    price: 69,
    status: "กำลังปรับ",
    ingredients: [
      { name: "ข้าวสวย", amount: "150 กรัม", cost: 8 },
      { name: "หมู", amount: "8 ชิ้น", cost: 18 },
      { name: "ไข่ไก่", amount: "1 ฟอง", cost: 5 },
      { name: "ซอสผัด", amount: "1.5 ช้อนโต๊ะ", cost: 3 },
      { name: "ผักรวม", amount: "1 ชุด", cost: 4 },
    ],
    steps: [
      "เตรียมข้าวสวยและวัตถุดิบให้พร้อม",
      "ตั้งกระทะ ใส่กระเทียมผัดให้หอม",
      "ใส่หมูและไข่ ผัดให้สุก",
      "ใส่ข้าวและซอสผัด",
      "ผัดให้แห้ง หอม แล้วจัดเสิร์ฟ",
    ],
  },
  {
    name: "สุกี้น้ำทะเล",
    slug: "suki-seafood",
    category: "เส้น / สุกี้",
    price: 89,
    status: "ยังไม่ครบ",
    ingredients: [
      { name: "วุ้นเส้น", amount: "1 ห่อเล็ก", cost: 8 },
      { name: "กุ้ง", amount: "3 ตัว", cost: 20 },
      { name: "หมึก", amount: "4 ชิ้น", cost: 14 },
      { name: "ผักสุกี้", amount: "1 ชุด", cost: 8 },
      { name: "น้ำจิ้มสุกี้", amount: "2 ช้อนโต๊ะ", cost: 5 },
    ],
    steps: [
      "ตั้งน้ำซุปให้เดือด",
      "ใส่ผักและวุ้นเส้น",
      "ใส่อาหารทะเล",
      "ปรุงน้ำจิ้มสุกี้",
      "ต้มจนสุกแล้วเสิร์ฟร้อน",
    ],
  },
];

export function getRecipeCost(recipe: Recipe) {
  return recipe.ingredients.reduce((sum, item) => sum + item.cost, 0);
}

export function getFoodCostPercent(recipe: Recipe) {
  return Math.round((getRecipeCost(recipe) / recipe.price) * 100);
}

export function getRecipeBySlug(slug: string) {
  return recipes.find((recipe) => recipe.slug === slug);
}