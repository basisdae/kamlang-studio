export type Ingredient = {
  id: string;
  name: string;
  purchaseUnit: "kg" | "g" | "liter" | "ml" | "piece" | "pack" | "bunch";
  purchasePrice: number;
  supplier: string;
};

export const ingredients: Ingredient[] = [
  {
    id: "pork-mince",
    name: "หมูสับ",
    purchaseUnit: "kg",
    purchasePrice: 180,
    supplier: "ตลาด",
  },
  {
    id: "holy-basil",
    name: "ใบกะเพรา",
    purchaseUnit: "bunch",
    purchasePrice: 10,
    supplier: "ตลาด",
  },
  {
    id: "chili-garlic",
    name: "พริกกระเทียม",
    purchaseUnit: "kg",
    purchasePrice: 90,
    supplier: "ตลาด",
  },
  {
    id: "stir-fry-sauce",
    name: "ซอสผัด",
    purchaseUnit: "liter",
    purchasePrice: 65,
    supplier: "สูตรร้าน",
  },
  {
    id: "rice-cooked",
    name: "ข้าวสวย",
    purchaseUnit: "kg",
    purchasePrice: 45,
    supplier: "ร้านข้าวสาร",
  },
  {
    id: "egg",
    name: "ไข่ไก่",
    purchaseUnit: "piece",
    purchasePrice: 5,
    supplier: "ตลาด",
  },
];