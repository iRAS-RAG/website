import ArticleIcon from "@mui/icons-material/Article";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import SettingsIcon from "@mui/icons-material/Settings";
import { useEffect, useState } from "react";
import { getMe } from "../../api/users";
import type { User } from "../../types/user";
import Sidebar, { type MenuItemType } from "../common/Sidebar";

const menu: MenuItemType[] = [
  { text: "Bảng điều khiển", icon: <DashboardIcon />, path: "/admin/dashboard" },
  { text: "Quản lý người dùng", icon: <PeopleIcon />, path: "/admin/users" },
  { text: "AI & Cơ sở tri thức", icon: <ArticleIcon />, path: "/admin/ai" },
  { text: "Phần cứng & Cảm biến", icon: <SettingsIcon />, path: "/admin/hardware" },
];

export const AdminSidebar: React.FC = () => {
  const [profile, setProfile] = useState<User | null>(null);

  useEffect(() => {
    getMe()
      .then(setProfile)
      .catch(() => {});
  }, []);

  return <Sidebar menu={menu} activeStyle="leftBorder" userName={profile?.name ?? ""} userRole={profile?.role ?? ""} userInitials={profile?.name ? profile.name.charAt(0).toUpperCase() : "U"} />;
};

export default AdminSidebar;
