import ArticleIcon from "@mui/icons-material/Article";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import SettingsIcon from "@mui/icons-material/Settings";
import Sidebar, { type MenuItemType } from "../common/Sidebar";

const menu: MenuItemType[] = [
  { text: "Bảng điều khiển", icon: <DashboardIcon />, path: "/admin/dashboard" },
  { text: "Quản lý người dùng", icon: <PeopleIcon />, path: "/admin/users" },
  { text: "AI & Cơ sở tri thức", icon: <ArticleIcon />, path: "/admin/ai" },
  { text: "Phần cứng & Cảm biến", icon: <SettingsIcon />, path: "/admin/hardware" },
];

export const AdminSidebar: React.FC = () => {
  return <Sidebar menu={menu} activeStyle="simple" userName="Admin" userRole="Quản trị viên" userInitials="A" />;
};

export default AdminSidebar;
