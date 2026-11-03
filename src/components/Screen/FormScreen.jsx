import { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Save, X, FileEdit, PlusCircle } from "lucide-react";
import { resources } from "../../services/resource.service";
import { errorMessage } from "../../utils/errorHandler";
import { FIELD_LABELS, FIELD_CONFIGS } from "./constants";
import { Notice, Loading, Heading } from "./UIComponents";
import { useLoad } from "./useLoad";
import { Input, Button } from "../ui";
import { CustomSelect } from "../ui/CustomSelect";

/**
 * Component FormFields - Render các input fields theo phong cách Neo-Brutalism
 */
function FormFields({ names, values, onChange }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {names.map((key) => {
        const meta = FIELD_CONFIGS[key] || {};
        const isRequired = !["description", "note"].includes(key);

        return (
          <label
            className={`flex flex-col gap-2 ${
              meta.tag === "textarea" ? "md:col-span-2" : ""
            }`}
            key={key}
          >
            {/* Label của field */}
            <span className="text-sm font-extrabold text-text flex items-center justify-between">
              <span>{FIELD_LABELS[key] || key}</span>
              {!isRequired && (
                <span className="text-xs font-semibold text-text-muted">
                  (Không bắt buộc)
                </span>
              )}
            </span>

            {/* 1. Textarea - Cho nội dung dài */}
            {meta.tag === "textarea" ? (
              <textarea
                required={isRequired}
                value={values[key] ?? ""}
                onChange={(e) => onChange(key, e.target.value)}
                rows={4}
                placeholder={`Nhập ${FIELD_LABELS[key]?.toLowerCase() || key}...`}
                className="w-full border-3 border-line-strong rounded-sm px-4 py-3 text-sm! font-semibold text-text bg-white shadow-[2px_2px_0_#141413] focus:shadow-[4px_4px_0_#141413] outline-none! resize-none transition-all"
              />
            ) : meta.options ? (
              <CustomSelect
                value={values[key] ?? ""}
                required={isRequired}
                options={meta.options}
                placeholder={`-- Chọn ${FIELD_LABELS[key]?.toLowerCase() || key} --`}
                onChange={(val) => onChange(key, val)}
              />
            ) : (
              /* 3. Input chuẩn */
              <input
                required={isRequired}
                type={meta.type || "text"}
                min={meta.min}
                max={meta.max}
                value={values[key] ?? ""}
                onChange={(e) => onChange(key, e.target.value)}
                placeholder={`Nhập ${FIELD_LABELS[key]?.toLowerCase() || key}...`}
                className="w-full border-3 border-line-strong rounded-sm px-4 py-3 text-sm font-bold text-text bg-white shadow-[2px_2px_0_#141413] focus:shadow-[4px_4px_0_#141413] outline-none! transition-all placeholder:font-medium placeholder:text-text-muted/60"
              />
            )}
          </label>
        );
      })}
    </div>
  );
}

/**
 * Component FormScreen - Màn hình form tạo mới hoặc chỉnh sửa
 */
export default function FormScreen({ config }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [values, setValues] = useState({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // Load data nếu ở chế độ Edit
  const { data, loading } = useLoad(
    config.edit ? `${config.resource}/${id}` : config.resource,
    {},
  );

  const currentValues = config.edit ? { ...(data || {}), ...values } : values;

  const change = (key, value) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");

    try {
      const body = Object.fromEntries(
        config.fields.map((key) => [key, currentValues[key]]),
      );

      const result = config.edit
        ? await resources.update(config.resource, id, body)
        : await resources.create(config.resource, body);

      navigate(
        config.edit
          ? location.pathname.replace(/\/edit$/, "")
          : config.resource === "/maintenance-requests"
            ? "/student/maintenance"
            : config.resource === "/notifications"
              ? "/manager"
              : location.pathname.replace(/\/new$/, ""),
        {
          state: {
            success: `Đã lưu ${result?.id ? `mã #${result.id}` : "thành công"}.`,
          },
        },
      );
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Heading với breadcrumbs */}
      <Heading config={config} />

      {/* Thông báo lỗi */}
      <Notice error={error} />

      {/* Panel Form Neo-Brutalism */}
      <div className="bg-white border-4 border-line-strong rounded-2xl p-6 sm:p-8 shadow-[6px_6px_0_#141413]">
        {/* Sub-header báo trạng thái Form */}
        <div className="flex items-center gap-2 mb-6 pb-4 border-b-3 border-line-strong">
          {config.edit ? (
            <div className="size-9 rounded-xl bg-warning border-2 border-line-strong flex items-center justify-center shadow-[2px_2px_0_#141413]">
              <FileEdit size={18} className="text-black" strokeWidth={2.5} />
            </div>
          ) : (
            <div className="size-9 rounded-xl bg-primary border-2 border-line-strong flex items-center justify-center shadow-[2px_2px_0_#141413]">
              <PlusCircle size={18} className="text-black" strokeWidth={2.5} />
            </div>
          )}
          <h2 className="text-lg font-extrabold text-text">
            {config.edit
              ? `Cập nhật thông tin #${id}`
              : "Điền thông tin bên dưới"}
          </h2>
        </div>

        {config.edit && loading ? (
          <Loading />
        ) : (
          <form onSubmit={submit} className="space-y-8">
            {/* Render các input fields */}
            <FormFields
              names={config.fields}
              values={currentValues}
              onChange={change}
            />

            {/* Form actions: Nút Hủy & Nút Lưu */}
            <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3 pt-6 border-t-3 border-line-strong">
              {/* Nút Hủy bỏ */}
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2 bg-white text-black font-extrabold text-sm rounded-sm border-3 border-line-strong shadow-[3px_3px_0_#141413] hover:bg-surface-2 hover:shadow-[5px_5px_0_#141413] hover:-translate-0.5 active:translate-0.5 active:shadow-none transition-all cursor-pointer"
              >
                <X size={18} strokeWidth={2.5} />
                <span>Hủy bỏ</span>
              </button>

              {/* Nút Lưu thông tin */}
              <button
                type="submit"
                disabled={busy}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2 bg-primary text-black font-extrabold text-sm rounded-sm border-3 border-line-strong shadow-[3px_3px_0_#141413] hover:shadow-[5px_5px_0_#141413] hover:-translate-0.5 active:translate-0.5 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none transition-all cursor-pointer"
              >
                {busy ? (
                  <RefreshCw
                    size={18}
                    strokeWidth={2.5}
                    className="animate-spin"
                  />
                ) : (
                  <Save size={18} strokeWidth={2.5} />
                )}
                <span>{busy ? "Đang lưu..." : "Lưu thông tin"}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
