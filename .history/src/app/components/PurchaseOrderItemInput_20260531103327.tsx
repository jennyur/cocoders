import { useEffect, useMemo, useState } from "react";
import { Check, Plus } from "lucide-react";
import { defaultCategoryHierarchy } from "../lib/inventoryLogic";

type SupplierProduct = {
  name: string;
  price: number;
};

export type PurchaseOrderProductOption = {
  id: string;
  name: string;
  category?: string;
  subCategory?: string;
  unit?: string;
};

export type PurchaseOrderItemInputValue = {
  productId?: string;
  productName: string;
  category: string;
  subCategory: string;
  unit: string;
  quantity: string;
  unitPrice: string;
  isNewProduct?: boolean;
  unitOverride?: boolean;
};

type PurchaseOrderItemInputProps = {
  supplierName: string;
  productDatabase: PurchaseOrderProductOption[];
  supplierProducts: SupplierProduct[];
  value: PurchaseOrderItemInputValue;
  onChange: (value: PurchaseOrderItemInputValue) => void;
  onAddItem: () => void;
  disabled?: boolean;
};

const UNIT_OPTIONS = ["kg", "g", "pcs", "liter", "bottle", "pack", "box", "dozen"];

const normalizeSearch = (value: string) => value.trim().toLowerCase();

export function PurchaseOrderItemInput({
  supplierName,
  productDatabase,
  supplierProducts,
  value,
  onChange,
  onAddItem,
  disabled = false,
}: PurchaseOrderItemInputProps) {
  const [query, setQuery] = useState(value.productName);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    setQuery(value.productName);
  }, [value.productName]);

  const normalizedQuery = normalizeSearch(query);

  const supplierProductNames = useMemo(
    () => new Set(supplierProducts.map((product) => product.name.toLowerCase())),
    [supplierProducts]
  );

  const matchingProducts = useMemo(() => {
    if (!normalizedQuery || !supplierName) return [];
    return productDatabase.filter(
      (product) =>
        supplierProductNames.has(product.name.toLowerCase()) &&
        product.name.toLowerCase().includes(normalizedQuery)
    );
  }, [normalizedQuery, productDatabase, supplierProductNames, supplierName]);

  const exactMatch = useMemo(
    () =>
      productDatabase.find(
        (product) =>
          product.name.toLowerCase() === normalizedQuery &&
          supplierProductNames.has(product.name.toLowerCase())
      ),
    [normalizedQuery, productDatabase, supplierProductNames]
  );

  const categoryOptions = Object.keys(defaultCategoryHierarchy);
  const subCategoryOptions = value.category ? defaultCategoryHierarchy[value.category] || [] : [];
  const canAddItem = Boolean(
    value.productName.trim() &&
      value.quantity.trim() &&
      value.unit.trim() &&
      value.unitPrice.trim() &&
      (!value.isNewProduct || value.category.trim())
  );

  const handleQueryChange = (next: string) => {
    const trimmed = next;
    setQuery(trimmed);
    setShowSuggestions(Boolean(trimmed) && !disabled && Boolean(supplierName));
    onChange({
      ...value,
      productId: undefined,
      productName: trimmed,
      category: "",
      subCategory: "",
      unit: "",
      isNewProduct: false,
    });
  };

  const handleSelectExistingProduct = (product: PurchaseOrderProductOption) => {
    const supplierPrice = supplierProducts.find((item) => item.name.toLowerCase() === product.name.toLowerCase())?.price;
    onChange({
      ...value,
      productId: product.id,
      productName: product.name,
      category: product.category || "",
      subCategory: product.subCategory || "",
      unit: product.unit || "",
      unitPrice: supplierPrice !== undefined ? supplierPrice.toString() : value.unitPrice,
      isNewProduct: false,
      unitOverride: false,
    });
    setQuery(product.name);
    setShowSuggestions(false);
  };

  const handleCreateNew = () => {
    const name = query.trim();
    if (!name) return;
    onChange({
      ...value,
      productId: undefined,
      productName: name,
      category: "",
      subCategory: "",
      unit: "",
      isNewProduct: true,
      unitOverride: false,
    });
    setShowSuggestions(false);
  };

  const handleFieldChange = (field: keyof PurchaseOrderItemInputValue, next: string) => {
    onChange({
      ...value,
      [field]: next,
    });
  };

  const handleUnitOverrideChange = (next: boolean) => {
    let nextUnit = value.unit;
    if (!next && value.productId) {
      const selectedProduct = productDatabase.find((product) => product.id === value.productId);
      nextUnit = selectedProduct?.unit || value.unit;
    }

    onChange({
      ...value,
      unitOverride: next,
      unit: nextUnit,
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="po-item-name" className="block text-xs mb-1 text-foreground">
          Item Name
        </label>
        <div className="relative">
          <input
            id="po-item-name"
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder={!supplierName ? "Please select a supplier first" : "Search or type item name..."}
            disabled={!supplierName || disabled}
            className="w-full px-3 py-2 text-sm bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          />
          {showSuggestions && (matchingProducts.length > 0 || (!exactMatch && query.trim())) && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 max-h-56 overflow-y-auto">
              {matchingProducts.length > 0 && (
                <div className="divide-y divide-border">
                  {matchingProducts.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => handleSelectExistingProduct(product)}
                      className="w-full px-3 py-2 text-left hover:bg-muted/50 text-sm text-foreground flex items-center justify-between"
                    >
                      <span>{product.name}</span>
                      <Check className="w-4 h-4 text-green-600" />
                    </button>
                  ))}
                </div>
              )}

              {!exactMatch && query.trim() && (
                <button
                  type="button"
                  onClick={handleCreateNew}
                  className="w-full px-3 py-2 text-left hover:bg-muted/50 text-sm text-primary flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create new item: <span className="font-semibold">{query.trim()}</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label htmlFor="po-item-category" className="block text-xs mb-1 text-foreground">
            Category {value.isNewProduct ? "*" : ""}
          </label>
          <select
            id="po-item-category"
            value={value.category}
            onChange={(e) => handleFieldChange("category", e.target.value)}
            disabled={!value.isNewProduct}
            className="w-full px-3 py-2 text-sm bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all appearance-none cursor-pointer"
          >
            <option value="">Select category</option>
            {categoryOptions.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="po-item-subcategory" className="block text-xs mb-1 text-foreground">
            Subcategory
          </label>
          <select
            id="po-item-subcategory"
            value={value.subCategory}
            onChange={(e) => handleFieldChange("subCategory", e.target.value)}
            disabled={!value.isNewProduct || !value.category}
            className="w-full px-3 py-2 text-sm bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all appearance-none cursor-pointer"
          >
            <option value="">Select subcategory</option>
            {subCategoryOptions.map((subCategory) => (
              <option key={subCategory} value={subCategory}>
                {subCategory}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="po-item-unit" className="block text-xs mb-1 text-foreground">
            Unit {value.isNewProduct ? "*" : ""}
          </label>
          <select
            id="po-item-unit"
            value={value.unit}
            onChange={(e) => handleFieldChange("unit", e.target.value)}
            disabled={!value.isNewProduct && !value.unitOverride}
            className="w-full px-3 py-2 text-sm bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">Select unit</option>
            {UNIT_OPTIONS.map((unit) => (
              <option key={unit} value={unit}>
                {unit}
              </option>
            ))}
          </select>
          {value.productId && !value.isNewProduct && (
            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
              <input
                id="unit-override"
                type="checkbox"
                checked={Boolean(value.unitOverride)}
                onChange={(e) => handleUnitOverrideChange(e.target.checked)}
                className="h-4 w-4 rounded border-muted-foreground text-primary focus:ring-primary"
              />
              <label htmlFor="unit-override" className="cursor-pointer">
                Override unit
              </label>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label htmlFor="po-item-quantity" className="block text-xs mb-1 text-foreground">
            Quantity *
          </label>
          <input
            id="po-item-quantity"
            type="number"
            min="0"
            value={value.quantity}
            onChange={(e) => handleFieldChange("quantity", e.target.value)}
            placeholder="0"
            className="w-full px-3 py-2 text-sm bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
          />
        </div>

        <div>
          <label htmlFor="po-item-price" className="block text-xs mb-1 text-foreground">
            Unit Price (₱) *
          </label>
          <input
            id="po-item-price"
            type="number"
            step="0.01"
            min="0"
            value={value.unitPrice}
            onChange={(e) => handleFieldChange("unitPrice", e.target.value)}
            placeholder="0.00"
            className="w-full px-3 py-2 text-sm bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={onAddItem}
        disabled={!canAddItem || disabled || !supplierName}
        className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Add Item
      </button>
    </div>
  );
}
