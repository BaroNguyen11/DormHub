import { useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import Workspace from "../../components/Workspace";
import ListScreen from "../../components/Screen/ListScreen";
import FormScreen from "../../components/Screen/FormScreen";
import { screens } from "../../constants/screenConfig";

const GROUPS = {
  "/manager/rooms": {
    title: "Phòng & Tòa nhà",
    tabs: [
      ["Danh sách phòng", "room"],
      ["Tòa nhà", "building"],
    ],
    defaultTab: "room",
  },
  "/manager/students": {
    title: "Sinh viên & Đơn",
    tabs: [
      ["Sinh viên cư trú", "residents"],
      ["Đơn đăng ký", "applications"],
    ],
    defaultTab: "residents",
  },
  "/manager/contracts": {
    title: "Hợp đồng & Thủ tục",
    tabs: [
      ["Hợp đồng", "contracts"],
      ["Yêu cầu gia hạn", "renewals"],
      ["Yêu cầu chuyển phòng", "transfers"],
      ["Yêu cầu trả phòng", "checkouts"],
    ],
    defaultTab: "contracts",
  },
  "/manager/finance": {
    title: "Quản lý Tài chính",
    tabs: [
      ["Hóa đơn", "invoices"],
      ["Giao dịch SePay", "sepay"],
    ],
    defaultTab: "invoices",
  },
  "/manager/maintenance": {
    title: "Vận hành & Hỗ trợ",
    tabs: [
      ["Yêu cầu báo hỏng", "maintenance"],
      ["Gửi thông báo", "notifications"],
    ],
    defaultTab: "maintenance",
  },
};

function TabContent({ group, tab }) {
  const configKey = {
    rooms: {
      room: "/manager/rooms/list",
      building: "/manager/buildings",
    },
    students: {
      residents: "/manager/residents",
      applications: "/manager/applications",
    },
    contracts: {
      contracts: "/manager/contracts/list",
      renewals: "/manager/renewal-requests",
      transfers: "/manager/room-transfer-requests",
      checkouts: "/manager/checkout-requests",
    },
    finance: {
      invoices: "/manager/invoices",
      sepay: "/manager/sepay",
    },
    maintenance: {
      maintenance: "/manager/maintenance/list",
      notifications: "/send-to-students",
    },
  }[group]?.[tab];
  if (!configKey) return null;
  const config = screens[configKey];
  if (!config) {
    console.warn(`[ManagerGroupPage] Không tìm thấy screen config: ${configKey}`);
    return null;
  }
  if (
    typeof config.resource !== "string" ||
    !config.resource.trim() ||
    config.resource.toLowerCase().includes("null") ||
    config.resource.toLowerCase().includes("undefined")
  ) {
    console.warn(
      `[ManagerGroupPage] Endpoint không hợp lệ cho ${configKey}:`,
      config.resource,
    );
    return null;
  }
  return config.type === "form" ? (
    <FormScreen config={config} />
  ) : <ListScreen config={config} />;
}

export default function ManagerGroupPage() {
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const group = GROUPS[pathname];
  const [selectedTabs, setSelectedTabs] = useState({});
  if (!group) return null;
  const groupKey = pathname.replace("/manager/", "");
  const queryTabs = {
    students: { applications: "applications" },
    finance: { invoices: "invoices" },
    maintenance: { tickets: "maintenance", announcements: "notifications" },
  };
  const activeTab = selectedTabs[groupKey] || queryTabs[groupKey]?.[searchParams.get("tab")] || group.defaultTab;
  return (
    <Workspace group="manager" title={group.title}>
      <div className="space-y-5">
        <nav
          className="flex items-center gap-2 bg-surface-2 p-1.5 border-3 border-line-strong rounded-sm w-fit mb-6 shadow-[2px_2px_0_#141413]"
          aria-label={group.title}
        >
          {group.tabs.filter(Boolean).map((tab) => {
            if (!Array.isArray(tab) || !tab[0] || !tab[1]) return null;
            const [label, value] = tab;
            return (
            <button
              key={value}
              type="button"
              aria-pressed={activeTab === value}
              onClick={() =>
                setSelectedTabs((current) => ({
                  ...current,
                  [groupKey]: value,
                }))
              }
              className={`px-4 py-2 text-sm! rounded-sm border-2 transition-all outline-none! ${activeTab === value ? "bg-primary text-black! border-line-strong shadow-[2px_2px_0_#141413] font-black!" : "text-text-muted hover:text-text hover:bg-surface border-transparent font-bold"}`}
            >
              {label}
            </button>
            );
          })}
        </nav>
        <TabContent group={groupKey} tab={activeTab} />
      </div>
    </Workspace>
  );
}
