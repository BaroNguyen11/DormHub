import Workspace from "../../components/Workspace";
import ProfileScreen from "../../components/Screen/ProfileScreen";
import FormScreen from "../../components/Screen/FormScreen";
import { screens } from "../../constants/screenConfig";
import { useState } from "react";

export default function Page() {
  const [activeTab, setActiveTab] = useState("info");
  return (
    <Workspace group="student" title="Tài khoản">
      <div className="space-y-6">
        <div className="flex flex-wrap gap-3 border-b-2 border-line-strong pb-3">
          <button
            type="button"
            aria-pressed={activeTab === "info"}
            className={`px-4 py-2 rounded-sm border-3 border-line-strong font-bold! ${activeTab === "info" ? "bg-warning" : "bg-surface"}`}
            onClick={() => setActiveTab("info")}
          >
            Thông tin cá nhân
          </button>
          <button
            type="button"
            aria-pressed={activeTab === "security"}
            className={`px-4 py-2 rounded-sm border-3 border-line-strong font-bold! ${activeTab === "security" ? "bg-warning" : "bg-surface"}`}
            onClick={() => setActiveTab("security")}
          >
            Bảo mật & Đổi mật khẩu
          </button>
        </div>
        {activeTab === "info" ? (
          <ProfileScreen config={screens["/student/profile"]} />
        ) : (
          <FormScreen config={{ ...screens["/change-password"], group: "student" }} />
        )}
      </div>
    </Workspace>
  );
}
