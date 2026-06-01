import { useState } from "react";
import { Search, Filter, CheckCircle, Package, Calendar, AlertCircle, ClipboardCheck, X, XCircle, ThumbsUp, ThumbsDown, Eye } from "lucide-react";
import { readLocalStorage, useLocalStorageState, writeLocalStorage } from "../lib/localStorage";
import { defaultInventoryProducts, InventoryProduct } from "../lib/inventoryLogic";

type QualityCheckCriteria = {
  appearance: "pass" | "fail" | "";
  quantity: "pass" | "fail" | "";
  temperature: "pass" | "fail" | "";
  expiration: "pass" | "fail" | "";
  packaging: "pass" | "fail" | "";
};

type ReceivedItem = {
  productName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  condition: string;
};

type GoodsItem = {
  id: string;
  poId: string;
  supplier: string;
  receivedDate: string;
  items: number;
  receivedItems?: ReceivedItem[];
  totalValue: number;
  receivedBy: string;
  status: string;
  notes: string;
  qualityCheck?: {
    appearance: "pass" | "fail";
    quantity: "pass" | "fail";
    temperature: "pass" | "fail";
    expiration: "pass" | "fail";
    packaging: "pass" | "fail";
  };
};

type PurchaseOrder = {
  id: string;
  status: string;
};

export function GoodsReceived() {
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [showQualityCheckModal, setShowQualityCheckModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<GoodsItem | null>(null);
  const [viewItem, setViewItem] = useState<GoodsItem | null>(null);
  const [qualityCheckCriteria, setQualityCheckCriteria] = useState<QualityCheckCriteria>({
    appearance: "",
    quantity: "",
    temperature: "",
    expiration: "",
    packaging: "",
  });
  const [qualityNotes, setQualityNotes] = useState("");
  const [checkedItems, setCheckedItems] = useState<{ [key: number]: boolean }>({});

  const [receivedGoods, setReceivedGoods] = useLocalStorageState<GoodsItem[]>("goodsReceived.records", [
    {
      id: "GR-2024-001",
      poId: "PO-2024-003",
      supplier: "Local Dairy Inc.",
      receivedDate: "2024-05-22",
      items: 3,
      receivedItems: [
        { productName: "Greek Yogurt 32oz", quantity: 100, unit: "pcs", unitPrice: 6.99, condition: "Excellent" },
        { productName: "Aged Cheddar Cheese", quantity: 50, unit: "pcs", unitPrice: 8.99, condition: "Good" },
        { productName: "Whole Milk 1gal", quantity: 80, unit: "bottle", unitPrice: 4.99, condition: "Excellent" },
      ],
      totalValue: 1598.70,
      receivedBy: "John Smith",
      status: "verified",
      notes: "All items fresh, proper refrigeration maintained",
      qualityCheck: {
        appearance: "pass",
        quantity: "pass",
        temperature: "pass",
        expiration: "pass",
        packaging: "pass",
      },
    },
    {
      id: "GR-2024-002",
      poId: "PO-2024-004",
      supplier: "Organic Produce LLC",
      receivedDate: "2024-05-19",
      items: 4,
      receivedItems: [
        { productName: "Romaine Lettuce", quantity: 100, unit: "pcs", unitPrice: 3.49, condition: "Excellent" },
        { productName: "Carrots", quantity: 120, unit: "kg", unitPrice: 2.49, condition: "Good" },
        { productName: "Blueberries 1lb", quantity: 60, unit: "pack", unitPrice: 6.99, condition: "Excellent" },
        { productName: "Strawberries 1lb", quantity: 80, unit: "pack", unitPrice: 4.99, condition: "Excellent" },
      ],
      totalValue: 1466.60,
      receivedBy: "Sarah Johnson",
      status: "verified",
      notes: "Produce quality excellent, no damaged items",
      qualityCheck: {
        appearance: "pass",
        quantity: "pass",
        temperature: "pass",
        expiration: "pass",
        packaging: "pass",
      },
    },
    {
      id: "GR-2024-003",
      poId: "PO-2024-002",
      supplier: "Ocean Harvest",
      receivedDate: "2024-05-25",
      items: 2,
      receivedItems: [
        { productName: "Wild-Caught Tuna", quantity: 60, unit: "kg", unitPrice: 19.99, condition: "Pending Check" },
        { productName: "Jumbo Shrimp", quantity: 80, unit: "kg", unitPrice: 18.99, condition: "Pending Check" },
      ],
      totalValue: 2719.60,
      receivedBy: "Mike Chen",
      status: "pending",
      notes: "Awaiting temperature verification for seafood",
    },
    {
      id: "GR-2024-004",
      poId: "PO-2024-006",
      supplier: "Fresh Farms Co.",
      receivedDate: "2024-05-24",
      items: 3,
      receivedItems: [
        { productName: "Fresh Salmon Fillet", quantity: 50, unit: "kg", unitPrice: 24.99, condition: "Good" },
        { productName: "Organic Chicken Breast", quantity: 40, unit: "kg", unitPrice: 12.99, condition: "Fair" },
        { productName: "Strawberries 1lb", quantity: 30, unit: "pack", unitPrice: 4.99, condition: "Fair - 3 expired" },
      ],
      totalValue: 1919.10,
      receivedBy: "Emily Davis",
      status: "partial",
      notes: "3 items expired during transit, supplier contacted",
      qualityCheck: {
        appearance: "pass",
        quantity: "pass",
        temperature: "pass",
        expiration: "fail",
        packaging: "pass",
      },
    },
    {
      id: "GR-2024-005",
      poId: "PO-2024-007",
      supplier: "Organic Produce LLC",
      receivedDate: "2024-05-23",
      items: 2,
      receivedItems: [
        { productName: "Romaine Lettuce", quantity: 150, unit: "pcs", unitPrice: 3.49, condition: "Excellent" },
        { productName: "Spinach", quantity: 100, unit: "pcs", unitPrice: 2.99, condition: "Good" },
      ],
      totalValue: 822.50,
      receivedBy: "John Smith",
      status: "verified",
      notes: "Delivery complete, all expiry dates verified",
      qualityCheck: {
        appearance: "pass",
        quantity: "pass",
        temperature: "pass",
        expiration: "pass",
        packaging: "pass",
      },
    },
  ]);

  const dateFilters = ["all", "today", "week", "month"];

  const openQualityCheck = (item: GoodsItem) => {
    setSelectedItem(item);
    setShowQualityCheckModal(true);
    setQualityCheckCriteria({
      appearance: "",
      quantity: "",
      temperature: "",
      expiration: "",
      packaging: "",
    });
    setQualityNotes("");
    // Initialize all items as unchecked
    const initialCheckedState: { [key: number]: boolean } = {};
    if (item.receivedItems) {
      item.receivedItems.forEach((_, index) => {
        initialCheckedState[index] = false;
      });
    }
    setCheckedItems(initialCheckedState);
  };

  const handleCriteriaChange = (criterion: keyof QualityCheckCriteria, value: "pass" | "fail") => {
    setQualityCheckCriteria({
      ...qualityCheckCriteria,
      [criterion]: value,
    });
  };

  const handleItemCheck = (index: number) => {
    setCheckedItems({
      ...checkedItems,
      [index]: !checkedItems[index],
    });
  };

  const handleQualityCheckSubmit = (decision: "accept" | "reject") => {
    if (!selectedItem) return;

    const allCriteriaChecked = Object.values(qualityCheckCriteria).every(value => value !== "");

    if (!allCriteriaChecked) {
      alert("Please complete all quality check criteria");
      return;
    }

    // Check if items checklist is provided
    const totalItems = selectedItem.receivedItems?.length || 0;
    const checkedItemsCount = Object.values(checkedItems).filter(checked => checked).length;

    if (totalItems > 0 && checkedItemsCount === 0) {
      alert("Please check at least one item from the received items list");
      return;
    }

    const hasFailures = Object.values(qualityCheckCriteria).some(value => value === "fail");
    const allItemsReceived = checkedItemsCount === totalItems;

    let newStatus = "";
    let newNotes = "";

    if (decision === "reject") {
      // Reject & Return - for any quality failures
      newStatus = "rejected";
      newNotes = `Quality check failed and items rejected. ${qualityNotes || "Items returned to supplier."}`;
    } else if (decision === "accept") {
      // Accept Goods logic
      if (hasFailures) {
        // If there are quality failures, cannot accept
        alert("Cannot accept goods with quality failures. Please use 'Reject & Return' instead.");
        return;
      }

      if (allItemsReceived) {
        // All items checked + all Pass → Verified
        newStatus = "verified";
        newNotes = `Quality check passed. All ${totalItems} items received and verified. ${qualityNotes || "All criteria met."}`;
      } else {
        // Missing items → Partial
        newStatus = "partial";
        newNotes = `Partial delivery: only ${checkedItemsCount} of ${totalItems} items received. ${qualityNotes || ""}`;
      }
    }

    setReceivedGoods(receivedGoods.map(item =>
      item.id === selectedItem.id
        ? { ...item, status: newStatus, notes: newNotes, qualityCheck: qualityCheckCriteria as any }
        : item
    ));

    const purchaseOrders = readLocalStorage<PurchaseOrder[]>("purchaseOrders.orders", []);
    const poStatus = newStatus === "verified" ? "received" : newStatus;
    writeLocalStorage(
      "purchaseOrders.orders",
      purchaseOrders.map(order => order.id === selectedItem.poId ? { ...order, status: poStatus } : order)
    );

    if (decision === "accept") {
      const products = readLocalStorage<InventoryProduct[]>("inventory.products", defaultInventoryProducts);
      const checkedReceivedItems = selectedItem.receivedItems?.filter((_, index) => checkedItems[index]) || [];

      const updatedProducts = products.map(product => {
        const receivedItem = checkedReceivedItems.find(item => item.productName === product.name);
        if (!receivedItem) return product;
        if (product.unit !== receivedItem.unit) {
          console.warn(`Unit mismatch for ${product.name}: inventory unit=${product.unit}, received unit=${receivedItem.unit}. Stock update skipped.`);
          return product;
        }
        return { ...product, stock: product.stock + receivedItem.quantity };
      });

      writeLocalStorage("inventory.products", updatedProducts);
    }

    setShowQualityCheckModal(false);
    setSelectedItem(null);
  };

  const handleViewDetails = (item: GoodsItem) => {
    setViewItem(item);
    setShowViewModal(true);
  };

  const filteredGoods = receivedGoods.filter(item => {
    const matchesSearch = item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.poId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.supplier.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    const styles = {
      verified: "bg-green-100 text-green-700 border-green-200",
      pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
      partial: "bg-orange-100 text-orange-700 border-orange-200",
      rejected: "bg-red-100 text-red-700 border-red-200",
    };
    const icons = {
      verified: CheckCircle,
      pending: AlertCircle,
      partial: Package,
      rejected: XCircle,
    };
    const Icon = icons[status as keyof typeof icons];
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border inline-flex items-center gap-1 ${styles[status as keyof typeof styles]}`}>
        <Icon className="w-5 h-5" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const stats = [
    {
      label: "Total Received",
      value: receivedGoods.length,
      icon: Package,
      color: "from-blue-500 to-cyan-500",
    },
    {
      label: "Verified",
      value: receivedGoods.filter(g => g.status === "verified").length,
      icon: CheckCircle,
      color: "from-green-500 to-emerald-500",
    },
    {
      label: "Pending QC",
      value: receivedGoods.filter(g => g.status === "pending").length,
      icon: AlertCircle,
      color: "from-yellow-500 to-orange-500",
    },
    {
      label: "Rejected",
      value: receivedGoods.filter(g => g.status === "rejected").length,
      icon: XCircle,
      color: "from-red-500 to-rose-500",
    },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl font-bold text-foreground mb-2">Goods Received</h1>
        <p className="text-muted-foreground">Track and verify incoming inventory shipments</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-card rounded-2xl p-2 shadow-sm border border-border">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-6 h-6 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="text-muted-foreground text-sm mb-6">{stat.label}</p>
              <p className="text-sm font-bold text-foreground">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Search and Filter */}
      <div className="bg-card rounded-2xl p-2 shadow-sm border border-border mb-8">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by GR ID, PO ID, or supplier..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-7 pr-2 py-1 bg-input-background border border-input rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
          </div>
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="pl-12 pr-8 py-3 bg-input-background border border-input rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all appearance-none cursor-pointer min-w-[200px]"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>
      </div>

      {/* Goods Received Table */}
      <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-foreground">GR ID</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-foreground">PO Reference</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-foreground">Supplier</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-foreground">Received Date</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-foreground">Items</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-foreground">Total Value</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-foreground">Received By</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-foreground">Status</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredGoods.map((item) => (
                <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-medium text-primary">{item.id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-foreground font-medium">{item.poId}</span>
                  </td>
                  <td className="px-6 py-4 text-foreground">{item.supplier}</td>
                  <td className="px-6 py-4 text-muted-foreground">{item.receivedDate}</td>
                  <td className="px-6 py-4 text-foreground">{item.items}</td>
                  <td className="px-6 py-4 text-foreground font-medium">${item.totalValue.toLocaleString()}</td>
                  <td className="px-6 py-4 text-muted-foreground">{item.receivedBy}</td>
                  <td className="px-6 py-4">{getStatusBadge(item.status)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {item.status === "pending" && (
                        <button
                          onClick={() => openQualityCheck(item)}
                          className="px-3 py-2 bg-blue-600 text-white text-xs rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                          <ClipboardCheck className="w-4 h-4" />
                          Quality Check
                        </button>
                      )}
                      {item.status !== "pending" && (
                        <button
                          onClick={() => handleViewDetails(item)}
                          className="p-6 hover:bg-blue-50 text-blue-600 rounded-2xl transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Activity Timeline */}
      <div className="mt-1.5 bg-card rounded-2xl p-2 shadow-sm border border-border">
        <h2 className="text-xl font-bold text-foreground mb-8">Recent Receiving Activity</h2>
        <div className="space-y-6">
          {receivedGoods.slice(0, 3).map((item, index) => (
            <div key={index} className="flex gap-6">
              <div className="flex flex-col items-center">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                  item.status === 'verified' ? 'bg-green-100 text-green-600' :
                  item.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                  'bg-orange-100 text-orange-600'
                }`}>
                  <Package className="w-5 h-5" />
                </div>
                {index < 2 && <div className="w-0.5 h-full bg-border mt-2"></div>}
              </div>
              <div className="flex-1 pb-6">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-foreground">{item.id} - {item.supplier}</p>
                    <p className="text-sm text-muted-foreground">{item.items} items received</p>
                  </div>
                  <span className="text-sm text-muted-foreground">{item.receivedDate}</span>
                </div>
                <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-2xl">{item.notes}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quality Check Modal */}
      {showQualityCheckModal && selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowQualityCheckModal(false)}>
          <div className="bg-card rounded-2xl shadow-xl border border-border w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-card p-6 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
                  <ClipboardCheck className="w-7 h-7 text-blue-600" />
                  Quality Check
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedItem.id} - {selectedItem.supplier}
                </p>
              </div>
              <button
                onClick={() => setShowQualityCheckModal(false)}
                className="p-2 hover:bg-muted rounded-xl transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Inspection Criteria */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Inspection Criteria</h3>
                <div className="space-y-4">
                  {[
                    { key: "appearance", label: "Appearance & Freshness", description: "Visual inspection for damage, discoloration, or spoilage" },
                    { key: "quantity", label: "Quantity Verification", description: "Count matches purchase order" },
                    { key: "temperature", label: "Temperature Control", description: "Proper refrigeration/cold chain maintained" },
                    { key: "expiration", label: "Expiration Dates", description: "All items have acceptable shelf life remaining" },
                    { key: "packaging", label: "Packaging Integrity", description: "No torn, damaged, or compromised packaging" },
                  ].map((criterion) => (
                    <div key={criterion.key} className="bg-muted/30 rounded-xl p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="font-semibold text-foreground">{criterion.label}</p>
                          <p className="text-sm text-muted-foreground">{criterion.description}</p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => handleCriteriaChange(criterion.key as keyof QualityCheckCriteria, "pass")}
                            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all ${
                              qualityCheckCriteria[criterion.key as keyof QualityCheckCriteria] === "pass"
                                ? "bg-green-600 text-white shadow-md"
                                : "bg-white border border-border text-foreground hover:bg-green-50"
                            }`}
                          >
                            <ThumbsUp className="w-4 h-4" />
                            Pass
                          </button>
                          <button
                            onClick={() => handleCriteriaChange(criterion.key as keyof QualityCheckCriteria, "fail")}
                            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all ${
                              qualityCheckCriteria[criterion.key as keyof QualityCheckCriteria] === "fail"
                                ? "bg-red-600 text-white shadow-md"
                                : "bg-white border border-border text-foreground hover:bg-red-50"
                            }`}
                          >
                            <ThumbsDown className="w-4 h-4" />
                            Fail
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Items Checklist */}
              {selectedItem.receivedItems && selectedItem.receivedItems.length > 0 && (
                <div className="border-t border-border pt-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center justify-between">
                    <span>Received Items Verification</span>
                    <span className="text-sm font-normal text-muted-foreground">
                      {Object.values(checkedItems).filter(checked => checked).length} / {selectedItem.receivedItems.length} items checked
                    </span>
                  </h3>
                  <div className="bg-muted/30 rounded-xl p-4 space-y-3">
                    <p className="text-sm text-muted-foreground mb-3">
                      Check each item that was received according to the Purchase Order
                    </p>
                    {selectedItem.receivedItems.map((item, index) => (
                      <div
                        key={index}
                        className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                          checkedItems[index]
                            ? "bg-green-50 border-green-200"
                            : "bg-white border-border hover:bg-muted/20"
                        }`}
                      >
                        <input
                          type="checkbox"
                          id={`item-${index}`}
                          checked={checkedItems[index] || false}
                          onChange={() => handleItemCheck(index)}
                          className="w-5 h-5 rounded border-2 border-primary text-primary focus:ring-2 focus:ring-primary/50 cursor-pointer"
                        />
                        <label
                          htmlFor={`item-${index}`}
                          className="flex-1 cursor-pointer"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className={`font-medium ${checkedItems[index] ? "text-green-700" : "text-foreground"}`}>
                                {item.productName}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Quantity: {item.quantity} × ₱{item.unitPrice.toFixed(2)} = ₱{(item.quantity * item.unitPrice).toFixed(2)}
                              </p>
                            </div>
                            {checkedItems[index] && (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            )}
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quality Notes */}
              <div>
                <label htmlFor="qualityNotes" className="block text-sm font-semibold text-foreground mb-2">
                  Quality Check Notes
                </label>
                <textarea
                  id="qualityNotes"
                  value={qualityNotes}
                  onChange={(e) => setQualityNotes(e.target.value)}
                  placeholder="Add any additional notes about the quality inspection..."
                  className="w-full px-4 py-3 bg-input-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all min-h-[100px] resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-border">
                <button
                  onClick={() => handleQualityCheckSubmit("accept")}
                  className="flex-1 px-6 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-200 flex items-center justify-center gap-2 font-semibold"
                >
                  <CheckCircle className="w-5 h-5" />
                  Accept Goods
                </button>
                <button
                  onClick={() => handleQualityCheckSubmit("reject")}
                  className="flex-1 px-6 py-4 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200 flex items-center justify-center gap-2 font-semibold"
                >
                  <XCircle className="w-5 h-5" />
                  Reject & Return
                </button>
                <button
                  onClick={() => setShowQualityCheckModal(false)}
                  className="px-6 py-4 bg-muted text-foreground rounded-xl hover:bg-muted/80 transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {showViewModal && viewItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowViewModal(false)}>
          <div className="bg-card rounded-2xl shadow-xl border border-border w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-card p-6 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Goods Received Details</h2>
                <p className="text-sm text-muted-foreground mt-1">{viewItem.id}</p>
              </div>
              <button
                onClick={() => setShowViewModal(false)}
                className="p-2 hover:bg-muted rounded-xl transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Receipt Information */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">PO Reference</p>
                    <p className="text-lg font-semibold text-primary">{viewItem.poId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Supplier</p>
                    <p className="text-foreground font-medium">{viewItem.supplier}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Received Date</p>
                    <p className="text-foreground">{viewItem.receivedDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Received By</p>
                    <p className="text-foreground">{viewItem.receivedBy}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Status</p>
                    {getStatusBadge(viewItem.status)}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Items</p>
                    <p className="text-foreground">{viewItem.items} items</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Value</p>
                    <p className="text-2xl font-bold text-primary">${viewItem.totalValue.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Received Items Table */}
              {viewItem.receivedItems && viewItem.receivedItems.length > 0 && (
                <div className="border-t border-border pt-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Received Items</h3>
                  <div className="bg-muted/30 rounded-xl overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-muted/50 border-b border-border">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Product Name</th>
                          <th className="px-4 py-3 text-right text-sm font-medium text-foreground">Quantity</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Unit</th>
                          <th className="px-4 py-3 text-right text-sm font-medium text-foreground">Unit Price</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Condition</th>
                          <th className="px-4 py-3 text-right text-sm font-medium text-foreground">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {viewItem.receivedItems.map((item, index) => (
                          <tr key={index} className="hover:bg-muted/20">
                            <td className="px-4 py-3 text-foreground">{item.productName}</td>
                            <td className="px-4 py-3 text-right text-foreground">{item.quantity}</td>
                            <td className="px-4 py-3 text-left text-foreground">{item.unit}</td>
                            <td className="px-4 py-3 text-right text-foreground">${item.unitPrice.toFixed(2)}</td>
                            <td className="px-4 py-3 text-foreground">{item.condition}</td>
                            <td className="px-4 py-3 text-right font-medium text-foreground">
                              ${(item.quantity * item.unitPrice).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-muted/50 border-t border-border">
                        <tr>
                          <td colSpan={4} className="px-4 py-3 text-right font-semibold text-foreground">
                            Grand Total:
                          </td>
                          <td className="px-4 py-3 text-right text-xl font-bold text-primary">
                            ${viewItem.totalValue.toFixed(2)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}

              {/* Quality Check Results */}
              {viewItem.qualityCheck && (
                <div className="border-t border-border pt-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Quality Check Results</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { key: "appearance", label: "Appearance & Freshness" },
                      { key: "quantity", label: "Quantity Verification" },
                      { key: "temperature", label: "Temperature Control" },
                      { key: "expiration", label: "Expiration Dates" },
                      { key: "packaging", label: "Packaging Integrity" },
                    ].map((criterion) => {
                      const result = viewItem.qualityCheck?.[criterion.key as keyof typeof viewItem.qualityCheck];
                      return (
                        <div key={criterion.key} className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                          <span className="text-sm text-foreground font-medium">{criterion.label}</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            result === "pass"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}>
                            {result === "pass" ? "✓ Pass" : "✗ Fail"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Notes */}
              <div className="border-t border-border pt-6">
                <h3 className="text-sm font-semibold text-foreground mb-2">Notes</h3>
                <div className="bg-muted/30 rounded-xl p-4">
                  <p className="text-sm text-foreground">{viewItem.notes}</p>
                </div>
              </div>

              {/* Close Button */}
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
