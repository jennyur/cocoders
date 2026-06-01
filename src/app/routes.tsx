import { createBrowserRouter, redirect } from "react-router";
import { Layout } from "./components/Layout";
import { Login } from "./components/Login";
import { Dashboard } from "./components/Dashboard";
import { Inventory } from "./components/Inventory";
import { AddProduct } from "./components/AddProduct";
import { Reports } from "./components/Reports";
import { PurchaseOrders } from "./components/PurchaseOrders";
import { GoodsReceived } from "./components/GoodsReceived";
import { UserManagement } from "./components/UserManagement";
import { CategoryDetail } from "./components/CategoryDetail";
import { CategorySelection } from "./components/CategorySelection";
import { StockControl } from "./components/StockControl";
import { RecipeBOM } from "./components/RecipeBOM";
import { Transfers } from "./components/Transfers";
import { MultiLocation } from "./components/MultiLocation";
import { ProductManagement } from "./components/ProductManagement";
import { POSKitchenOrders } from "./components/POSKitchenOrders";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Login,
  },
  {
    path: "/",
    Component: Layout,
    children: [
      { path: "dashboard", Component: Dashboard },
      { path: "inventory", Component: Inventory },
      { path: "add-product", Component: AddProduct },
      { path: "reports", Component: Reports },
      { path: "purchase-orders", Component: PurchaseOrders },
      { path: "goods-received", Component: GoodsReceived },
      { path: "pos-kitchen-orders", Component: POSKitchenOrders },
      { path: "stock-control", Component: StockControl },
      { path: "stock-alert", loader: () => redirect("/stock-control") },
      { path: "recipe-bom", Component: RecipeBOM },
      { path: "transfers", Component: Transfers },
      { path: "multi-location", Component: MultiLocation },
      { path: "product-management", Component: ProductManagement },
      { path: "users", Component: UserManagement },
      { path: "category", Component: CategoryDetail },
      { path: "category-selection", Component: CategorySelection },
    ],
  },
]);
