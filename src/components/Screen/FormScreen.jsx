import { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Save,
  X,
  FileEdit,
  PlusCircle,
  RefreshCw,
  Upload,
  Image as ImageIcon,
  Trash2,
  ZoomIn,
} from "lucide-react";
import { resources } from "../../services/resource.service";
import { errorMessage } from "../../utils/errorHandler";
import { FIELD_LABELS, FIELD_CONFIGS } from "./constants";
import { Notice, Loading, Heading } from "./UIComponents";
import { useLoad } from "./useLoad";
import { CustomSelect } from "../ui/CustomSelect";
import { CustomDatePicker } from "../ui/CustomDatePicker";

/**
 * Component Upload Ảnh - Phong cách Neo-Brutalism tích hợp Modal Phóng To & Xóa ảnh độc lập
 */
function ImageUploadField({ value, onChange, isRequired }) {
  const [preview, setPreview] = useState(
    typeof value === "string" ? value : value ? URL.createObjectURL(value) : "",
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onChange(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleRemove = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onChange("");
    setPreview("");
  };

  return (
    <div className="space-y-3">
      {preview ? (
        <>
          {/* Khung hiển thị ảnh preview */}
          <div className="relative w-full border-3 border-line-strong rounded-sm overflow-hidden shadow-[4px_4px_0_#141413] bg-text/5 p-2 group">
            <div
              onClick={() => setIsModalOpen(true)}
              className="relative w-full h-72 flex items-center justify-center bg-surface-2/80 rounded-lg overflow-hidden cursor-zoom-in"
              title="Nhấp để xem ảnh đầy đủ"
            >
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-contain hover:scale-102 transition-transform duration-200"
              />
              <div className="absolute inset-0 bg-text/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-surface font-extrabold text-sm gap-2 pointer-events-none">
                <ZoomIn size={20} />
                <span>Xem ảnh đầy đủ</span>
              </div>
            </div>

            {/* Nút Xóa ảnh - Chỉ xóa khi click đúng nút này */}
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-4 right-4 p-2.5 bg-error text-white font-black rounded-xl border-2 border-line-strong shadow-[2px_2px_0_#141413] hover:shadow-[3px_3px_0_#141413] hover:-translate-px active:translate-px active:shadow-none transition-all cursor-pointer z-10 flex items-center gap-1 text-xs"
              title="Xóa ảnh"
            >
              <Trash2 size={18} strokeWidth={2.5} />
            </button>
          </div>

          {/* Modal Preview Phóng To Ảnh (Phủ mờ background) */}
          {isModalOpen && (
            <div
              className="fixed inset-0 z-50 bg-text/75 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fadeIn"
              onClick={() => setIsModalOpen(false)}
            >
              <div
                className="relative max-w-5xl max-h-[90vh] bg-surface border-4 border-line-strong rounded-2xl p-3 shadow-[8px_8px_0_#141413] flex flex-col items-center justify-center overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Nút Đóng Modal */}
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="absolute top-3 right-3 z-20 p-2 bg-surface text-text font-black rounded-xl border-2 border-line-strong shadow-[2px_2px_0_#141413] hover:bg-error hover:text-surface transition-all cursor-pointer"
                  title="Đóng"
                >
                  <X size={20} strokeWidth={3} />
                </button>

                {/* Hiển thị ảnh trọn vẹn trong Modal */}
                <img
                  src={preview}
                  alt="Full size preview"
                  className="max-w-full max-h-[82vh] object-contain rounded-lg"
                />
              </div>
            </div>
          )}
        </>
      ) : (
        /* Ô tải ảnh lên */
        <label className="flex flex-col items-center justify-center w-full h-36 border-3 border-dashed border-line-strong rounded-sm bg-surface shadow-[3px_3px_0_#141413] hover:bg-surface-1 hover:border-solid transition-all cursor-pointer group">
          <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
            <div className="size-10 rounded-lg bg-primary/20 border-2 border-line-strong flex items-center justify-center mb-2 shadow-[2px_2px_0_#141413] group-hover:scale-110 transition-transform">
              <Upload size={20} className="text-text" strokeWidth={2.5} />
            </div>
            <p className="text-sm font-extrabold text-text">
              Nhấp để tải ảnh lên{" "}
              <span className="text-text-muted font-normal">
                (hoặc kéo thả vào đây)
              </span>
            </p>
            <p className="text-xs font-semibold text-text-muted mt-1">
              PNG, JPG, WEBP (Tối đa 5MB)
            </p>
          </div>
          <input
            type="file"
            accept="image/*"
            required={isRequired && !value}
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      )}
    </div>
  );
}

/**
 * Component FormFields - Render các input fields
 */
function FormFields({ names, values, onChange }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {names.map((key) => {
        const meta = FIELD_CONFIGS[key] || {};
        const isRequired = ![
          "description",
          "note",
          "image",
          "images",
          "imageUrl",
        ].includes(key);
        const isImageField =
          meta.type === "file" ||
          meta.type === "image" ||
          ["image", "images", "imageUrl"].includes(key);
        const isFullWidth = meta.tag === "textarea" || isImageField;

        return (
          /* Đổi từ <label> thành <div> để tránh lỗi kích hoạt nhầm sự kiện click */
          <div
            className={`flex flex-col gap-2 ${
              isFullWidth ? "md:col-span-2" : ""
            }`}
            key={key}
          >
            {/* Label tiêu đề trường */}
            <span className="text-sm font-extrabold text-text flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                {isImageField && <ImageIcon size={16} strokeWidth={2.5} />}
                {FIELD_LABELS[key] || key}
              </span>
              {!isRequired && (
                <span className="text-xs font-semibold text-text-muted">
                  (Không bắt buộc)
                </span>
              )}
            </span>

            {/* Render Input tương ứng */}
            {isImageField ? (
              <ImageUploadField
                value={values[key] ?? ""}
                isRequired={isRequired}
                onChange={(val) => onChange(key, val)}
              />
            ) : meta.tag === "textarea" ? (
              <textarea
                required={isRequired}
                value={values[key] ?? ""}
                onChange={(e) => onChange(key, e.target.value)}
                rows={4}
                placeholder={`Nhập ${FIELD_LABELS[key]?.toLowerCase() || key}...`}
                className="w-full border-3 border-line-strong rounded-sm px-4 py-3 text-sm! font-semibold text-text bg-surface shadow-[2px_2px_0_#141413] focus:shadow-[4px_4px_0_#141413] outline-none! resize-none transition-all"
              />
            ) : meta.options ? (
              <CustomSelect
                value={values[key] ?? ""}
                required={isRequired}
                options={meta.options}
                placeholder={`-- Chọn ${FIELD_LABELS[key]?.toLowerCase() || key} --`}
                onChange={(val) => onChange(key, val)}
              />
            ) : meta.type === "date" ? (
              <CustomDatePicker
                value={values[key] ?? ""}
                required={isRequired}
                onChange={(val) => onChange(key, val)}
              />
            ) : (
              <input
                required={isRequired}
                type={meta.type || "text"}
                min={meta.min}
                max={meta.max}
                value={values[key] ?? ""}
                onChange={(e) => onChange(key, e.target.value)}
                placeholder={`Nhập ${FIELD_LABELS[key]?.toLowerCase() || key}...`}
                className="w-full border-3 border-line-strong rounded-sm px-4 py-3 text-sm font-bold text-text bg-surface shadow-[2px_2px_0_#141413] focus:shadow-[4px_4px_0_#141413] outline-none! transition-all placeholder:font-medium placeholder:text-text-muted/60"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/**
 * Component FormScreen - Màn hình form chính
 */
export default function FormScreen({ config }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [values, setValues] = useState({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

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
      const hasFile = config.fields.some(
        (key) => currentValues[key] instanceof File,
      );

      let payload;

      if (hasFile) {
        const formData = new FormData();
        config.fields.forEach((key) => {
          const val = currentValues[key];
          const meta = FIELD_CONFIGS[key] || {};
          if (val !== undefined && val !== null) {
            if (meta.type === "number" && val !== "") {
              formData.append(key, Number(val));
            } else {
              formData.append(key, val);
            }
          }
        });
        payload = formData;
      } else {
        payload = Object.fromEntries(
          config.fields.map((key) => {
            const val = currentValues[key];
            const meta = FIELD_CONFIGS[key] || {};
            if (
              meta.type === "number" &&
              val !== "" &&
              val !== null &&
              val !== undefined
            ) {
              return [key, Number(val)];
            }
            return [key, val];
          }),
        );
      }

      const result = config.edit
        ? await resources.update(config.resource, id, payload)
        : await resources.create(config.resource, payload);

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
      <Heading config={config} />
      <Notice error={error} />

      <div className="bg-surface border-4 border-line-strong rounded-2xl p-6 sm:p-8 shadow-[6px_6px_0_#141413]">
        <div className="flex items-center gap-2 mb-6 pb-4 border-b-3 border-line-strong">
          {config.edit ? (
            <div className="size-9 rounded-xl bg-warning border-2 border-line-strong flex items-center justify-center shadow-[2px_2px_0_#141413]">
              <FileEdit size={18} className="text-text" strokeWidth={2.5} />
            </div>
          ) : (
            <div className="size-9 rounded-xl bg-primary border-2 border-line-strong flex items-center justify-center shadow-[2px_2px_0_#141413]">
              <PlusCircle size={18} className="text-text" strokeWidth={2.5} />
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
            <FormFields
              names={config.fields}
              values={currentValues}
              onChange={change}
            />

            <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3 pt-6 border-t-3 border-line-strong">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2 bg-surface text-text font-extrabold text-sm rounded-sm border-3 border-line-strong shadow-[3px_3px_0_#141413] hover:bg-surface-2 hover:shadow-[5px_5px_0_#141413] hover:-translate-0.5 active:translate-0.5 active:shadow-none transition-all cursor-pointer"
              >
                <X size={18} strokeWidth={2.5} />
                <span>Hủy bỏ</span>
              </button>

              <button
                type="submit"
                disabled={busy}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2 bg-primary text-[#000000] font-extrabold text-sm rounded-sm border-3 border-line-strong shadow-[3px_3px_0_#141413] hover:shadow-[5px_5px_0_#141413] hover:-translate-0.5 active:translate-0.5 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none transition-all cursor-pointer"
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