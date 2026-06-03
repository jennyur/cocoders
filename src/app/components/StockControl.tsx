import { useState } from "react";
import { Package, Search, TrendingDown, TrendingUp, AlertCircle, RefreshCw, Download, BarChart3, Calendar, Clock } from "lucide-react";
import { readLocalStorage } from "../lib/localStorage";
import { formatQuantity, getDaysUntilExpiry, getInventoryProducts, getStockStatus, splitCategory, StockStatus } from "../lib/inventoryLogic";

type StockItem = {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  unit: string;
  minStock: number;
  maxStock: number;
  reorderPoint: number;
  unitCost: number;
  totalValue: number;
  status: StockStatus;
  turnoverRate: number | null;
  movementQuantity: number;
  classification: "A" | "B" | "C";
  expiry?: string;
  location?: string;
};

type ExpiryItem = {
  id: string;
  name: string;
  category: string;
  sku: string;
  location: string;
  expiry: string;
  stock: number;
  unit: string;
  daysUntilExpiry: number;
};

type ViewType = "control" | "low-stock" | "expiring";

type WasteLogSummary = {
  item: string;
  quantity: number;
};

type AdjustmentSummary = {
  item: string;
  quantity: number;
  type: "damage" | "shrinkage" | "waste" | "found" | "correction";
};

type InventoryMovementSummary = {
  item: string;
  quantity: number;
  type: "pos-consumption" | "pos-void";
};

const normalizeName = (value: string) => value.trim().toLowerCase();

export function StockControl() {
  const [viewType, setViewType] = useState<ViewType>("control");
  const [searchQuery, setSearchQuery] = useState("");
  const [classificationFilter, setClassificationFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const products = getInventoryProducts();
  const wasteLogs = readLocalStorage<WasteLogSummary[]>("transfers.wasteLogs", []);
  const adjustments = readLocalStorage<AdjustmentSummary[]>("transfers.adjustments", []);
  const inventoryMovements = readLocalStorage<InventoryMovementSummary[]>("inventory.movements", []);

  const getRecordedOutflowQuantity = (productName: string) => {
    const targetName = normalizeName(productName);
    const wasteQuantity = wasteLogs
      .filter((log) => normalizeName(log.item) === targetName)
      .reduce((sum, log) => sum + (Number(log.quantity) || 0), 0);
    const adjustmentQuantity = adjustments
      .filter((adjustment) =>
        normalizeName(adjustment.item) === targetName &&
        ["damage", "shrinkage", "waste"].includes(adjustment.type)
      )
      .reduce((sum, adjustment) => sum + (Number(adjustment.quantity) || 0), 0);
    const posConsumptionQuantity = inventoryMovements
      .filter((movement) => normalizeName(movement.item) === targetName && movement.type === "pos-consumption")
      .reduce((sum, movement) => sum + (Number(movement.quantity) || 0), 0);
    const posVoidQuantity = inventoryMovements
      .filter((movement) => normalizeName(movement.item) === targetName && movement.type === "pos-void")
      .reduce((sum, movement) => sum + (Number(movement.quantity) || 0), 0);

    return Math.max(0, wasteQuantity + adjustmentQuantity + posConsumptionQuantity - posVoidQuantity);
  };

  const stockItems: StockItem[] = products.map((product) => {
    const totalValue = product.stock * product.price;
    const status = getStockStatus(product.stock, product.maxStock);
    const classification = totalValue >= 500 ? "A" : totalValue >= 150 ? "B" : "C";
    const { main } = splitCategory(product.category);
    const movementQuantity = getRecordedOutflowQuantity(product.name);
    const averageStockEstimate = movementQuantity > 0
      ? Math.max((product.stock + product.stock + movementQuantity) / 2, 1)
      : 0;

    return {
      id: product.sku,
      name: product.name,
      category: main,
      currentStock: product.stock,
      unit: product.unit || "pcs",
      minStock: product.minStock ?? Math.ceil(product.maxStock * 0.25),
      maxStock: product.maxStock,
      reorderPoint: product.reorderPoint ?? Math.ceil(product.maxStock * 0.3),
      unitCost: product.price,
      totalValue,
      status,
      turnoverRate: movementQuantity > 0 ? Number((movementQuantity / averageStockEstimate).toFixed(2)) : null,
      movementQuantity,
      classification,
      expiry: product.expiry,
      location: product.location || "Unassigned",
    };
  });

  const expiryItems: ExpiryItem[] = products
    .map((product) => {
      const { main } = splitCategory(product.category);
      return {
        id: product.sku,
        name: product.name,
        category: main,
        sku: product.sku,
        location: product.location || "Unassigned",
        expiry: product.expiry,
        stock: product.stock,
        unit: product.unit || "pcs",
        daysUntilExpiry: getDaysUntilExpiry(product.expiry),
      };
    })
    .filter((item) => item.daysUntilExpiry <= 7)
    .sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);

  const lowStockItems = stockItems.filter(item => item.status === "out-of-stock" || item.status === "critical" || item.status === "low");

  const filteredControlItems = stockItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClassification = classificationFilter === "all" || item.classification === classificationFilter;
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    return matchesSearch && matchesClassification && matchesStatus;
  });

  const filteredLowStockItems = lowStockItems.filter(item => {
    return item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           item.id.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const filteredExpiryItems = expiryItems.filter(item => {
    return item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           item.sku.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const getStatusBadge = (status: string) => {
    const styles = {
      "out-of-stock": "bg-black text-white border-black",
      healthy: "bg-green-100 text-green-700 border-green-200",
      medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
      low: "bg-orange-100 text-orange-700 border-orange-200",
      critical: "bg-red-100 text-red-700 border-red-200",
      overstock: "bg-blue-100 text-blue-700 border-blue-200",
    };
    const labels = {
      "out-of-stock": "Out of Stock",
      healthy: "Healthy Stock",
      medium: "Medium Stock",
      low: "Low Stock",
      critical: "Critical Stock",
      overstock: "Overstock",
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const getClassificationBadge = (classification: string) => {
    const styles = {
      A: "bg-purple-100 text-purple-700 border-purple-200",
      B: "bg-blue-100 text-blue-700 border-blue-200",
      C: "bg-gray-100 text-gray-700 border-gray-200",
    };
    return (
      <span className={`px-2 py-1 rounded text-xs font-bold border ${styles[classification as keyof typeof styles]}`}>
        {classification}
      </span>
    );
  };

  const getExpiryStatus = (daysUntilExpiry: number) => {
    if (daysUntilExpiry <= 0) {
      return {
        status: "expired",
        label: daysUntilExpiry === 0 ? "Expires Today" : "Expired",
        color: "bg-black",
        textColor: "text-white",
        borderColor: "border-black",
      };
    } else if (daysUntilExpiry === 1) {
      return {
        status: "critical",
        label: "Expires Tomorrow",
        color: "bg-red-500",
        textColor: "text-white",
        borderColor: "border-red-500",
      };
    } else if (daysUntilExpiry <= 3) {
      return {
        status: "urgent",
        label: `Expires in ${daysUntilExpiry} days`,
        color: "bg-orange-500",
        textColor: "text-white",
        borderColor: "border-orange-500",
      };
    } else if (daysUntilExpiry <= 7) {
      return {
        status: "warning",
        label: `Expires in ${daysUntilExpiry} days`,
        color: "bg-yellow-500",
        textColor: "text-white",
        borderColor: "border-yellow-500",
      };
    } else {
      return {
        status: "good",
        label: `Expires in ${daysUntilExpiry} days`,
        color: "bg-green-500",
        textColor: "text-white",
        borderColor: "border-green-500",
      };
    }
  };

  const stats = [
    { label: "Total Stock Value", value: `₱${stockItems.reduce((sum, item) => sum + item.totalValue, 0).toLocaleString()}`, icon: Package, color: "from-blue-500 to-cyan-500" },
    { label: "Out of Stock", value: stockItems.filter(i => i.status === "out-of-stock").length, icon: AlertCircle, color: "from-black to-zinc-700" },
    { label: "Critical Stock", value: stockItems.filter(i => i.status === "critical").length, icon: AlertCircle, color: "from-red-500 to-rose-500" },
    { label: "Low Stock", value: stockItems.filter(i => i.status === "low").length, icon: TrendingDown, color: "from-orange-500 to-amber-500" },
    { label: "Medium Stock", value: stockItems.filter(i => i.status === "medium").length, icon: BarChart3, color: "from-yellow-500 to-amber-400" },
    { label: "Healthy Stock", value: stockItems.filter(i => i.status === "healthy").length, icon: Package, color: "from-green-500 to-emerald-500" },
    { label: "Expiring Soon", value: expiryItems.filter(i => i.daysUntilExpiry <= 3).length, icon: Calendar, color: "from-orange-500 to-red-500" },
  ];

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate data refresh
    setTimeout(() => {
      setIsRefreshing(false);
      // In a real app, this would fetch fresh data from the backend
      alert("Stock data refreshed successfully!");
    }, 1000);
  };

  const handleExportReport = () => {
    let csvContent = "";
    let filename = "";

    if (viewType === "control") {
      // Export Stock Control data
      csvContent = "SKU,Product Name,Category,Current Stock,Min Stock,Max Stock,Reorder Point,Unit Cost,Total Value,Status,Recorded Outflow,Turnover Rate,Classification,Location\n";

      filteredControlItems.forEach(item => {
        csvContent += `${item.id},${item.name},${item.category},${item.currentStock} ${item.unit},${item.minStock} ${item.unit},${item.maxStock} ${item.unit},${item.reorderPoint} ${item.unit},${item.unitCost.toFixed(2)},${item.totalValue.toFixed(2)},${item.status},${item.movementQuantity} ${item.unit},${item.turnoverRate === null ? "N/A" : `${item.turnoverRate}x`},${item.classification},${item.location}\n`;
      });

      filename = "stock_control_report.csv";
    } else if (viewType === "low-stock") {
      // Export Low Stock Alerts
      csvContent = "SKU,Product Name,Category,Current Stock,Min Stock,Reorder Point,Status,Location\n";

      filteredLowStockItems.forEach(item => {
        csvContent += `${item.id},${item.name},${item.category},${item.currentStock} ${item.unit},${item.minStock} ${item.unit},${item.reorderPoint} ${item.unit},${item.status},${item.location}\n`;
      });

      filename = "low_stock_alerts.csv";
    } else if (viewType === "expiring") {
      // Export Expiring Items
      csvContent = "SKU,Product Name,Category,Expiry Date,Days Until Expiry,Current Stock,Location\n";

      filteredExpiryItems.forEach(item => {
        csvContent += `${item.sku},${item.name},${item.category},${item.expiry},${item.daysUntilExpiry},${item.stock} ${item.unit},${item.location}\n`;
      });

      filename = "expiring_items_report.csv";
    }

    // Create and download CSV file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Stock Control & Alerts</h1>
          <p className="text-muted-foreground">Monitor stock levels, alerts, reorder points, and inventory valuation</p>
        </div>
        <div className="flex gap-3 mt-4 md:mt-0">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-6 py-3 bg-muted text-foreground rounded-2xl hover:bg-muted/80 transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </button>
          <button
            onClick={handleExportReport}
            className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-2xl hover:shadow-lg hover:shadow-primary/30 transition-all duration-200 flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            Export Report
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 xl:grid-cols-7 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-card rounded-2xl p-6 shadow-sm border border-border">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-muted-foreground text-sm mb-2">{stat.label}</p>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* View Toggle */}
      <div className="flex items-center gap-2 bg-muted rounded-2xl p-1 mb-6 w-fit">
        <button
          onClick={() => setViewType("control")}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
            viewType === "control"
              ? "bg-primary text-white shadow-md"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Stock Control
        </button>
        <button
          onClick={() => setViewType("low-stock")}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
            viewType === "low-stock"
              ? "bg-primary text-white shadow-md"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Package className="w-4 h-4" />
          Low Stock Alerts
        </button>
        <button
          onClick={() => setViewType("expiring")}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
            viewType === "expiring"
              ? "bg-primary text-white shadow-md"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Calendar className="w-4 h-4" />
          Expiring Items
        </button>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-2xl p-6 shadow-sm border border-border mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by product name or SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-input-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
          </div>
          {viewType === "control" && (
            <>
              <select
                value={classificationFilter}
                onChange={(e) => setClassificationFilter(e.target.value)}
                className="px-4 py-3 bg-input-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all appearance-none cursor-pointer"
              >
                <option value="all">All Classifications</option>
                <option value="A">Class A (High Value)</option>
                <option value="B">Class B (Medium Value)</option>
                <option value="C">Class C (Low Value)</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 bg-input-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all appearance-none cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="out-of-stock">Out of Stock</option>
                <option value="critical">Critical Stock (1% - 10%)</option>
                <option value="low">Low Stock (11% - 30%)</option>
                <option value="medium">Medium Stock (31% - 70%)</option>
                <option value="healthy">Healthy Stock (71% - 100%)</option>
                <option value="overstock">Overstock</option>
              </select>
            </>
          )}
        </div>
      </div>

      {/* Content Based on View Type */}
      {viewType === "control" && (
        <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-foreground">SKU</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-foreground">Product Name</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-foreground">Category</th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-foreground">Current Stock</th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-foreground">Reorder Point</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-foreground">Unit Cost</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-foreground">Total Value</th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-foreground">Turnover</th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-foreground">ABC</th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-foreground">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredControlItems.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-medium text-primary">{item.id}</span>
                    </td>
                    <td className="px-6 py-4 text-foreground font-medium">{item.name}</td>
                    <td className="px-6 py-4 text-muted-foreground">{item.category}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center">
                        <span className="font-bold text-foreground">{formatQuantity(item.currentStock, item.unit)}</span>
                        <span className="text-xs text-muted-foreground">Min: {formatQuantity(item.minStock, item.unit)} | Max: {formatQuantity(item.maxStock, item.unit)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center text-foreground">{formatQuantity(item.reorderPoint, item.unit)}</td>
                    <td className="px-6 py-4 text-right text-foreground">₱{item.unitCost.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right font-medium text-foreground">₱{item.totalValue.toFixed(2)}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1 text-sm">
                        <BarChart3 className="w-4 h-4 text-primary" />
                        {item.turnoverRate === null ? "N/A" : `${item.turnoverRate}x`}
                      </span>
                      <p className="text-[10px] text-muted-foreground">Outflow: {formatQuantity(item.movementQuantity, item.unit)}</p>
                    </td>
                    <td className="px-6 py-4 text-center">{getClassificationBadge(item.classification)}</td>
                    <td className="px-6 py-4 text-center">{getStatusBadge(item.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {viewType === "low-stock" && (
        <div className="space-y-4">
          {filteredLowStockItems.length === 0 ? (
            <div className="bg-card rounded-2xl p-12 text-center shadow-sm border border-border">
              <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No Low Stock Items</h3>
              <p className="text-muted-foreground">All items are well-stocked!</p>
            </div>
          ) : (
            filteredLowStockItems.map((item) => (
              <div
                key={item.id}
                className={`bg-card rounded-2xl p-6 shadow-sm border-2 ${
                  item.status === "out-of-stock" ? "border-black" : item.status === "critical" ? "border-red-300" : "border-orange-300"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-foreground">{item.name}</h3>
                      {getStatusBadge(item.status)}
                      {getClassificationBadge(item.classification)}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">SKU</p>
                        <p className="text-sm font-medium text-foreground">{item.id}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Category</p>
                        <p className="text-sm font-medium text-foreground">{item.category}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Current Stock</p>
                        <p className={`text-sm font-bold ${item.status === "out-of-stock" ? "text-black" : item.status === "critical" ? "text-red-600" : "text-orange-600"}`}>{formatQuantity(item.currentStock, item.unit)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Min Stock</p>
                        <p className="text-sm font-medium text-foreground">{formatQuantity(item.minStock, item.unit)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Reorder Point</p>
                        <p className="text-sm font-medium text-foreground">{formatQuantity(item.reorderPoint, item.unit)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Location</p>
                        <p className="text-sm font-medium text-foreground">{item.location}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Unit Cost</p>
                        <p className="text-sm font-medium text-foreground">₱{item.unitCost.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Total Value</p>
                        <p className="text-sm font-bold text-foreground">₱{item.totalValue.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                  <AlertCircle className={`w-8 h-8 ${item.status === "out-of-stock" ? "text-black" : item.status === "critical" ? "text-red-500" : "text-orange-500"}`} />
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {viewType === "expiring" && (
        <div className="space-y-4">
          {filteredExpiryItems.length === 0 ? (
            <div className="bg-card rounded-2xl p-12 text-center shadow-sm border border-border">
              <Calendar className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No Expiring Items</h3>
              <p className="text-muted-foreground">All items are fresh!</p>
            </div>
          ) : (
            filteredExpiryItems.map((item) => {
              const expiryStatus = getExpiryStatus(item.daysUntilExpiry);
              return (
                <div
                  key={item.id}
                  className="bg-card rounded-2xl p-6 shadow-sm border-2 border-border hover:shadow-lg transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-foreground">{item.name}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${expiryStatus.color} ${expiryStatus.textColor}`}>
                          {expiryStatus.label}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">SKU</p>
                          <p className="text-sm font-medium text-foreground">{item.sku}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Category</p>
                          <p className="text-sm font-medium text-foreground">{item.category}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Stock Remaining</p>
                          <p className="text-sm font-bold text-foreground">{formatQuantity(item.stock, item.unit)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Location</p>
                          <p className="text-sm font-medium text-foreground">{item.location}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Expiry Date</p>
                          <p className="text-sm font-medium text-foreground">{item.expiry}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Days Until Expiry</p>
                          <p className={`text-sm font-bold ${item.daysUntilExpiry <= 1 ? "text-red-600" : item.daysUntilExpiry <= 3 ? "text-orange-600" : "text-foreground"}`}>
                            {item.daysUntilExpiry === 0 ? "EXPIRED" : `${item.daysUntilExpiry} days`}
                          </p>
                        </div>
                      </div>
                    </div>
                    <Clock className={`w-8 h-8 ${item.daysUntilExpiry === 0 ? "text-black" : item.daysUntilExpiry === 1 ? "text-red-500" : item.daysUntilExpiry <= 3 ? "text-orange-500" : "text-yellow-500"}`} />
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
