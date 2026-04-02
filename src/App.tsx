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
import { PERMISSION_NOTIFICATIONS_READ } from "./constants/permissions";

const App = () => {

  return (
    <Routes>
      {/* Public routes - login only */}
      <Route path="/" element={<Navigate to="/signin" replace />} />
      <Route path="/signin" element={<SignIn />} />

      {/* Private routes */}
      <Route element={<RequireAuth />}>
        <Route path="/dashboard" element={<DefaultLayout />}>
          <Route index element={<OrdersList />} />
          <Route path="ecommerce" element={<ECommerce />} />
          <Route path="order/:id" element={<OrderDetailsPage />} />
          <Route path="add-order" element={<OrderRegistration />} />
          <Route path="notifications/:id" element={<Notifications />} />
          <Route
            path="in-app-notifications"
            element={
              <RequirePermission permission={PERMISSION_NOTIFICATIONS_READ}>
                <InAppNotifications />
              </RequirePermission>
            }
          />
          <Route path="purchase-notifications/:id" element={<PurchaseNotifications />} />
          <Route path="store-request-notifications/:id" element={<StoreRequestNotifications />} />
          <Route path="profile" element={<Profile />} />
          <Route path="account-settings" element={<AccountSettings />} />
          <Route path="users" element={<User />} />
          <Route path="users/add" element={<UserRegistration />} />
          <Route path="users/:id" element={<UpdateUser />} />
          <Route path="customers" element={<CustomerList />} />
          <Route path="sales-partners" element={<SalesPartnerList />} />
          <Route path="settings/unit-category" element={<UnitCategory />} />
          <Route path="settings/unit-category/:id" element={<UnitOfMeasurements />} />
          <Route path="settings/assign-machines" element={<AssignUserMachine />} />
          <Route path="settings/pricings" element={<Pricings />} />
          <Route path="settings/discounts" element={<Discounts />} />
          <Route path="settings/fixed-cost" element={<FixedCost />} />
          <Route path="commission" element={<CommissionList />} />
          <Route path="commission/:id" element={<CommissionDetails />} />
          <Route path="inventory/items" element={<Items />} />
          <Route path="inventory/items/register" element={<ItemRegistration />} />
          <Route path="inventory/items/:id" element={<ItemEdit />} />
          <Route path="inventory/machines" element={<Machines />} />
          <Route path="inventory/lab-tools" element={<LabTools />} />
          <Route path="inventory/boms" element={<Boms />} />
          <Route path="inventory/service" element={<ServicesList />} />
          <Route path="inventory/vendors" element={<Vendors />} />
          <Route path="inventory/purchases" element={<Purschase />} />
          <Route path="inventory/purchases/:id" element={<PurchaseDetails />} />
          <Route path="inventory/purchases/add" element={<PurchaseRegistration />} />
          <Route path="inventory/stock" element={<Stock />} />
          <Route path="inventory/store-request" element={<StoreRequest />} />
          <Route path="inventory/store-request/:id" element={<StoreRequestDetails />} />
          <Route path="inventory/operator-stock" element={<OperatorStock />} />
          <Route path="inventory/store-request/add" element={<StoreRequestRegistration />} />
          <Route path="reports" element={<Reports />} />
          <Route path="reports/orders-report" element={<OrdersReport />} />
          <Route path="reports/purchases-report" element={<PurchasesReport />} />
          <Route path="reports/storerequests-report" element={<StoreRequestsReport />} />
        </Route>
      </Route>
 
      {/* Catch all route for not found pages */}
      <Route path="*" element={<NotFound />} />

    </Routes>
  );
};

export default App;
