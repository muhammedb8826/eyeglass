import { Navigate, Route, Routes } from "react-router-dom";
import "./assets/styles/main.css";
import NotFound from "./components/header/NotFound";
import DefaultLayout from "./layout/DefaultLayout";
import ECommerce from "./pages/Dashboard/ECommerce";
import SignIn from "./pages/Authentication/SignIn";
import OrdersList from "./components/order/OrdersList";
import User from "./components/user/User";
import { Items } from "./pages/inventory/Items";
import { Vendors } from "./pages/inventory/Vendors";
import { Machines } from "./pages/inventory/Machines";
import { LabTools } from "./pages/inventory/LabTools";
import { Boms } from "./pages/inventory/Boms";
import { Purschase } from "./pages/inventory/Purschase";
import { OrderRegistration } from "./components/order/OrderRegistration";
import { PurchaseRegistration } from "./pages/inventory/PurchaseRegistration";
import { Stock } from "./pages/inventory/Stock";
import { StoreRequest } from "./pages/inventory/StoreRequest";
import { StoreRequestRegistration } from "./pages/inventory/StoreRequestRegistration";
import { CommissionList } from "./components/commission/CommissionList";
import { CustomerList } from "./components/customer/CustomerList";
import { Notifications } from "./components/header/Notifications";
import { StoreRequestDetails } from "./pages/inventory/StoreRequestDetails";
import { PurchaseDetails } from "./pages/inventory/PurchaseDetails";
import { ServicesList } from "./pages/inventory/ServicesList";
import Profile from "./pages/Profile";
import AccountSettings from "./pages/AccountSettings";
import { OperatorStock } from "./pages/inventory/OperatorStock";
import { PurchaseNotifications } from "./components/header/PurchaseNotifications";
import { StoreRequestNotifications } from "./components/header/StoreRequestNotifications";
import RequireAuth from "./components/RequireAuth";
import UserRegistration from "./components/user/UserRegistration";
import UpdateUser from "./components/user/UpdateUser";
import AssignUserMachine from "./components/setting/AssignUserMachine";
import UnitCategory from "./components/setting/UnitCategory";
import UnitOfMeasurements from "./components/setting/UnitOfMeasurements";
import { ItemRegistration } from "./pages/inventory/ItemRegistration";
import { ItemEdit } from "./pages/inventory/ItemEdit";
import { SalesPartnerList } from "./components/commission/SalesPartnerList";
import { OrderDetailsPage } from "./components/order/OrderDetailsPage";
import { Pricings } from "./components/setting/Pricings";
import { Discounts } from "./components/setting/Discounts";
import { CommissionDetails } from "./components/commission/CommissionDetails";
import { Reports } from "./components/reports/Reports";
import { OrdersReport } from "./components/reports/OrdersReport";
import { PurchasesReport } from "./components/reports/PurchasesReport";
import { StoreRequestsReport } from "./components/reports/StoreRequestsReport";
import FixedCost from "./components/setting/FixedCost";
import InAppNotifications from "./pages/InAppNotifications";
import RequirePermission from "./components/RequirePermission";
import {
  PERMISSION_BINCARD_READ,
  PERMISSION_BOM_READ,
  PERMISSION_CUSTOMERS_READ,
  PERMISSION_FINANCE_READ,
  PERMISSION_ITEMS_READ,
  PERMISSION_ITEMS_WRITE,
  PERMISSION_LAB_TOOL_READ,
  PERMISSION_MASTER_READ,
  PERMISSION_ORDERS_READ,
  PERMISSION_ORDERS_WRITE,
  PERMISSION_PERMISSIONS_MANAGE,
  PERMISSION_PRICING_READ,
  PERMISSION_PURCHASES_READ,
  PERMISSION_PURCHASES_WRITE,
  PERMISSION_SALES_READ,
  PERMISSION_SALES_WRITE,
  PERMISSION_STOCK_OPS_READ,
  PERMISSION_USERS_MANAGE,
  PERMISSION_VENDORS_READ,
} from "./constants/permissions";
import { PermissionsManagement } from "./components/setting/PermissionsManagement";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/signin" replace />} />
      <Route path="/signin" element={<SignIn />} />

      <Route element={<RequireAuth />}>
        <Route path="/dashboard" element={<DefaultLayout />}>
          <Route
            index
            element={
              <RequirePermission permission={PERMISSION_ORDERS_READ}>
                <OrdersList />
              </RequirePermission>
            }
          />
          <Route path="ecommerce" element={<ECommerce />} />
          <Route
            path="order/:id"
            element={
              <RequirePermission permission={PERMISSION_ORDERS_READ}>
                <OrderDetailsPage />
              </RequirePermission>
            }
          />
          <Route
            path="add-order"
            element={
              <RequirePermission permission={PERMISSION_ORDERS_WRITE}>
                <OrderRegistration />
              </RequirePermission>
            }
          />
          <Route
            path="notifications/:id"
            element={
              <RequirePermission permission={PERMISSION_ORDERS_READ}>
                <Notifications />
              </RequirePermission>
            }
          />
          <Route path="in-app-notifications" element={<InAppNotifications />} />
          <Route
            path="purchase-notifications/:id"
            element={
              <RequirePermission permission={PERMISSION_PURCHASES_READ}>
                <PurchaseNotifications />
              </RequirePermission>
            }
          />
          <Route
            path="store-request-notifications/:id"
            element={
              <RequirePermission permission={PERMISSION_SALES_READ}>
                <StoreRequestNotifications />
              </RequirePermission>
            }
          />
          <Route path="profile" element={<Profile />} />
          <Route path="account-settings" element={<AccountSettings />} />
          <Route
            path="users"
            element={
              <RequirePermission permission={PERMISSION_USERS_MANAGE}>
                <User />
              </RequirePermission>
            }
          />
          <Route
            path="users/add"
            element={
              <RequirePermission permission={PERMISSION_USERS_MANAGE}>
                <UserRegistration />
              </RequirePermission>
            }
          />
          <Route
            path="users/:id"
            element={
              <RequirePermission permission={PERMISSION_USERS_MANAGE}>
                <UpdateUser />
              </RequirePermission>
            }
          />
          <Route
            path="customers"
            element={
              <RequirePermission permission={PERMISSION_CUSTOMERS_READ}>
                <CustomerList />
              </RequirePermission>
            }
          />
          <Route
            path="sales-partners"
            element={
              <RequirePermission permission={PERMISSION_MASTER_READ}>
                <SalesPartnerList />
              </RequirePermission>
            }
          />
          <Route
            path="settings/unit-category"
            element={
              <RequirePermission permission={PERMISSION_MASTER_READ}>
                <UnitCategory />
              </RequirePermission>
            }
          />
          <Route
            path="settings/unit-category/:id"
            element={
              <RequirePermission permission={PERMISSION_MASTER_READ}>
                <UnitOfMeasurements />
              </RequirePermission>
            }
          />
          <Route
            path="settings/assign-machines"
            element={
              <RequirePermission permission={PERMISSION_MASTER_READ}>
                <AssignUserMachine />
              </RequirePermission>
            }
          />
          <Route
            path="settings/pricings"
            element={
              <RequirePermission permission={PERMISSION_PRICING_READ}>
                <Pricings />
              </RequirePermission>
            }
          />
          <Route
            path="settings/discounts"
            element={
              <RequirePermission permission={PERMISSION_FINANCE_READ}>
                <Discounts />
              </RequirePermission>
            }
          />
          <Route
            path="settings/fixed-cost"
            element={
              <RequirePermission permission={PERMISSION_FINANCE_READ}>
                <FixedCost />
              </RequirePermission>
            }
          />
          <Route
            path="settings/permissions"
            element={
              <RequirePermission permission={PERMISSION_PERMISSIONS_MANAGE}>
                <PermissionsManagement />
              </RequirePermission>
            }
          />
          <Route
            path="commission"
            element={
              <RequirePermission permission={PERMISSION_FINANCE_READ}>
                <CommissionList />
              </RequirePermission>
            }
          />
          <Route
            path="commission/:id"
            element={
              <RequirePermission permission={PERMISSION_FINANCE_READ}>
                <CommissionDetails />
              </RequirePermission>
            }
          />
          <Route
            path="inventory/items"
            element={
              <RequirePermission permission={PERMISSION_ITEMS_READ}>
                <Items />
              </RequirePermission>
            }
          />
          <Route
            path="inventory/items/register"
            element={
              <RequirePermission permission={PERMISSION_ITEMS_WRITE}>
                <ItemRegistration />
              </RequirePermission>
            }
          />
          <Route
            path="inventory/items/:id"
            element={
              <RequirePermission permission={PERMISSION_ITEMS_WRITE}>
                <ItemEdit />
              </RequirePermission>
            }
          />
          <Route
            path="inventory/machines"
            element={
              <RequirePermission permission={PERMISSION_MASTER_READ}>
                <Machines />
              </RequirePermission>
            }
          />
          <Route
            path="inventory/lab-tools"
            element={
              <RequirePermission permission={PERMISSION_LAB_TOOL_READ}>
                <LabTools />
              </RequirePermission>
            }
          />
          <Route
            path="inventory/boms"
            element={
              <RequirePermission permission={PERMISSION_BOM_READ}>
                <Boms />
              </RequirePermission>
            }
          />
          <Route
            path="inventory/service"
            element={
              <RequirePermission permission={PERMISSION_MASTER_READ}>
                <ServicesList />
              </RequirePermission>
            }
          />
          <Route
            path="inventory/vendors"
            element={
              <RequirePermission permission={PERMISSION_VENDORS_READ}>
                <Vendors />
              </RequirePermission>
            }
          />
          <Route
            path="inventory/purchases"
            element={
              <RequirePermission permission={PERMISSION_PURCHASES_READ}>
                <Purschase />
              </RequirePermission>
            }
          />
          <Route
            path="inventory/purchases/:id"
            element={
              <RequirePermission permission={PERMISSION_PURCHASES_READ}>
                <PurchaseDetails />
              </RequirePermission>
            }
          />
          <Route
            path="inventory/purchases/add"
            element={
              <RequirePermission permission={PERMISSION_PURCHASES_WRITE}>
                <PurchaseRegistration />
              </RequirePermission>
            }
          />
          <Route
            path="inventory/stock"
            element={
              <RequirePermission permission={PERMISSION_BINCARD_READ}>
                <Stock />
              </RequirePermission>
            }
          />
          <Route
            path="inventory/store-request"
            element={
              <RequirePermission permission={PERMISSION_SALES_READ}>
                <StoreRequest />
              </RequirePermission>
            }
          />
          <Route
            path="inventory/store-request/:id"
            element={
              <RequirePermission permission={PERMISSION_SALES_READ}>
                <StoreRequestDetails />
              </RequirePermission>
            }
          />
          <Route
            path="inventory/operator-stock"
            element={
              <RequirePermission permission={PERMISSION_STOCK_OPS_READ}>
                <OperatorStock />
              </RequirePermission>
            }
          />
          <Route
            path="inventory/store-request/add"
            element={
              <RequirePermission permission={PERMISSION_SALES_WRITE}>
                <StoreRequestRegistration />
              </RequirePermission>
            }
          />
          <Route
            path="reports"
            element={
              <RequirePermission
                anyOf={[
                  PERMISSION_ORDERS_READ,
                  PERMISSION_PURCHASES_READ,
                  PERMISSION_SALES_READ,
                ]}
              >
                <Reports />
              </RequirePermission>
            }
          />
          <Route
            path="reports/orders-report"
            element={
              <RequirePermission permission={PERMISSION_ORDERS_READ}>
                <OrdersReport />
              </RequirePermission>
            }
          />
          <Route
            path="reports/purchases-report"
            element={
              <RequirePermission permission={PERMISSION_PURCHASES_READ}>
                <PurchasesReport />
              </RequirePermission>
            }
          />
          <Route
            path="reports/storerequests-report"
            element={
              <RequirePermission permission={PERMISSION_SALES_READ}>
                <StoreRequestsReport />
              </RequirePermission>
            }
          />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
