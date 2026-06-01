# Purchase Order Product Selection Enhancement

## Overview

This document describes the enhanced product selection system for Purchase Orders that allows users to flexibly select existing products or create new ones on-the-fly.

## Key Features Implemented

### 1. **Global Product Database** ✅

- Products are now stored in a centralized `globalProducts` table
- Products are accessible across all suppliers
- Each product has:
  - `id`: Unique identifier (e.g., `gp-001`)
  - `name`: Normalized product name (auto-capitalized)
  - `category`: Product category (e.g., Seafood, Meat, Vegetables)

### 2. **Smart Product Search & Suggestions** ✅

- Changed from rigid dropdown to **searchable text input**
- As user types, system shows matching products:
  - Case-insensitive search
  - Real-time suggestions filtered from global products
  - Quick-select via suggestion dropdown

### 3. **Automatic Product Creation** ✅

When user types a product name that doesn't exist:

- System offers "Create [Product Name]" option
- Clicking it opens create product modal
- New product automatically:
  - **Capitalizes** first letter of each word (e.g., "fresh tomatoes" → "Fresh Tomatoes")
  - Gets added to global products database
  - Gets linked to the selected supplier
  - Gets default price of ₱0 (user can adjust)

### 4. **Duplicate Prevention (Case-Insensitive)** ✅

- `normalizeProductName()` helper ensures consistency
- Before creating: checks if product exists (case-insensitive)
- Examples prevented:
  - "fresh salmon fillet" = "Fresh Salmon Fillet" ✅ Same product
  - "CHICKEN BREAST" = "Chicken Breast" ✅ Same product
  - "carrots" = "Carrots" ✅ Same product

### 5. **Flexible System (No Blocking)** ✅

- Users are **NOT blocked** if supplier has no pre-linked products
- Can create new products even for new suppliers
- Products created for one supplier available system-wide
- Encourages flexible ordering workflow

## Code Structure

### Helper Functions

```typescript
// Normalize product names: trim, capitalize each word
const normalizeProductName = (name: string): string => {
  return name
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

// Find product by name (case-insensitive)
const findProductByName = (
  name: string,
  allProducts: GlobalProduct[],
): GlobalProduct | undefined => {
  const normalized = normalizeProductName(name);
  return allProducts.find((p) => normalizeProductName(p.name) === normalized);
};
```

### New State Variables

```typescript
// Product suggestions for dropdown
const [productSuggestions, setProductSuggestions] = useState<GlobalProduct[]>(
  [],
);

// Show/hide suggestions dropdown
const [showProductSuggestions, setShowProductSuggestions] = useState(false);

// Show/hide create product modal
const [showCreateProductModal, setShowCreateProductModal] = useState(false);

// Stores the input text while searching
const [newProductInput, setNewProductInput] = useState("");

// Global products database
const [globalProducts, setGlobalProducts] = useLocalStorageState<
  GlobalProduct[]
>("purchaseOrders.globalProducts", [
  /* default products */
]);
```

### Key Handler Functions

#### 1. `handleProductNameChange(value: string)`

- Called when user types in product search field
- Filters global products for suggestions
- Shows/hides suggestion dropdown

#### 2. `handleSelectProduct(product: GlobalProduct)`

- Called when user selects a product from suggestions
- Looks up price from supplier's product list (if available)
- Auto-fills unit price field

#### 3. `handleCreateNewProduct()`

- Called when user confirms creating new product
- Checks for duplicates (case-insensitive)
- Normalizes product name automatically
- Adds to global products
- Links to current supplier
- Sets default price to ₱0

#### 4. `handlePriceInput(value: string)`

- Called when user manually enters price
- Allows price adjustment independent of stored supplier price

## User Workflow

### Scenario 1: Selecting Existing Product

1. User selects supplier
2. User starts typing product name (e.g., "fresh")
3. System shows matching products as suggestions
4. User clicks on desired product
5. System auto-fills product name and price
6. User enters quantity and confirms

### Scenario 2: Creating New Product

1. User selects supplier
2. User types product name not in system (e.g., "premium coffee beans")
3. System shows "Create 'Premium Coffee Beans'" option
4. User clicks to create
5. Modal opens with product details pre-filled
6. User confirms
7. Product created as "Premium Coffee Beans" (auto-capitalized)
8. Automatically linked to supplier
9. User can adjust price and quantity

### Scenario 3: Duplicate Prevention

1. "fresh salmon" already exists as "Fresh Salmon Fillet"
2. User types "FRESH SALMON FILLET"
3. System finds existing product (case-insensitive match)
4. Suggests the existing product
5. No duplicate created ✅

## Data Structure Changes

### Before (Limited to Supplier Products)

```typescript
type Supplier = {
  name: string;
  contact: string;
  email: string;
  phone: string;
  address: string;
  products: Product[]; // Only supplier-specific products
};

type Product = {
  name: string;
  price: number;
};
```

### After (Global + Supplier Specific)

```typescript
// Global products - accessible system-wide
type GlobalProduct = {
  id: string;
  name: string;
  category?: string;
};

// Supplier-specific product pricing
type SupplierProduct = {
  supplierId: string;
  productId: string;
  price: number;
};

// Supplier still tracks available products
type Supplier = {
  name: string;
  contact: string;
  email: string;
  phone: string;
  address: string;
  products: Product[]; // Products available from this supplier + their prices
};

type OrderItem = {
  productName: string; // Now automatically normalized
  quantity: number;
  unitPrice: number;
};
```

## UI/UX Improvements

### Product Selection Field

- **Before**: Dropdown showing only pre-linked products (often empty)
- **After**: Searchable text input with real-time suggestions

### Error State Handling

- **Before**: "No products available for this supplier" (blocks user)
- **After**: Suggest creating new product (enables user)

### Visual Feedback

- ✅ Check icon next to selected product in suggestions
- 💡 Helpful tip about auto-capitalization in create modal
- ℹ️ Note showing which supplier product will be created for

## Benefits

1. **User Flexibility**: Not blocked by limited pre-linked products
2. **Data Consistency**: Auto-capitalization ensures normalized names
3. **No Duplicates**: Case-insensitive matching prevents redundant products
4. **Scalability**: Global product database grows as users add products
5. **System Alignment**: Flexible workflow matches real-world ordering scenarios
6. **Auto-linking**: New products automatically connected to suppliers

## Testing Recommendations

1. ✅ Create PO with existing product from dropdown
2. ✅ Create PO with new product name not in system
3. ✅ Try creating duplicate product (should find existing)
4. ✅ Test case-insensitive matching (FRESH, fresh, Fresh Salmon)
5. ✅ Verify auto-capitalization works correctly
6. ✅ Check price adjustment is independent of defaults
7. ✅ Verify product persists after page refresh (localStorage)
8. ✅ Test with empty supplier products list

## Future Enhancements

- [ ] Add ability to edit product categories after creation
- [ ] Add product images/photos
- [ ] Add product SKU tracking
- [ ] Bulk import products from CSV
- [ ] Product search across suppliers
- [ ] Product price history tracking
- [ ] Reorder frequently used products

## Files Modified

- `src/app/components/PurchaseOrders.tsx` - Main implementation
  - Added helper functions for product normalization
  - Updated product selection UI from dropdown to searchable input
  - Added create product modal
  - Enhanced state management for product suggestions

## Notes for Development

- Product names are stored normalized in the database
- UI always displays normalized names to users
- Price can be adjusted per purchase order (not locked to supplier default)
- All data persists in localStorage (consider future backend integration)
- System is flexible by design - encourages user input and product creation
