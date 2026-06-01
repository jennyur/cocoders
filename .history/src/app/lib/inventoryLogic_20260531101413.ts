import { readLocalStorage } from "./localStorage";

export type InventoryProduct = {
  id: number;
  name: string;
  sku: string;
  category: string;
  stock: number;
  maxStock: number;
  price: number;
  expiry: string;
  location?: string;
  unit: string;
};

export const defaultCategoryHierarchy: { [key: string]: string[] } = {
  "Fruits": ["Citrus Fruits", "Berries", "Tropical Fruits", "Stone Fruits", "Melons"],
  "Vegetables": ["Leafy Greens", "Root Vegetables", "Cruciferous", "Nightshades", "Squash"],
  "Meat": ["Poultry", "Beef", "Pork", "Lamb", "Game Meat"],
  "Seafood": ["Fish", "Shellfish", "Crustaceans", "Mollusks", "Canned Seafood"],
  "Dairy": ["Milk Products", "Cheese", "Yogurt", "Butter & Cream", "Eggs"],
  "Bakery": ["Bread", "Pastries", "Cakes", "Cookies", "Muffins"],
  "Oils & Condiments": ["Cooking Oils", "Vinegars", "Sauces", "Spices", "Seasonings"],
  "Frozen Foods": ["Frozen Vegetables", "Frozen Fruits", "Frozen Meals", "Ice Cream", "Frozen Seafood"],
};

export const defaultInventoryProducts: InventoryProduct[] = [
  { id: 1, name: "Fresh Salmon Fillet", sku: "FSH-SAL-001", category: "Seafood > Fish", stock: 45, maxStock: 80, price: 24.99, expiry: "2024-05-28", location: "Cold Storage A", unit: "kg" },
  { id: 9, name: "Wild-Caught Tuna", sku: "FSH-TUN-009", category: "Seafood > Fish", stock: 28, maxStock: 60, price: 19.99, expiry: "2024-05-31", location: "Cold Storage A", unit: "kg" },
  { id: 20, name: "Jumbo Shrimp", sku: "SEA-SHR-020", category: "Seafood > Shellfish", stock: 35, maxStock: 70, price: 18.99, expiry: "2024-05-29", location: "Cold Storage A", unit: "kg" },
  { id: 21, name: "Lobster Tail", sku: "SEA-LOB-021", category: "Seafood > Shellfish", stock: 12, maxStock: 40, price: 34.99, expiry: "2024-05-27", location: "Cold Storage A", unit: "kg" },
  { id: 2, name: "Organic Chicken Breast", sku: "MET-CHK-002", category: "Meat > Poultry", stock: 32, maxStock: 80, price: 12.99, expiry: "2024-05-30", location: "Cold Storage B", unit: "kg" },
  { id: 11, name: "Chicken Wings", sku: "MET-CHK-011", category: "Meat > Poultry", stock: 28, maxStock: 60, price: 8.99, expiry: "2024-05-29", location: "Cold Storage B", unit: "pcs" },
  { id: 12, name: "Whole Chicken", sku: "MET-CHK-012", category: "Meat > Poultry", stock: 15, maxStock: 50, price: 15.99, expiry: "2024-05-28", location: "Cold Storage B", unit: "pcs" },
  { id: 10, name: "Grass-Fed Ground Beef", sku: "MET-BEF-010", category: "Meat > Beef", stock: 5, maxStock: 60, price: 9.99, expiry: "2024-05-29", location: "Cold Storage B", unit: "kg" },
  { id: 13, name: "Ribeye Steak", sku: "MET-BEF-013", category: "Meat > Beef", stock: 18, maxStock: 50, price: 24.99, expiry: "2024-05-30", location: "Cold Storage B", unit: "pcs" },
  { id: 14, name: "Sirloin Steak", sku: "MET-BEF-014", category: "Meat > Beef", stock: 22, maxStock: 60, price: 19.99, expiry: "2024-05-30", location: "Cold Storage B", unit: "pcs" },
  { id: 15, name: "Ground Pork", sku: "MET-PRK-015", category: "Meat > Pork", stock: 25, maxStock: 50, price: 8.99, expiry: "2024-05-29", location: "Cold Storage B", unit: "kg" },
  { id: 16, name: "Pork Chop", sku: "MET-PRK-016", category: "Meat > Pork", stock: 30, maxStock: 60, price: 11.99, expiry: "2024-05-30", location: "Cold Storage B", unit: "pcs" },
  { id: 17, name: "Pork Tenderloin", sku: "MET-PRK-017", category: "Meat > Pork", stock: 18, maxStock: 50, price: 14.99, expiry: "2024-05-29", location: "Cold Storage B", unit: "pcs" },
  { id: 18, name: "Bacon Strips", sku: "MET-PRK-018", category: "Meat > Pork", stock: 42, maxStock: 80, price: 7.99, expiry: "2024-06-05", location: "Refrigerator 1", unit: "pcs" },
  { id: 4, name: "Romaine Lettuce", sku: "VEG-ROM-004", category: "Vegetables > Leafy Greens", stock: 3, maxStock: 50, price: 3.49, expiry: "2024-05-27", location: "Produce Section", unit: "pcs" },
  { id: 22, name: "Spinach", sku: "VEG-SPN-022", category: "Vegetables > Leafy Greens", stock: 25, maxStock: 50, price: 2.99, expiry: "2024-05-28", location: "Produce Section", unit: "pcs" },
  { id: 23, name: "Carrots", sku: "VEG-CAR-023", category: "Vegetables > Root Vegetables", stock: 40, maxStock: 80, price: 2.49, expiry: "2024-06-05", location: "Produce Section", unit: "kg" },
  { id: 24, name: "Potatoes 5lb", sku: "VEG-POT-024", category: "Vegetables > Root Vegetables", stock: 35, maxStock: 70, price: 4.99, expiry: "2024-06-10", location: "Dry Storage", unit: "pcs" },
  { id: 7, name: "Strawberries 1lb", sku: "FRT-STR-007", category: "Fruits > Berries", stock: 24, maxStock: 60, price: 4.99, expiry: "2024-05-29", location: "Produce Section", unit: "pack" },
  { id: 25, name: "Blueberries 1lb", sku: "FRT-BLU-025", category: "Fruits > Berries", stock: 18, maxStock: 50, price: 6.99, expiry: "2024-05-30", location: "Produce Section", unit: "pack" },
  { id: 26, name: "Oranges", sku: "FRT-ORG-026", category: "Fruits > Citrus Fruits", stock: 50, maxStock: 100, price: 5.99, expiry: "2024-06-03", location: "Produce Section", unit: "pcs" },
  { id: 27, name: "Lemons", sku: "FRT-LEM-027", category: "Fruits > Citrus Fruits", stock: 32, maxStock: 70, price: 3.99, expiry: "2024-06-02", location: "Produce Section", unit: "pcs" },
  { id: 5, name: "Greek Yogurt 32oz", sku: "DRY-YOG-005", category: "Dairy > Yogurt", stock: 67, maxStock: 100, price: 6.99, expiry: "2024-06-15", location: "Refrigerator 1", unit: "pcs" },
  { id: 8, name: "Aged Cheddar Cheese", sku: "DRY-CHD-008", category: "Dairy > Cheese", stock: 15, maxStock: 50, price: 8.99, expiry: "2024-07-10", location: "Refrigerator 2", unit: "pcs" },
  { id: 28, name: "Whole Milk 1gal", sku: "DRY-MLK-028", category: "Dairy > Milk Products", stock: 28, maxStock: 60, price: 4.99, expiry: "2024-06-01", location: "Refrigerator 1", unit: "bottle" },
  { id: 29, name: "Mozzarella Cheese", sku: "DRY-MOZ-029", category: "Dairy > Cheese", stock: 22, maxStock: 50, price: 7.99, expiry: "2024-06-20", location: "Refrigerator 2", unit: "pcs" },
  { id: 6, name: "Sourdough Bread", sku: "BKY-SRD-006", category: "Bakery > Bread", stock: 0, maxStock: 40, price: 5.99, expiry: "2024-05-26", location: "Bakery Shelf", unit: "pcs" },
  { id: 30, name: "Baguette", sku: "BKY-BAG-030", category: "Bakery > Bread", stock: 12, maxStock: 40, price: 3.99, expiry: "2024-05-27", location: "Bakery Shelf", unit: "pcs" },
  { id: 31, name: "Croissants", sku: "BKY-CRO-031", category: "Bakery > Pastries", stock: 8, maxStock: 30, price: 6.99, expiry: "2024-05-27", location: "Bakery Shelf", unit: "pcs" },
  { id: 3, name: "Extra Virgin Olive Oil", sku: "OIL-EVO-003", category: "Oils & Condiments > Cooking Oils", stock: 8, maxStock: 40, price: 18.99, expiry: "2025-12-31", location: "Dry Storage", unit: "liter" },
  { id: 32, name: "Soy Sauce", sku: "OIL-SOY-032", category: "Oils & Condiments > Sauces", stock: 25, maxStock: 50, price: 4.99, expiry: "2025-08-15", location: "Dry Storage", unit: "bottle" },
];

export function getInventoryProducts() {
  return readLocalStorage<InventoryProduct[]>("inventory.products", defaultInventoryProducts);
}

export function splitCategory(category: string) {
  const [main = "Uncategorized", sub = "General"] = category.split(" > ");
  return { main, sub };
}

export function getStockStatus(stock: number, maxStock: number): "healthy" | "low" | "critical" | "overstock" {
  if (stock === 0) return "critical";
  const percentage = maxStock > 0 ? (stock / maxStock) * 100 : 0;
  if (percentage <= 15) return "critical";
  if (percentage <= 30) return "low";
  if (percentage >= 110) return "overstock";
  return "healthy";
}

export function getDaysUntilExpiry(expiry: string) {
  const expiryTime = new Date(`${expiry}T00:00:00`).getTime();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((expiryTime - today.getTime()) / 86400000);
}

export function isExpiringSoon(product: InventoryProduct) {
  return getDaysUntilExpiry(product.expiry) <= 7;
}

export function formatCurrency(value: number) {
  return `₱${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

export function getInventoryValue(products: InventoryProduct[]) {
  return products.reduce((sum, product) => sum + product.stock * product.price, 0);
}

export function getCategoryQuantityData(products: InventoryProduct[]) {
  const grouped = new Map<string, number>();

  products.forEach((product) => {
    const { main } = splitCategory(product.category);
    grouped.set(main, (grouped.get(main) || 0) + product.stock);
  });

  return Array.from(grouped.entries()).map(([category, value]) => ({
    id: category.toLowerCase().replace(/\s+/g, "-"),
    category,
    value,
  }));
}
