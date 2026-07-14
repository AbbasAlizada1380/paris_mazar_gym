import { BrowserRouter, Route, Routes } from "react-router-dom";
import DashboardPage from "./dashboard/DashboardPage";
import Signin from "./dashboard/auth/Signin";
// import NotFound from "./pages/NotFound";
import PrivateRoute from "./dashboard/access/PrivateRoute";
import EmailEntry from "./dashboard/reset_password/EmailEntery"
import ResetPassword from "./dashboard/reset_password/ResetPassword"
// import HomePage from "./pages/home/HomePage";
export default function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          {/* public routes all users */}
          {/* <Route path="/" element={<DashboardPage />} /> */}
          <Route path="/forgot_password" element={<EmailEntry />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/" element={<Signin />} />
          <Route path="*" element={<Signin />} />
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}
