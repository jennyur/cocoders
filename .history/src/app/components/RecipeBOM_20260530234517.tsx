import { useState } from "react";
import { ChefHat, Plus, Search, Edit, Trash2, X, Save, Calculator, Scale, TrendingUp, Tag } from "lucide-react";
import { useLocalStorageState } from "../lib/localStorage";
import { getInventoryProducts, InventoryProduct } from "../lib/inventoryLogic";

type Ingredient = {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  unitCost: number;
  totalCost: number;
};

type Recipe = {
  id: string;
  name: string;
  category: string;
  servings: number;
  yieldPercentage: number;
  prepTime: number;
  ingredients: Ingredient[];
  totalCost: number;
  costPerServing: number;
  instructions: string;
};

// Use the actual inventory product structure from inventory logic
// The `inventoryItems` list is loaded from localStorage or defaults when needed.
type InventoryItem = InventoryProduct;

export function RecipeBOM() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [scaleMultiplier, setScaleMultiplier] = useState(1);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const [newRecipe, setNewRecipe] = useState({
    name: "",
    category: "",
    servings: "",
    yieldPercentage: "100",
    prepTime: "",
    instructions: "",
  });

  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [currentIngredient, setCurrentIngredient] = useState({
    name: "",
    quantity: "",
    unit: "kg",
    unitCost: "",
  });

  const inventoryItems: InventoryItem[] = getInventoryProducts();

  // Only show products that are actually in stock.
  const availableInventoryItems = inventoryItems.filter(item => item.stock > 0);

  // Extract unique categories from inventory
  const availableCategories = Array.from(new Set(inventoryItems.map(item => item.category))).sort();

  const [recipes, setRecipes] = useLocalStorageState<Recipe[]>("recipes.records", [
    {
      id: "RCP-001",
      name: "Grilled Salmon Platter",
      category: "Main Course",
      servings: 4,
      yieldPercentage: 85,
      prepTime: 30,
      ingredients: [
        { id: "ING-001", name: "Fresh Salmon Fillet", quantity: 800, unit: "g", unitCost: 24.99, totalCost: 19.99 },
        { id: "ING-002", name: "Olive Oil", quantity: 50, unit: "ml", unitCost: 0.38, totalCost: 1.90 },
        { id: "ING-003", name: "Lemon", quantity: 2, unit: "pcs", unitCost: 0.50, totalCost: 1.00 },
        { id: "ING-004", name: "Fresh Herbs", quantity: 30, unit: "g", unitCost: 0.20, totalCost: 0.60 },
      ],
      totalCost: 23.49,
      costPerServing: 5.87,
      instructions: "1. Preheat grill to medium-high heat\n2. Season salmon with olive oil and herbs\n3. Grill for 4-5 minutes per side\n4. Serve with lemon wedges",
    },
    {
      id: "RCP-002",
      name: "Caesar Salad",
      category: "Appetizer",
      servings: 6,
      yieldPercentage: 95,
      prepTime: 15,
      ingredients: [
        { id: "ING-005", name: "Romaine Lettuce", quantity: 500, unit: "g", unitCost: 3.49, totalCost: 1.75 },
        { id: "ING-006", name: "Parmesan Cheese", quantity: 100, unit: "g", unitCost: 12.99, totalCost: 1.30 },
        { id: "ING-007", name: "Caesar Dressing", quantity: 150, unit: "ml", unitCost: 0.08, totalCost: 1.20 },
        { id: "ING-008", name: "Croutons", quantity: 100, unit: "g", unitCost: 0.05, totalCost: 0.50 },
      ],
      totalCost: 4.75,
      costPerServing: 0.79,
      instructions: "1. Wash and chop romaine lettuce\n2. Toss with Caesar dressing\n3. Add croutons and shaved parmesan\n4. Serve immediately",
    },
    {
      id: "RCP-003",
      name: "Chocolate Brownie",
      category: "Dessert",
      servings: 12,
      yieldPercentage: 90,
      prepTime: 45,
      ingredients: [
        { id: "ING-009", name: "Dark Chocolate", quantity: 300, unit: "g", unitCost: 15.99, totalCost: 4.80 },
        { id: "ING-010", name: "Butter", quantity: 200, unit: "g", unitCost: 5.49, totalCost: 1.10 },
        { id: "ING-011", name: "Sugar", quantity: 250, unit: "g", unitCost: 0.003, totalCost: 0.75 },
        { id: "ING-012", name: "Eggs", quantity: 4, unit: "pcs", unitCost: 0.50, totalCost: 2.00 },
        { id: "ING-013", name: "Flour", quantity: 100, unit: "g", unitCost: 0.002, totalCost: 0.20 },
      ],
      totalCost: 8.85,
      costPerServing: 0.74,
      instructions: "1. Melt chocolate and butter\n2. Mix in sugar and eggs\n3. Fold in flour\n4. Bake at 350°F for 25-30 minutes",
    },
  ]);

  const categories = ["all", "Appetizer", "Main Course", "Dessert", "Beverage"];

  // Filter inventory items based on selected categories
  const filteredInventoryItems = selectedCategories.length === 0
    ? availableInventoryItems
    : availableInventoryItems.filter(item => selectedCategories.includes(item.category));

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         recipe.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || recipe.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleAddIngredient = () => {
    if (currentIngredient.name && currentIngredient.quantity && currentIngredient.unitCost) {
      const quantity = parseFloat(currentIngredient.quantity);
      const unitCost = parseFloat(currentIngredient.unitCost);
      const totalCost = quantity * unitCost;

      const newIngredient: Ingredient = {
        id: `ING-${Date.now()}`,
        name: currentIngredient.name,
        quantity: quantity,
        unit: currentIngredient.unit,
        unitCost: unitCost,
        totalCost: totalCost,
      };

      setIngredients([...ingredients, newIngredient]);
      setCurrentIngredient({
        name: "",
        quantity: "",
        unit: "kg",
        unitCost: "",
      });
    }
  };

  const handleRemoveIngredient = (id: string) => {
    setIngredients(ingredients.filter(ing => ing.id !== id));
  };

  const calculateTotalCost = () => {
    return ingredients.reduce((sum, ing) => sum + ing.totalCost, 0);
  };

  const handleCreateRecipe = (e: React.FormEvent) => {
    e.preventDefault();

    if (ingredients.length === 0) {
      alert("Please add at least one ingredient");
      return;
    }

    const totalCost = calculateTotalCost();
    const servings = parseInt(newRecipe.servings);
    const costPerServing = totalCost / servings;

    const recipeToAdd: Recipe = {
      id: `RCP-${String(recipes.length + 1).padStart(3, '0')}`,
      name: newRecipe.name,
      category: newRecipe.category,
      servings: servings,
      yieldPercentage: parseInt(newRecipe.yieldPercentage),
      prepTime: parseInt(newRecipe.prepTime),
      ingredients: ingredients,
      totalCost: totalCost,
      costPerServing: costPerServing,
      instructions: newRecipe.instructions,
    };

    setRecipes([recipeToAdd, ...recipes]);
    setShowCreateModal(false);
    setNewRecipe({
      name: "",
      category: "",
      servings: "",
      yieldPercentage: "100",
      prepTime: "",
      instructions: "",
    });
    setIngredients([]);
  };

  const handleViewRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setScaleMultiplier(1);
    setShowViewModal(true);
  };

  const handleDeleteRecipe = (id: string) => {
    if (confirm("Are you sure you want to delete this recipe?")) {
      setRecipes(recipes.filter(r => r.id !== id));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setNewRecipe({
      ...newRecipe,
      [e.target.name]: e.target.value,
    });
  };

  const handleIngredientInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // If selecting an ingredient from dropdown, auto-fill unit cost and unit
    if (name === "name" && value) {
      const selectedItem = inventoryItems.find(item => item.name === value);
      if (selectedItem) {
        setCurrentIngredient({
          ...currentIngredient,
          name: value,
          unit: selectedItem.unit,
          unitCost: selectedItem.price.toString(),
        });
        return;
      }
    }

    setCurrentIngredient({
      ...currentIngredient,
      [name]: value,
    });
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleOpenCreateModal = () => {
    setShowCreateModal(true);
    setSelectedCategories([]);
    setIngredients([]);
    setCurrentIngredient({
      name: "",
      quantity: "",
      unit: "kg",
      unitCost: "",
    });
  };

  const getScaledQuantity = (quantity: number) => {
    return (quantity * scaleMultiplier).toFixed(2);
  };

  const getScaledCost = (cost: number) => {
    return (cost * scaleMultiplier).toFixed(2);
  };

  const stats = [
    { label: "Total Recipes", value: recipes.length, color: "text-blue-600" },
    { label: "Avg Cost/Serving", value: `₱${(recipes.reduce((sum, r) => sum + r.costPerServing, 0) / recipes.length).toFixed(2)}`, color: "text-green-600" },
    { label: "Main Courses", value: recipes.filter(r => r.category === "Main Course").length, color: "text-purple-600" },
    { label: "Desserts", value: recipes.filter(r => r.category === "Dessert").length, color: "text-orange-600" },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Recipe & BOM</h1>
          <p className="text-muted-foreground">Manage recipes, ingredients, and calculate costs</p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="mt-4 md:mt-0 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-2xl hover:shadow-lg hover:shadow-primary/30 transition-all duration-200 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create Recipe
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-card rounded-2xl p-6 shadow-sm border border-border">
            <p className="text-muted-foreground text-sm mb-2">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Search and Filter */}
      <div className="bg-card rounded-2xl p-6 shadow-sm border border-border mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search recipes by name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-input-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-3 bg-input-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all appearance-none cursor-pointer min-w-[200px]"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === "all" ? "All Categories" : cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Recipes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRecipes.map((recipe) => (
          <div key={recipe.id} className="bg-card rounded-2xl p-6 shadow-sm border border-border hover:shadow-md transition-all duration-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                  <ChefHat className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">{recipe.name}</h3>
                  <p className="text-xs text-muted-foreground">{recipe.id}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Category:</span>
                <span className="font-medium text-foreground">{recipe.category}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Servings:</span>
                <span className="font-medium text-foreground">{recipe.servings}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Prep Time:</span>
                <span className="font-medium text-foreground">{recipe.prepTime} min</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Yield:</span>
                <span className="font-medium text-foreground">{recipe.yieldPercentage}%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Ingredients:</span>
                <span className="font-medium text-foreground">{recipe.ingredients.length}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-border mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Total Cost</p>
                  <p className="text-xl font-bold text-primary">₱{recipe.totalCost.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Per Serving</p>
                  <p className="text-xl font-bold text-green-600">₱{recipe.costPerServing.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleViewRecipe(recipe)}
                className="flex-1 px-4 py-2 bg-primary/10 text-primary rounded-xl hover:bg-primary/20 transition-colors flex items-center justify-center gap-2"
              >
                <Calculator className="w-4 h-4" />
                View & Scale
              </button>
              <button
                onClick={() => handleDeleteRecipe(recipe.id)}
                className="px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Recipe Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowCreateModal(false)}>
          <div className="bg-card rounded-2xl shadow-xl border border-border w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-card p-6 border-b border-border flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">Create New Recipe</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-muted rounded-xl transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreateRecipe} className="p-6 space-y-6">
              {/* Category Selection for Filtering Ingredients */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Tag className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-900">Select Ingredient Categories</h3>
                </div>
                <p className="text-xs text-blue-700 mb-3">Select one or more categories to filter available ingredients</p>
                <div className="flex flex-wrap gap-2">
                  {availableCategories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleCategory(cat)}
                      className={`px-3 py-1.5 text-xs rounded-lg border transition-all ${
                        selectedCategories.includes(cat)
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-blue-900 border-blue-300 hover:bg-blue-50"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                {selectedCategories.length > 0 && (
                  <div className="mt-3 text-xs text-blue-700">
                    <strong>{filteredInventoryItems.length}</strong> ingredients available from selected categories
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm mb-2 text-foreground font-medium">
                    Recipe Name *
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={newRecipe.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 text-sm bg-input-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm mb-2 text-foreground font-medium">
                    Category *
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={newRecipe.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 text-sm bg-input-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all appearance-none cursor-pointer"
                    required
                  >
                    <option value="">Select category</option>
                    <option value="Appetizer">Appetizer</option>
                    <option value="Main Course">Main Course</option>
                    <option value="Dessert">Dessert</option>
                    <option value="Beverage">Beverage</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="servings" className="block text-sm mb-2 text-foreground font-medium">
                    Servings *
                  </label>
                  <input
                    id="servings"
                    name="servings"
                    type="number"
                    value={newRecipe.servings}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 text-sm bg-input-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="yieldPercentage" className="block text-sm mb-2 text-foreground font-medium">
                    Yield Percentage *
                  </label>
                  <input
                    id="yieldPercentage"
                    name="yieldPercentage"
                    type="number"
                    value={newRecipe.yieldPercentage}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 text-sm bg-input-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label htmlFor="prepTime" className="block text-sm mb-2 text-foreground font-medium">
                    Prep Time (minutes) *
                  </label>
                  <input
                    id="prepTime"
                    name="prepTime"
                    type="number"
                    value={newRecipe.prepTime}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 text-sm bg-input-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    required
                  />
                </div>
              </div>

              <div className="border-t border-border pt-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Add Ingredients</h3>

                <div className="grid grid-cols-5 gap-3 mb-4">
                  <div className="col-span-2">
                    <label htmlFor="ingredientName" className="block text-xs mb-1 text-foreground">
                      Ingredient Name
                    </label>
                    <select
                      id="ingredientName"
                      name="name"
                      value={currentIngredient.name}
                      onChange={handleIngredientInputChange}
                      className="w-full px-3 py-2 text-sm bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all appearance-none cursor-pointer"
                    >
                      <option value="">Select ingredient...</option>
                      {filteredInventoryItems.map((item) => (
                        <option key={item.id} value={item.name}>
                          {item.name} ({item.category})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="quantity" className="block text-xs mb-1 text-foreground">
                      Quantity
                    </label>
                    <input
                      id="quantity"
                      name="quantity"
                      type="number"
                      step="0.01"
                      value={currentIngredient.quantity}
                      onChange={handleIngredientInputChange}
                      className="w-full px-3 py-2 text-sm bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    />
                  </div>

                  <div>
                    <label htmlFor="unit" className="block text-xs mb-1 text-foreground">
                      Unit <span className="text-muted-foreground font-normal">(auto)</span>
                    </label>
                    <input
                      id="unit"
                      name="unit"
                      type="text"
                      value={currentIngredient.unit}
                      className="w-full px-3 py-2 text-sm bg-muted/50 border border-input rounded-lg focus:outline-none"
                      readOnly
                    />
                  </div>

                  <div>
                    <label htmlFor="unitCost" className="block text-xs mb-1 text-foreground">
                      Unit Cost (₱) <span className="text-muted-foreground font-normal">(auto)</span>
                    </label>
                    <input
                      id="unitCost"
                      name="unitCost"
                      type="number"
                      step="0.01"
                      value={currentIngredient.unitCost}
                      onChange={handleIngredientInputChange}
                      className="w-full px-3 py-2 text-sm bg-muted/50 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                      readOnly
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddIngredient}
                  className="w-full px-4 py-2 bg-blue-600 text-white text-sm rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 mb-4"
                >
                  <Plus className="w-4 h-4" />
                  Add Ingredient
                </button>

                {ingredients.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-foreground">Ingredients ({ingredients.length})</h4>
                    <div className="max-h-60 overflow-y-auto space-y-2">
                      {ingredients.map((ing) => (
                        <div key={ing.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-foreground">{ing.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {ing.quantity} {ing.unit} × ₱{ing.unitCost.toFixed(2)} = ₱{ing.totalCost.toFixed(2)}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveIngredient(ing.id)}
                            className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="pt-3 border-t border-border">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-foreground">Total Cost:</span>
                        <span className="text-xl font-bold text-primary">₱{calculateTotalCost().toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="instructions" className="block text-sm mb-2 text-foreground font-medium">
                  Instructions
                </label>
                <textarea
                  id="instructions"
                  name="instructions"
                  value={newRecipe.instructions}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 text-sm bg-input-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none"
                  placeholder="Enter cooking instructions..."
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-border">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Create Recipe
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-3 bg-muted text-foreground rounded-xl hover:bg-muted/80 transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View & Scale Recipe Modal */}
      {showViewModal && selectedRecipe && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowViewModal(false)}>
          <div className="bg-card rounded-2xl shadow-xl border border-border w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-card p-6 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground">{selectedRecipe.name}</h2>
                <p className="text-sm text-muted-foreground mt-1">{selectedRecipe.id} - {selectedRecipe.category}</p>
              </div>
              <button
                onClick={() => setShowViewModal(false)}
                className="p-2 hover:bg-muted rounded-xl transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Scale Controls */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Scale className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-blue-900">Recipe Scaling</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setScaleMultiplier(Math.max(0.5, scaleMultiplier - 0.5))}
                      className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      -
                    </button>
                    <span className="text-xl font-bold text-blue-900 min-w-[60px] text-center">
                      {scaleMultiplier}x
                    </span>
                    <button
                      onClick={() => setScaleMultiplier(scaleMultiplier + 0.5)}
                      className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-blue-700">Servings: {selectedRecipe.servings} × {scaleMultiplier} = <strong>{selectedRecipe.servings * scaleMultiplier}</strong></span>
                  <span className="text-blue-700">Total Cost: <strong>₱{getScaledCost(selectedRecipe.totalCost)}</strong></span>
                </div>
              </div>

              {/* Recipe Info */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-muted/30 rounded-xl p-4">
                  <p className="text-xs text-muted-foreground mb-1">Prep Time</p>
                  <p className="text-lg font-bold text-foreground">{selectedRecipe.prepTime} min</p>
                </div>
                <div className="bg-muted/30 rounded-xl p-4">
                  <p className="text-xs text-muted-foreground mb-1">Yield %</p>
                  <p className="text-lg font-bold text-foreground">{selectedRecipe.yieldPercentage}%</p>
                </div>
                <div className="bg-muted/30 rounded-xl p-4">
                  <p className="text-xs text-muted-foreground mb-1">Cost/Serving</p>
                  <p className="text-lg font-bold text-green-600">₱{getScaledCost(selectedRecipe.costPerServing)}</p>
                </div>
                <div className="bg-muted/30 rounded-xl p-4">
                  <p className="text-xs text-muted-foreground mb-1">Ingredients</p>
                  <p className="text-lg font-bold text-foreground">{selectedRecipe.ingredients.length}</p>
                </div>
              </div>

              {/* Ingredients Table */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Bill of Materials (Scaled)</h3>
                <div className="bg-muted/30 rounded-xl overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted/50 border-b border-border">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Ingredient</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-foreground">Quantity</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-foreground">Unit Cost</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-foreground">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {selectedRecipe.ingredients.map((ing) => (
                        <tr key={ing.id}>
                          <td className="px-4 py-3 text-foreground">{ing.name}</td>
                          <td className="px-4 py-3 text-right text-foreground">
                            {getScaledQuantity(ing.quantity)} {ing.unit}
                          </td>
                          <td className="px-4 py-3 text-right text-foreground">₱{ing.unitCost.toFixed(2)}</td>
                          <td className="px-4 py-3 text-right font-medium text-foreground">
                            ₱{getScaledCost(ing.totalCost)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-muted/50 border-t border-border">
                      <tr>
                        <td colSpan={3} className="px-4 py-3 text-right font-semibold text-foreground">
                          Grand Total:
                        </td>
                        <td className="px-4 py-3 text-right text-xl font-bold text-primary">
                          ₱{getScaledCost(selectedRecipe.totalCost)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Instructions */}
              {selectedRecipe.instructions && (
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">Instructions</h3>
                  <div className="bg-muted/30 rounded-xl p-4">
                    <p className="text-sm text-foreground whitespace-pre-line">{selectedRecipe.instructions}</p>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-border">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="flex-1 px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
