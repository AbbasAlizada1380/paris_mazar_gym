// import Customer from "./pages/ServiceManger";
import Dashboard from "./pages/dashboard";
// import S_Transaction from "./pages/RentManager";
import Report from "./pages/reports";
import AddUser from "./pages/AddUser";
import Fees from "./pages/fee/Fees.jsx";
import ActiveAthletes from "./pages/ActiceAthlete";
import ExpenseManager from "./pages/expense/ExpenseManages.jsx";
import StaffManager from "./pages/StaffManager.jsx";
import SalaryManagement from './pages/SalaryManagement.jsx'
import AthleteManager from "./pages/Athlete/AthleteManager.jsx";
const MainContent = ({ activeComponent }) => {
  const renderContent = () => {
    switch (activeComponent) {
      case "dashboard":
        return <Dashboard />;
      case "Athletes":
        return <AthleteManager />;
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
