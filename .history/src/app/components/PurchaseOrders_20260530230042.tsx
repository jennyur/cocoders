import { useState, useEffect } from "react";
import { Plus, Search, Filter, Eye, Download, CheckCircle, Clock, XCircle, X, Save, Trash2, Edit, Building2, Users, AlertCircle, Check } from "lucide-react";
import { readLocalStorage, useLocalStorageState, writeLocalStorage } from "../lib/localStorage";

// Helper function to normalize product names (capitalize first letter of each word, trim)
const normalizeProductName = (name: string): string => {
  return name
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

// Check if product exists (case-insensitive)
const findProductByName = (name: string, allProducts: GlobalProduct[]): GlobalProduct | undefined => {
  const normalized = normalizeProductName(name);
  return allProducts.find(p => normalizeProductName(p.name) === normalized);
};

type OrderItem = {
  productName: string;
  quantity: number;
  unitPrice: number;
};

type Order = {
  id: string;
  supplier: string;
  date: string;
  items: number;
  orderItems: OrderItem[];
  total: number;
  status: string;
  expectedDelivery: string;
};

type GlobalProduct = {
  id: string;
  name: string;
  category?: string;
};

type SupplierProduct = {
  supplierId: string;
  productId: string;
  price: number;
};

type Product = {
  name: string;
  price: number;
};

type Supplier = {
  name: string;
  contact: string;
  email: string;
  phone: string;
  address: string;
  products: Product[];
};

type GoodsItem = {
  id: string;
  poId: string;
  supplier: string;
  receivedDate: string;
  items: number;
  receivedItems?: Array<OrderItem & { condition: string }>;
  totalValue: number;
  receivedBy: string;
  status: string;
  notes: string;
};

export function PurchaseOrders() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [showSuppliersListModal, setShowSuppliersListModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [userRole, setUserRole] = useState<string>("staff");

  // State for product suggestions and new product creation
  const [productSuggestions, setProductSuggestions] = useState<GlobalProduct[]>([]);
  const [showProductSuggestions, setShowProductSuggestions] = useState(false);
  const [showCreateProductModal, setShowCreateProductModal] = useState(false);
  const [newProductInput, setNewProductInput] = useState("");

  useEffect(() => {
    const role = localStorage.getItem("userRole") || "staff";
    setUserRole(role);
  }, []);

  const [newOrder, setNewOrder] = useState({
    supplier: "",
    expectedDelivery: "",
  });
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [currentItem, setCurrentItem] = useState({
    productName: "",
    quantity: "",
    unitPrice: "",
  });
  const [newSupplier, setNewSupplier] = useState({
    name: "",
    contact: "",
    email: "",
    phone: "",
    address: "",
  });

  // Global products storage
  const [globalProducts, setGlobalProducts] = useLocalStorageState<GlobalProduct[]>(
    "purchaseOrders.globalProducts",
    [
      { id: "gp-001", name: "Fresh Salmon Fillet", category: "Seafood" },
      { id: "gp-002", name: "Wild-Caught Tuna", category: "Seafood" },
      { id: "gp-003", name: "Jumbo Shrimp", category: "Seafood" },
      { id: "gp-004", name: "Lobster Tail", category: "Seafood" },
      { id: "gp-005", name: "Organic Chicken Breast", category: "Meat" },
      { id: "gp-006", name: "Grass-Fed Ground Beef", category: "Meat" },
      { id: "gp-007", name: "Romaine Lettuce", category: "Vegetables" },
      { id: "gp-008", name: "Carrots", category: "Vegetables" },
      { id: "gp-009", name: "Strawberries 1lb", category: "Fruits" },
      { id: "gp-010", name: "Blueberries 1lb", category: "Fruits" },
      { id: "gp-011", name: "Greek Yogurt 32oz", category: "Dairy" },
      { id: "gp-012", name: "Aged Cheddar Cheese", category: "Dairy" },
      { id: "gp-013", name: "Whole Milk 1gal", category: "Dairy" },
      { id: "gp-014", name: "Sourdough Bread", category: "Bakery" },
    ]
  );

  const [orders, setOrders] = useLocalStorageState<Order[]>("purchaseOrders.orders", [
    {
      id: "PO-2024-001",
      supplier: "Fresh Farms Co.",
      date: "2024-05-20",
      items: 3,
      orderItems: [
        { productName: "Fresh Salmon Fillet", quantity: 50, unitPrice: 24.99 },
        { productName: "Organic Chicken Breast", quantity: 40, unitPrice: 12.99 },
        { productName: "Strawberries 1lb", quantity: 30, unitPrice: 4.99 },
      ],
      total: 1919.10,
      status: "pending",
      expectedDelivery: "2024-05-27",
    },
    {
      id: "PO-2024-002",
      supplier: "Ocean Harvest",
      date: "2024-05-18",
      items: 2,
      orderItems: [
        { productName: "Wild-Caught Tuna", quantity: 60, unitPrice: 19.99 },
        { productName: "Jumbo Shrimp", quantity: 80, unitPrice: 18.99 },
      ],
      total: 2719.60,
      status: "approved",
      expectedDelivery: "2024-05-25",
    },
    {
      id: "PO-2024-003",
      supplier: "Local Dairy Inc.",
      date: "2024-05-15",
      items: 3,
      orderItems: [
        { productName: "Greek Yogurt 32oz", quantity: 100, unitPrice: 6.99 },
        { productName: "Aged Cheddar Cheese", quantity: 50, unitPrice: 8.99 },
        { productName: "Whole Milk 1gal", quantity: 80, unitPrice: 4.99 },
      ],
      total: 1598.70,
      status: "received",
      expectedDelivery: "2024-05-22",
    },
    {
      id: "PO-2024-004",
      supplier: "Organic Produce LLC",
      date: "2024-05-12",
      items: 4,
      orderItems: [
        { productName: "Romaine Lettuce", quantity: 100, unitPrice: 3.49 },
        { productName: "Carrots", quantity: 120, unitPrice: 2.49 },
        { productName: "Blueberries 1lb", quantity: 60, unitPrice: 6.99 },
        { productName: "Strawberries 1lb", quantity: 80, unitPrice: 4.99 },
      ],
      total: 1466.60,
      status: "received",
      expectedDelivery: "2024-05-19",
    },
    {
      id: "PO-2024-005",
      supplier: "Fresh Farms Co.",
      date: "2024-05-10",
      items: 1,
      orderItems: [
        { productName: "Sourdough Bread", quantity: 50, unitPrice: 5.99 },
      ],
      total: 299.50,
      status: "cancelled",
      expectedDelivery: "2024-05-17",
    },
  ]);

  const statuses = ["all", "pending", "approved", "received", "partial", "rejected", "cancelled"];

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.supplier.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
      approved: "bg-blue-100 text-blue-700 border-blue-200",
      received: "bg-green-100 text-green-700 border-green-200",
      partial: "bg-orange-100 text-orange-700 border-orange-200",
      rejected: "bg-red-100 text-red-700 border-red-200",
      cancelled: "bg-red-100 text-red-700 border-red-200",
    };
    const icons = {
      pending: Clock,
      approved: CheckCircle,
      received: CheckCircle,
      partial: AlertCircle,
      rejected: XCircle,
      cancelled: XCircle,
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
    { label: "Total Orders", value: orders.length, color: "text-blue-600" },
    { label: "Pending", value: orders.filter(o => o.status === "pending").length, color: "text-yellow-600" },
    { label: "Approved", value: orders.filter(o => o.status === "approved").length, color: "text-blue-600" },
    { label: "Received", value: orders.filter(o => o.status === "received").length, color: "text-green-600" },
  ];

  const [suppliers, setSuppliers] = useLocalStorageState<Supplier[]>("purchaseOrders.suppliers", [
    {
      name: "Fresh Farms Co.",
      contact: "John Smith",
      email: "john@freshfarms.com",
      phone: "+1 234 567 8900",
      address: "123 Farm Road, Green Valley, CA 94532",
      products: [
        { name: "Organic Chicken Breast", price: 12.99 },
        { name: "Strawberries 1lb", price: 4.99 },
        { name: "Romaine Lettuce", price: 3.49 },
        { name: "Grass-Fed Ground Beef", price: 9.99 },
        { name: "Sourdough Bread", price: 5.99 },
        { name: "Whole Milk 1gal", price: 4.99 },
        { name: "Carrots", price: 2.49 },
        { name: "Blueberries 1lb", price: 6.99 },
      ]
    },
    {
      name: "Ocean Harvest",
      contact: "Maria Garcia",
      email: "maria@oceanharvest.com",
      phone: "+1 234 567 8901",
      address: "456 Harbor Blvd, Seaside, CA 94567",
      products: [
        { name: "Fresh Salmon Fillet", price: 24.99 },
        { name: "Wild-Caught Tuna", price: 19.99 },
        { name: "Jumbo Shrimp", price: 18.99 },
        { name: "Lobster Tail", price: 32.99 },
      ]
    },
    {
      name: "Local Dairy Inc.",
      contact: "Robert Johnson",
      email: "robert@localdairy.com",
      phone: "+1 234 567 8902",
      address: "789 Dairy Lane, Farmville, CA 94589",
      products: [
        { name: "Greek Yogurt 32oz", price: 6.99 },
        { name: "Aged Cheddar Cheese", price: 8.99 },
        { name: "Whole Milk 1gal", price: 4.99 },
        { name: "Butter Unsalted 1lb", price: 5.49 },
        { name: "Heavy Cream 1qt", price: 4.29 },
      ]
    },
    {
      name: "Organic Produce LLC",
      contact: "Sarah Williams",
      email: "sarah@organicproduce.com",
      phone: "+1 234 567 8903",
      address: "321 Organic Ave, Fresh Town, CA 94512",
      products: [
        { name: "Romaine Lettuce", price: 3.49 },
        { name: "Carrots", price: 2.49 },
        { name: "Blueberries 1lb", price: 6.99 },
        { name: "Strawberries 1lb", price: 4.99 },
        { name: "Spinach Organic", price: 3.99 },
        { name: "Tomatoes Organic", price: 4.49 },
      ]
    },
  ]);

  // Get available products from selected supplier
  const availableProducts = newOrder.supplier
    ? suppliers.find(s => s.name === newOrder.supplier)?.products || []
    : [];

  // Handle product name input change - show suggestions
  const handleProductNameChange = (value: string) => {
    setNewProductInput(value);
    setCurrentItem({
      ...currentItem,
      productName: value,
    });

    // Filter and show suggestions
    if (value.trim().length > 0) {
      const normalized = value.toLowerCase();
      const suggestions = globalProducts.filter(p =>
        normalizeProductName(p.name).toLowerCase().includes(normalized)
      );
      setProductSuggestions(suggestions);
      setShowProductSuggestions(true);
    } else {
      setShowProductSuggestions(false);
    }
  };

  // Handle selecting a product from suggestions
  const handleSelectProduct = (product: GlobalProduct) => {
    const matchingSupplierProduct = availableProducts.find(
      p => normalizeProductName(p.name) === normalizeProductName(product.name)
    );

    setCurrentItem({
      productName: product.name,
      quantity: currentItem.quantity,
      unitPrice: matchingSupplierProduct ? matchingSupplierProduct.price.toString() : "",
    });
    setNewProductInput(product.name);
    setShowProductSuggestions(false);
  };

  // Create new product and link to supplier
  const handleCreateNewProduct = () => {
    const normalized = normalizeProductName(newProductInput);
    
    // Check if product already exists (case-insensitive)
    const existingProduct = findProductByName(newProductInput, globalProducts);
    if (existingProduct) {
      handleSelectProduct(existingProduct);
      setShowCreateProductModal(false);
      return;
    }

    // Create new product with auto-capitalized name
    const productId = `gp-${Date.now()}`;
    const newProduct: GlobalProduct = {
      id: productId,
      name: normalized,
      category: "Other",
    };

    // Add to global products
    setGlobalProducts([...globalProducts, newProduct]);

    // Link product to current supplier
    if (newOrder.supplier) {
      const supplier = suppliers.find(s => s.name === newOrder.supplier);
      if (supplier) {
        const updatedSupplier = {
          ...supplier,
          products: [
            ...supplier.products,
            { name: normalized, price: 0 }, // Default price, user can adjust
          ],
        };
        setSuppliers(suppliers.map(s => s.name === newOrder.supplier ? updatedSupplier : s));
      }
    }

    // Select the newly created product
    handleSelectProduct(newProduct);
    setShowCreateProductModal(false);
    setNewProductInput("");
  };

  // Update price when user manually enters it
  const handlePriceInput = (value: string) => {
    setCurrentItem({
      ...currentItem,
      unitPrice: value,
    });
  };

  const handleAddItem = () => {
    if (currentItem.productName && currentItem.quantity && currentItem.unitPrice) {
      const newItem: OrderItem = {
        productName: normalizeProductName(currentItem.productName),
        quantity: parseInt(currentItem.quantity),
        unitPrice: parseFloat(currentItem.unitPrice),
      };
      setOrderItems([...orderItems, newItem]);
      setCurrentItem({ productName: "", quantity: "", unitPrice: "" });
      setNewProductInput("");
      setProductSuggestions([]);
    }
  };

  const handleRemoveItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const handleProductChange = (productName: string) => {
    const product = availableProducts.find(p => p.name === productName);
    if (product) {
      setCurrentItem({
        productName: product.name,
        quantity: currentItem.quantity,
        unitPrice: product.price.toString(),
      });
    }
  };

  const calculateTotal = () => {
    return orderItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();

    if (orderItems.length === 0) {
      alert("Please add at least one item to the order");
      return;
    }

    const orderNumber = orders.length + 1;
    const newOrderId = `PO-2024-${String(orderNumber).padStart(3, '0')}`;

    const orderToAdd: Order = {
      id: newOrderId,
      supplier: newOrder.supplier,
      date: new Date().toISOString().split('T')[0],
      items: orderItems.length,
      orderItems: orderItems,
      total: calculateTotal(),
      status: "pending",
      expectedDelivery: newOrder.expectedDelivery,
    };

    setOrders([orderToAdd, ...orders]);
    setShowCreateModal(false);
    setNewOrder({ supplier: "", expectedDelivery: "" });
    setOrderItems([]);
    setCurrentItem({ productName: "", quantity: "", unitPrice: "" });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // If supplier is being changed, clear the order items and current item
    if (name === "supplier" && value !== newOrder.supplier) {
      setOrderItems([]);
      setCurrentItem({ productName: "", quantity: "", unitPrice: "" });
    }

    setNewOrder({
      ...newOrder,
      [name]: value,
    });
  };

  const handleItemInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "productName") {
      handleProductNameChange(value);
    } else if (name === "unitPrice") {
      handlePriceInput(value);
    } else {
      setCurrentItem({
        ...currentItem,
        [name]: value,
      });
    }
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowViewModal(true);
  };

  const handleDownload = (order: Order) => {
    // Generate CSV content
    let csvContent = "Purchase Order Details\n\n";
    csvContent += `Order ID:,${order.id}\n`;
    csvContent += `Supplier:,${order.supplier}\n`;
    csvContent += `Order Date:,${order.date}\n`;
    csvContent += `Expected Delivery:,${order.expectedDelivery}\n`;
    csvContent += `Status:,${order.status}\n\n`;
    csvContent += "Items:\n";
    csvContent += "Product Name,Quantity,Unit Price,Total\n";

    order.orderItems.forEach(item => {
      const itemTotal = item.quantity * item.unitPrice;
      csvContent += `${item.productName},${item.quantity},${item.unitPrice.toFixed(2)},${itemTotal.toFixed(2)}\n`;
    });

    csvContent += `\nTotal Order Value:,₱${order.total.toFixed(2)}\n`;

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${order.id}_PurchaseOrder.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const createGoodsReceivedRecord = (order: Order) => {
    const goodsRecords = readLocalStorage<GoodsItem[]>("goodsReceived.records", []);
    const alreadyExists = goodsRecords.some(record => record.poId === order.id);

    if (alreadyExists) return;

    const nextNumber = goodsRecords.length + 1;
    const goodsRecord: GoodsItem = {
      id: `GR-${new Date().getFullYear()}-${String(nextNumber).padStart(3, "0")}`,
      poId: order.id,
      supplier: order.supplier,
      receivedDate: order.expectedDelivery || new Date().toISOString().split("T")[0],
      items: order.items,
      receivedItems: order.orderItems.map(item => ({ ...item, condition: "Pending Check" })),
      totalValue: order.total,
      receivedBy: "Receiving Team",
      status: "pending",
      notes: "Approved PO. Awaiting goods receipt and quality check.",
    };

    writeLocalStorage("goodsReceived.records", [goodsRecord, ...goodsRecords]);
  };

  const handleApproveOrder = (order: Order) => {
    const approvedOrder = { ...order, status: "approved" };
    setOrders(orders.map(currentOrder => currentOrder.id === order.id ? approvedOrder : currentOrder));
    createGoodsReceivedRecord(approvedOrder);
  };

  const handleCancelOrder = (orderId: string) => {
    setOrders(orders.map(order => order.id === orderId ? { ...order, status: "cancelled" } : order));
  };

  const handleEditOrder = (order: Order) => {
    setEditingOrder(order);
    setNewOrder({
      supplier: order.supplier,
      expectedDelivery: order.expectedDelivery,
    });
    setOrderItems([...order.orderItems]);
    setShowEditModal(true);
  };

  const handleUpdateOrder = (e: React.FormEvent) => {
    e.preventDefault();

    if (orderItems.length === 0) {
      alert("Please add at least one item to the order");
      return;
    }

    if (!editingOrder) return;

    const updatedOrder: Order = {
      ...editingOrder,
      supplier: newOrder.supplier,
      expectedDelivery: newOrder.expectedDelivery,
      items: orderItems.length,
      orderItems: orderItems,
      total: calculateTotal(),
    };

    setOrders(orders.map(order =>
      order.id === editingOrder.id ? updatedOrder : order
    ));

    setShowEditModal(false);
    setEditingOrder(null);
    setNewOrder({ supplier: "", expectedDelivery: "" });
    setOrderItems([]);
    setCurrentItem({ productName: "", quantity: "", unitPrice: "" });
  };

  const handleAddSupplier = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newSupplier.name.trim()) {
      alert("Please enter supplier name");
      return;
    }

    const supplierToAdd: Supplier = {
      name: newSupplier.name.trim(),
      contact: newSupplier.contact.trim(),
      email: newSupplier.email.trim(),
      phone: newSupplier.phone.trim(),
      address: newSupplier.address.trim(),
      products: [], // New suppliers start with no products
    };

    setSuppliers([...suppliers, supplierToAdd]);
    setNewOrder({ ...newOrder, supplier: supplierToAdd.name });
    setNewSupplier({
      name: "",
      contact: "",
      email: "",
      phone: "",
      address: "",
    });
    setShowSupplierModal(false);
  };

  const handleSupplierInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setNewSupplier({
      ...newSupplier,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-bold text-foreground mb-2">Purchase Orders</h1>
          <p className="text-muted-foreground text-sm hidden">Manage and track all purchase orders</p>
        </div>
        <div className="flex gap-3 mt-4 md:mt-0">
          <button
            onClick={() => setShowSuppliersListModal(true)}
            className="px-6 py-3 bg-muted text-foreground rounded-2xl hover:bg-muted/80 transition-all duration-200 flex items-center gap-2 border border-border"
          >
            <Users className="w-5 h-5" />
            View Suppliers
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-2xl hover:shadow-lg hover:shadow-primary/30 transition-all duration-200 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create New Order
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-card rounded-2xl p-2 shadow-sm border border-border">
            <p className="text-muted-foreground text-sm mb-6">{stat.label}</p>
            <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Search and Filter */}
      <div className="bg-card rounded-2xl p-2 shadow-sm border border-border mb-8">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by order ID or supplier..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-7 pr-2 py-1 bg-input-background border border-input rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-12 pr-8 py-3 bg-input-background border border-input rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all appearance-none cursor-pointer min-w-[200px]"
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status === "all" ? "All Status" : status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-foreground">Order ID</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-foreground">Supplier</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-foreground">Date</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-foreground">Items</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-foreground">Total</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-foreground">Expected Delivery</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-foreground">Status</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-medium text-primary">{order.id}</span>
                  </td>
                  <td className="px-6 py-4 text-foreground">{order.supplier}</td>
                  <td className="px-6 py-4 text-muted-foreground">{order.date}</td>
                  <td className="px-6 py-4 text-foreground">{order.items}</td>
                  <td className="px-6 py-4 text-foreground font-medium">₱{order.total.toLocaleString()}</td>
                  <td className="px-6 py-4 text-muted-foreground">{order.expectedDelivery}</td>
                  <td className="px-6 py-4">{getStatusBadge(order.status)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewDetails(order)}
                        className="p-6 hover:bg-blue-50 text-blue-600 rounded-2xl transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditOrder(order)}
                        className={`p-6 rounded-2xl transition-colors ${
                          order.status === "received" || order.status === "cancelled"
                            ? "text-muted-foreground cursor-not-allowed opacity-50"
                            : "hover:bg-orange-50 text-orange-600"
                        }`}
                        title={order.status === "received" || order.status === "cancelled" ? "Cannot edit received or cancelled orders" : "Edit Order"}
                        disabled={order.status === "received" || order.status === "cancelled"}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDownload(order)}
                        className="p-6 hover:bg-green-50 text-green-600 rounded-2xl transition-colors"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      {order.status === "pending" && userRole === "admin" && (
                        <button
                          onClick={() => handleApproveOrder(order)}
                          className="p-6 hover:bg-green-50 text-green-600 rounded-2xl transition-colors"
                          title="Approve and create GRN"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      {order.status === "pending" && (
                        <button
                          onClick={() => handleCancelOrder(order.id)}
                          className="p-6 hover:bg-red-50 text-red-600 rounded-2xl transition-colors"
                          title="Cancel Order"
                        >
                          <XCircle className="w-4 h-4" />
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

      {/* Create Order Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowCreateModal(false)}>
          <div className="bg-card rounded-2xl shadow-xl border border-border w-full max-w-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">Create New Order</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-muted rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-4 max-h-[70vh] overflow-y-auto">
              {userRole === "staff" && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-amber-900 mb-1">Admin Approval Required</p>
                      <p className="text-xs text-amber-800">
                        Purchase orders you create will be submitted for admin approval before processing.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="supplier" className="block text-sm mb-2 text-foreground">
                  Supplier *
                </label>
                <select
                  id="supplier"
                  name="supplier"
                  value={newOrder.supplier}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 text-sm bg-input-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all appearance-none cursor-pointer"
                  required
                >
                  <option value="">Select supplier</option>
                  {suppliers.map((sup) => (
                    <option key={sup.name} value={sup.name}>
                      {sup.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="expectedDelivery" className="block text-sm mb-2 text-foreground">
                  Expected Delivery Date *
                </label>
                <input
                  id="expectedDelivery"
                  name="expectedDelivery"
                  type="date"
                  value={newOrder.expectedDelivery}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 text-sm bg-input-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  required
                />
              </div>

              <div className="border-t border-border pt-4">
                <h3 className="text-sm font-semibold text-foreground mb-3">Add Items</h3>

                <div className="space-y-3">
                  <div>
                    <label htmlFor="productName" className="block text-xs mb-1 text-foreground">
                      Product
                    </label>
                    <div className="relative">
                      <input
                        id="productName"
                        name="productName"
                        type="text"
                        value={currentItem.productName}
                        onChange={handleItemInputChange}
                        placeholder={!newOrder.supplier ? "Please select a supplier first" : "Type or search product..."}
                        disabled={!newOrder.supplier}
                        className="w-full px-3 py-2 text-sm bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      
                      {/* Product Suggestions Dropdown */}
                      {showProductSuggestions && productSuggestions.length > 0 && newOrder.supplier && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 max-h-40 overflow-y-auto">
                          {productSuggestions.map((product) => (
                            <button
                              key={product.id}
                              type="button"
                              onClick={() => handleSelectProduct(product)}
                              className="w-full px-3 py-2 text-left hover:bg-muted/50 text-sm text-foreground flex items-center justify-between border-b border-border last:border-b-0"
                            >
                              <span>{product.name}</span>
                              <Check className="w-4 h-4 text-green-600" />
                            </button>
                          ))}
                        </div>
                      )}

                      {/* No results - offer to create new product */}
                      {showProductSuggestions && productSuggestions.length === 0 && newOrder.supplier && currentItem.productName.trim().length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50">
                          <button
                            type="button"
                            onClick={() => setShowCreateProductModal(true)}
                            className="w-full px-3 py-2 text-left hover:bg-muted/50 text-sm text-primary flex items-center gap-2 border-b border-border"
                          >
                            <Plus className="w-4 h-4" />
                            Create "{currentItem.productName}"
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="quantity" className="block text-xs mb-1 text-foreground">
                        Quantity
                      </label>
                      <input
                        id="quantity"
                        name="quantity"
                        type="number"
                        value={currentItem.quantity}
                        onChange={handleItemInputChange}
                        placeholder="0"
                        className="w-full px-3 py-2 text-sm bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                      />
                    </div>

                    <div>
                      <label htmlFor="unitPrice" className="block text-xs mb-1 text-foreground">
                        Unit Price (₱) <span className="text-muted-foreground font-normal">(adjustable)</span>
                      </label>
                      <input
                        id="unitPrice"
                        name="unitPrice"
                        type="number"
                        step="0.01"
                        value={currentItem.unitPrice}
                        onChange={handleItemInputChange}
                        placeholder="0.00"
                        className="w-full px-3 py-2 text-sm bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Item
                  </button>
                </div>
              </div>

              {orderItems.length > 0 && (
                <div className="border-t border-border pt-4">
                  <h3 className="text-sm font-semibold text-foreground mb-3">Order Items ({orderItems.length})</h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {orderItems.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">{item.productName}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.quantity} × ₱{item.unitPrice.toFixed(2)} = ₱{(item.quantity * item.unitPrice).toFixed(2)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="p-1 hover:bg-red-100 text-red-600 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-border">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-foreground">Total:</span>
                      <span className="text-lg font-bold text-primary">₱{calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-border">
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Save Order
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setOrderItems([]);
                    setCurrentItem({ productName: "", quantity: "", unitPrice: "" });
                  }}
                  className="flex-1 px-4 py-3 bg-muted text-foreground rounded-xl hover:bg-muted/80 transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Order Details Modal */}
      {showViewModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowViewModal(false)}>
          <div className="bg-card rounded-2xl shadow-xl border border-border w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-card p-6 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Purchase Order Details</h2>
                <p className="text-sm text-muted-foreground mt-1">{selectedOrder.id}</p>
              </div>
              <button
                onClick={() => setShowViewModal(false)}
                className="p-2 hover:bg-muted rounded-xl transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Order Information */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Supplier</p>
                    <p className="text-lg font-semibold text-foreground">{selectedOrder.supplier}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Order Date</p>
                    <p className="text-foreground">{selectedOrder.date}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Expected Delivery</p>
                    <p className="text-foreground">{selectedOrder.expectedDelivery}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Status</p>
                    {getStatusBadge(selectedOrder.status)}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Items</p>
                    <p className="text-foreground">{selectedOrder.items} items</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Value</p>
                    <p className="text-2xl font-bold text-primary">₱{selectedOrder.total.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Order Items Table */}
              <div className="border-t border-border pt-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Order Items</h3>
                <div className="bg-muted/30 rounded-xl overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted/50 border-b border-border">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Product Name</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-foreground">Quantity</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-foreground">Unit Price</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-foreground">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {selectedOrder.orderItems.map((item, index) => (
                        <tr key={index} className="hover:bg-muted/20">
                          <td className="px-4 py-3 text-foreground">{item.productName}</td>
                          <td className="px-4 py-3 text-right text-foreground">{item.quantity}</td>
                          <td className="px-4 py-3 text-right text-foreground">₱{item.unitPrice.toFixed(2)}</td>
                          <td className="px-4 py-3 text-right font-medium text-foreground">
                            ₱{(item.quantity * item.unitPrice).toFixed(2)}
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
                          ₱{selectedOrder.total.toFixed(2)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-border">
                <button
                  onClick={() => handleDownload(selectedOrder)}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Download Order
                </button>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-6 py-3 bg-muted text-foreground rounded-xl hover:bg-muted/80 transition-all duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Order Modal */}
      {showEditModal && editingOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowEditModal(false)}>
          <div className="bg-card rounded-2xl shadow-xl border border-border w-full max-w-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-foreground">Edit Purchase Order</h2>
                <p className="text-sm text-muted-foreground mt-1">{editingOrder.id}</p>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-muted rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateOrder} className="space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label htmlFor="edit-supplier" className="block text-sm mb-2 text-foreground">
                  Supplier *
                </label>
                <select
                  id="edit-supplier"
                  name="supplier"
                  value={newOrder.supplier}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 text-sm bg-input-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all appearance-none cursor-pointer"
                  required
                >
                  <option value="">Select supplier</option>
                  {suppliers.map((sup) => (
                    <option key={sup.name} value={sup.name}>
                      {sup.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="edit-expectedDelivery" className="block text-sm mb-2 text-foreground">
                  Expected Delivery Date *
                </label>
                <input
                  id="edit-expectedDelivery"
                  name="expectedDelivery"
                  type="date"
                  value={newOrder.expectedDelivery}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 text-sm bg-input-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  required
                />
              </div>

              <div className="border-t border-border pt-4">
                <h3 className="text-sm font-semibold text-foreground mb-3">Add Items</h3>

                <div className="space-y-3">
                  <div>
                    <label htmlFor="edit-productName" className="block text-xs mb-1 text-foreground">
                      Product
                    </label>
                    <div className="relative">
                      <input
                        id="edit-productName"
                        name="productName"
                        type="text"
                        value={currentItem.productName}
                        onChange={handleItemInputChange}
                        placeholder={!newOrder.supplier ? "Please select a supplier first" : "Type or search product..."}
                        disabled={!newOrder.supplier}
                        className="w-full px-3 py-2 text-sm bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      
                      {/* Product Suggestions Dropdown */}
                      {showProductSuggestions && productSuggestions.length > 0 && newOrder.supplier && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 max-h-40 overflow-y-auto">
                          {productSuggestions.map((product) => (
                            <button
                              key={product.id}
                              type="button"
                              onClick={() => handleSelectProduct(product)}
                              className="w-full px-3 py-2 text-left hover:bg-muted/50 text-sm text-foreground flex items-center justify-between border-b border-border last:border-b-0"
                            >
                              <span>{product.name}</span>
                              <Check className="w-4 h-4 text-green-600" />
                            </button>
                          ))}
                        </div>
                      )}

                      {/* No results - offer to create new product */}
                      {showProductSuggestions && productSuggestions.length === 0 && newOrder.supplier && currentItem.productName.trim().length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50">
                          <button
                            type="button"
                            onClick={() => setShowCreateProductModal(true)}
                            className="w-full px-3 py-2 text-left hover:bg-muted/50 text-sm text-primary flex items-center gap-2 border-b border-border"
                          >
                            <Plus className="w-4 h-4" />
                            Create "{currentItem.productName}"
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="edit-quantity" className="block text-xs mb-1 text-foreground">
                        Quantity
                      </label>
                      <input
                        id="edit-quantity"
                        name="quantity"
                        type="number"
                        value={currentItem.quantity}
                        onChange={handleItemInputChange}
                        placeholder="0"
                        className="w-full px-3 py-2 text-sm bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                      />
                    </div>

                    <div>
                      <label htmlFor="edit-unitPrice" className="block text-xs mb-1 text-foreground">
                        Unit Price (₱) <span className="text-muted-foreground font-normal">(adjustable)</span>
                      </label>
                      <input
                        id="edit-unitPrice"
                        name="unitPrice"
                        type="number"
                        step="0.01"
                        value={currentItem.unitPrice}
                        onChange={handleItemInputChange}
                        placeholder="0.00"
                        className="w-full px-3 py-2 text-sm bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Item
                  </button>
                </div>
              </div>

              {orderItems.length > 0 && (
                <div className="border-t border-border pt-4">
                  <h3 className="text-sm font-semibold text-foreground mb-3">Order Items ({orderItems.length})</h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {orderItems.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">{item.productName}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.quantity} × ₱{item.unitPrice.toFixed(2)} = ₱{(item.quantity * item.unitPrice).toFixed(2)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="p-1 hover:bg-red-100 text-red-600 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-border">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-foreground">Total:</span>
                      <span className="text-lg font-bold text-primary">₱{calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-border">
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Update Order
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingOrder(null);
                    setOrderItems([]);
                    setCurrentItem({ productName: "", quantity: "", unitPrice: "" });
                  }}
                  className="flex-1 px-4 py-3 bg-muted text-foreground rounded-xl hover:bg-muted/80 transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create New Product Modal */}
      {showCreateProductModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4" onClick={() => setShowCreateProductModal(false)}>
          <div className="bg-card rounded-xl shadow-xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-border flex items-center justify-between sticky top-0 bg-card">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Plus className="w-5 h-5 text-primary" />
                Create New Product
              </h2>
              <button
                onClick={() => setShowCreateProductModal(false)}
                className="p-2 hover:bg-muted rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleCreateNewProduct(); }} className="p-4 space-y-4">
              <div>
                <label htmlFor="newProductName" className="block text-sm mb-2 text-foreground font-medium">
                  Product Name
                </label>
                <input
                  id="newProductName"
                  type="text"
                  value={currentItem.productName}
                  onChange={(e) => setCurrentItem({ ...currentItem, productName: e.target.value })}
                  placeholder="e.g., Fresh Tomatoes, Premium Coffee"
                  className="w-full px-3 py-2 text-sm bg-input-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  💡 Tip: The product name will be automatically formatted with proper capitalization
                </p>
              </div>

              <div>
                <label htmlFor="newProductCategory" className="block text-sm mb-2 text-foreground font-medium">
                  Category (Optional)
                </label>
                <select
                  id="newProductCategory"
                  className="w-full px-3 py-2 text-sm bg-input-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all appearance-none cursor-pointer"
                >
                  <option value="">Select category</option>
                  <option value="Fruits">Fruits</option>
                  <option value="Vegetables">Vegetables</option>
                  <option value="Meat">Meat</option>
                  <option value="Seafood">Seafood</option>
                  <option value="Dairy">Dairy</option>
                  <option value="Bakery">Bakery</option>
                  <option value="Oils & Condiments">Oils & Condiments</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-900">
                  <strong>Note:</strong> This product will be{" "}
                  <strong>automatically added to {newOrder.supplier}</strong>'s product list with a default price of ₱0.
                  You can adjust the price above.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white text-sm rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Create Product
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateProductModal(false);
                    setCurrentItem({ ...currentItem, productName: "" });
                  }}
                  className="flex-1 px-4 py-2 bg-muted text-foreground text-sm rounded-xl hover:bg-muted/80 transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Supplier Modal */}
      {showSupplierModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowSupplierModal(false)}>
          <div className="bg-card rounded-xl shadow-xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-border flex items-center justify-between sticky top-0 bg-card">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                Add New Supplier
              </h2>
              <button
                onClick={() => setShowSupplierModal(false)}
                className="p-2 hover:bg-muted rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSupplier} className="p-4 space-y-3 max-h-[70vh] overflow-y-auto">
              <div>
                <label htmlFor="supplierName" className="block text-sm mb-1 text-foreground font-medium">
                  Supplier Name *
                </label>
                <input
                  id="supplierName"
                  name="name"
                  type="text"
                  value={newSupplier.name}
                  onChange={handleSupplierInputChange}
                  placeholder="e.g., Fresh Farms Co."
                  className="w-full px-3 py-2 text-sm bg-input-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  required
                />
              </div>

              <div>
                <label htmlFor="supplierContact" className="block text-sm mb-1 text-foreground font-medium">
                  Contact Person
                </label>
                <input
                  id="supplierContact"
                  name="contact"
                  type="text"
                  value={newSupplier.contact}
                  onChange={handleSupplierInputChange}
                  placeholder="e.g., John Doe"
                  className="w-full px-3 py-2 text-sm bg-input-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
              </div>

              <div>
                <label htmlFor="supplierEmail" className="block text-sm mb-1 text-foreground font-medium">
                  Email
                </label>
                <input
                  id="supplierEmail"
                  name="email"
                  type="email"
                  value={newSupplier.email}
                  onChange={handleSupplierInputChange}
                  placeholder="e.g., contact@supplier.com"
                  className="w-full px-3 py-2 text-sm bg-input-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
              </div>

              <div>
                <label htmlFor="supplierPhone" className="block text-sm mb-1 text-foreground font-medium">
                  Phone
                </label>
                <input
                  id="supplierPhone"
                  name="phone"
                  type="tel"
                  value={newSupplier.phone}
                  onChange={handleSupplierInputChange}
                  placeholder="e.g., +1 234 567 8900"
                  className="w-full px-3 py-2 text-sm bg-input-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
              </div>

              <div>
                <label htmlFor="supplierAddress" className="block text-sm mb-1 text-foreground font-medium">
                  Address
                </label>
                <textarea
                  id="supplierAddress"
                  name="address"
                  value={newSupplier.address}
                  onChange={handleSupplierInputChange}
                  placeholder="e.g., 123 Farm Road, City, State, ZIP"
                  className="w-full px-3 py-2 text-sm bg-input-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white text-sm rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Add Supplier
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowSupplierModal(false);
                    setNewSupplier({
                      name: "",
                      contact: "",
                      email: "",
                      phone: "",
                      address: "",
                    });
                  }}
                  className="flex-1 px-4 py-2 bg-muted text-foreground text-sm rounded-xl hover:bg-muted/80 transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Suppliers Modal */}
      {showSuppliersListModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowSuppliersListModal(false)}>
          <div className="bg-card rounded-2xl shadow-xl border border-border w-full max-w-5xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-card p-6 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
                  <Users className="w-7 h-7 text-primary" />
                  Suppliers Directory
                </h2>
                <p className="text-sm text-muted-foreground mt-1">All registered suppliers ({suppliers.length})</p>
              </div>
              <button
                onClick={() => setShowSuppliersListModal(false)}
                className="p-2 hover:bg-muted rounded-xl transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {suppliers.length > 0 ? (
                <div className="bg-muted/30 rounded-xl overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted/50 border-b border-border">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Supplier Name</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Contact Person</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Email</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Phone</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Address</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {suppliers.map((supplier, index) => (
                        <tr key={index} className="hover:bg-muted/20">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center text-white font-bold text-sm">
                                {supplier.name.charAt(0)}
                              </div>
                              <span className="font-semibold text-foreground">{supplier.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-foreground">{supplier.contact || "N/A"}</td>
                          <td className="px-4 py-3 text-foreground">
                            {supplier.email ? (
                              <a href={`mailto:${supplier.email}`} className="text-primary hover:underline">
                                {supplier.email}
                              </a>
                            ) : (
                              "N/A"
                            )}
                          </td>
                          <td className="px-4 py-3 text-foreground">
                            {supplier.phone ? (
                              <a href={`tel:${supplier.phone}`} className="text-primary hover:underline">
                                {supplier.phone}
                              </a>
                            ) : (
                              "N/A"
                            )}
                          </td>
                          <td className="px-4 py-3 text-foreground text-sm">{supplier.address || "N/A"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">No suppliers registered yet</p>
                </div>
              )}

              <div className="flex gap-3 pt-6 border-t border-border mt-6">
                <button
                  onClick={() => {
                    setShowSuppliersListModal(false);
                    setShowSupplierModal(true);
                  }}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add New Supplier
                </button>
                <button
                  onClick={() => setShowSuppliersListModal(false)}
                  className="px-6 py-3 bg-muted text-foreground rounded-xl hover:bg-muted/80 transition-all duration-200"
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
