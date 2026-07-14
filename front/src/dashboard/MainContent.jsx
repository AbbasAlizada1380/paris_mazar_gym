// import Customer from "./pages/ServiceManger";
import Dashboard from "./pages/dashboard";
// import S_Transaction from "./pages/RentManager";
import Report from "./pages/reports";
import AddUser from "./pages/AddUser";
import Athletes from "./pages/Athletes";
import Fees from "./pages/Fees";
import ActiveAthletes from "./pages/ActiceAthlete";
import ExpenseManager from "./pages/expense/ExpenseManages.jsx";
import StaffManager from "./pages/StaffManager.jsx";
import SalaryManagement from './pages/SalaryManagement.jsx'
const MainContent = ({ activeComponent }) => {
  const renderContent = () => {
    switch (activeComponent) {
      case "dashboard":
        return <Dashboard />;
      case "Athletes":
        return <Athletes />;
      case "Fees":
        return <Fees />;
      case "SalaryManagement":
        return <SalaryManagement />;
      case "StaffManager":
        return <StaffManager />;
      case "AddUser":
        return <AddUser />;
      case "expense":
        return <ExpenseManager />;
      case "ActiveAthletes":
        return <ActiveAthletes />;

      default:
        return <Dashboard />;
    }
  };

  return <div className="min-h-[90vh]">{renderContent()}</div>;
};

export default MainContent;
