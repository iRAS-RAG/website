import AgricultureIcon from "@mui/icons-material/Agriculture";
import DashboardIcon from "@mui/icons-material/Dashboard";
import FastfoodIcon from "@mui/icons-material/Fastfood";
import PeopleIcon from "@mui/icons-material/People";
import SettingsSuggestIcon from "@mui/icons-material/SettingsSuggest";
import { useEffect, useState } from "react";
import { getMe } from "../../api/users";
import type { User } from "../../types/user";
import Sidebar, { type MenuItemType } from "../common/Sidebar";

const menu: MenuItemType[] = [
  { text: "Tổng quan", icon: <DashboardIcon />, path: "/supervisor/dashboard" },
  { text: "Nhân viên", icon: <PeopleIcon />, path: "/supervisor/operators" },
  { text: "Vụ nuôi", icon: <AgricultureIcon />, path: "/supervisor/batches" },
  { text: "Cám", icon: <FastfoodIcon />, path: "/supervisor/feed-types" },
  { text: "Cấu hình loài", icon: <SettingsSuggestIcon />, path: "/supervisor/species-configs" },
];

export const SupervisorSidebar: React.FC = () => {
  const [profile, setProfile] = useState<User | null>(null);

  useEffect(() => {
    getMe()
      .then(setProfile)
      .catch(() => {});
  }, []);

  return <Sidebar menu={menu} activeStyle="leftBorder" userName={profile?.name ?? ""} userRole={profile?.role ?? ""} userInitials={profile?.name ? profile.name.charAt(0).toUpperCase() : "U"} />;
};

export default SupervisorSidebar;
