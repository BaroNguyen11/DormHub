import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Eye,
  FileImage,
  LoaderCircle,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import Workspace from "../../components/Workspace";
import { api, asList } from "../../api/apiClient";
import { resources } from "../../services/resource.service";
import { CustomSelect } from "../../components/ui/CustomSelect";
import { StatusBadge } from "../../components/ui";
import { Empty, Loading, Notice } from "../../components/Screen/UIComponents";
import { useLoad } from "../../components/Screen/useLoad";
import { STATUS_LABELS } from "../../constants/status";
import useStudentRoom from "../../hooks/useStudentRoom";

const MAX_FILE_SIZE_MB = 10;

const inputClass =
  "w-full border-3 border-line-strong bg-surface rounded-sm px-4 py-2 text-sm font-bold text-text shadow-[3px_3px_0_#141413] focus:shadow-[4px_4px_0_#141413] outline-none! transition-all";
const statusLabels = {
  PENDING: "Đang chờ xử lý",
  IN_PROGRESS: "Đang xử lý",
  COMPLETED: "Đã hoàn thành",
  REJECTED: "Đã từ chối",
};
const priorityLabels = {
  LOW: STATUS_LABELS.LOW,
  MEDIUM: STATUS_LABELS.MEDIUM,
  HIGH: STATUS_LABELS.HIGH,
  URGENT: STATUS_LABELS.URGENT,
};

function inferType(assetName) {
  const name = assetName.toLocaleLowerCase("vi");
  if (name.includes("quạt")) return "FAN";
  if (name.includes("điều hòa") || name.includes("máy lạnh"))
    return "AIR_CONDITIONER";
  if (name.includes("tủ lạnh")) return "REFRIGERATOR";
  if (name.includes("đèn") || name.includes("bóng")) return "LIGHTING";
  if (
    ["vòi", "nước", "ống", "bồn", "lavabo"].some((word) => name.includes(word))
  )
    return "PLUMBING";
  if (["cửa", "cửa sổ", "khóa"].some((word) => name.includes(word)))
    return "DOOR_WINDOW";
  if (["bàn", "ghế", "giường", "tủ "].some((word) => name.includes(word)))
    return "FURNITURE";
  return "OTHER";
}

function getDateLabel(value) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleString("vi-VN");
}

function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export default function StudentMaintenancePage() {
  const [search, setSearch] = useState("");
  const { hasRoom } = useStudentRoom();
  const { data, error, loading, reload } = useLoad("/student/maintenance", {
    page: 0, size: 50,
  });
  const requests = asList(data);
  const query = search.trim().toLocaleLowerCase("vi");
  const visibleRequests = query ? requests.filter((request) =>
    [request.title, request.description, request.type, request.status]
      .some((value) => String(value || "").toLocaleLowerCase("vi").includes(query))) : requests;
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "MEDIUM",
  });
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const fileInputRef = useRef(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!previewUrl.startsWith("blob:")) return undefined;
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  function resetAndClose() {
    setModalOpen(false);
    setForm({ title: "", description: "", priority: "MEDIUM" });
    setImageFile(null);
    setPreviewUrl("");
    setLightboxOpen(false);
  }

  function selectImageFile(file, input = fileInputRef.current) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      if (input) input.value = "";
      toast.error("Vui lòng chọn tệp hình ảnh.");
      return;
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      if (input) input.value = "";
      toast.error("Vượt quá dung lượng! Kích thước ảnh tối đa cho phép là 10 MB.");
      return;
    }
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  function selectImage(event) {
    selectImageFile(event.target.files?.[0], event.target);
    event.target.value = "";
  }

  function dropImage(event) {
    event.preventDefault();
    selectImageFile(event.dataTransfer.files?.[0]);
  }

  async function submitRequest(event) {
    event.preventDefault();
    const assetName = form.title.trim();
    const description = form.description.trim();
    if (!assetName || !description) {
      toast.error("Vui lòng nhập tên sự cố và mô tả chi tiết.");
      return;
    }

    setBusy(true);
    try {
      let imageUrl;
      if (imageFile) {
        const uploadForm = new FormData();
        uploadForm.append("file", imageFile);
        const uploaded = await api("/upload", {
          method: "POST",
          body: uploadForm,
        });
        imageUrl = uploaded?.url;
        if (!imageUrl) {
          toast.error("Backend không trả về đường dẫn ảnh.");
          return;
        }
      }

      await resources.create("/student/maintenance", {
        title: assetName,
        assetName,
        description,
        priority: form.priority,
        type: inferType(assetName),
        imageUrl: imageUrl || null,
      });

      toast.success("Tạo yêu cầu báo hỏng thành công!");
      resetAndClose();
      reload();
    } catch {
      // API client displays upload or create errors globally.
    } finally {
      setBusy(false);
    }
  }

  return (
    <Workspace group="student" title="Báo hỏng">
      <main className="w-full space-y-6">
        <section className="bg-surface border-4 border-line-strong rounded-sm p-4 sm:p-5 shadow-[5px_5px_0_#141413]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-black text-text">Yêu cầu báo hỏng</h1>
              <p className="mt-1 text-sm font-bold text-text-muted">
                Theo dõi sự cố trong phòng và gửi yêu cầu hỗ trợ.
              </p>
            </div>
          </div>
        </section>

        <Notice error={error} />
        <section className="bg-surface border-4 border-line-strong rounded-sm shadow-[5px_5px_0_#141413] overflow-hidden">
          <div className="flex flex-wrap items-center gap-3 p-4 border-b-4 border-line-strong bg-surface-2">
            <div className="relative flex-1 min-w-60">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" size={18} strokeWidth={2.5} />
              <input aria-label="Tìm kiếm" placeholder="Tìm theo tiêu đề hoặc mô tả..." value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-sm border-3 border-line-strong bg-surface text-sm font-semibold text-text shadow-[2px_2px_0_#141413] focus:shadow-[4px_4px_0_#141413] outline-none! transition-all" />
            </div>
            {hasRoom && (
              <button type="button" onClick={() => setModalOpen(true)}
                className="inline-flex items-center gap-2 bg-primary text-black font-black border-3 border-line-strong rounded-sm px-4 py-2 shadow-[3px_3px_0_#141413]">
                <Plus size={18} strokeWidth={3} /> Tạo báo hỏng mới
              </button>
            )}
            <button type="button" onClick={reload} aria-label="Tải lại" title="Tải lại dữ liệu"
              className="inline-flex items-center justify-center size-11 bg-surface border-3 border-line-strong rounded-sm shadow-[2px_2px_0_#141413] hover:shadow-[4px_4px_0_#141413] hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all cursor-pointer">
              <RefreshCw size={18} strokeWidth={2.5} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
          {loading ? <Loading /> : error ? null : visibleRequests.length === 0 ? (
            <Empty text="Không tìm thấy yêu cầu báo hỏng nào." />
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 p-4">
              {visibleRequests.map((request) => (
                <article key={request.id} className="border-3 border-line-strong rounded-sm bg-surface p-4 shadow-[3px_3px_0_#141413] space-y-3">
                  {request.imageUrl && <img src={request.imageUrl} alt={request.title} className="w-full h-40 object-cover rounded-sm border-2 border-line-strong" />}
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="font-black text-text break-words">{request.title}</h2>
                    <StatusBadge status={request.status} />
                  </div>
                  <p className="text-sm font-semibold text-text-muted whitespace-pre-wrap break-words">{request.description}</p>
                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-bold text-text-muted">
                    <span>{statusLabels[request.status] || request.status} · {priorityLabels[request.priority] || request.priority} · {getDateLabel(request.createdAt)}</span>
                    <Link to={`/student/maintenance/${request.id}`} className="inline-flex items-center gap-1 px-3 py-1.5 bg-surface text-text font-extrabold text-xs rounded-sm border-2 border-line-strong shadow-[2px_2px_0_#141413] hover:bg-primary hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all"><Eye size={14} strokeWidth={2.5} />Chi tiết</Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      {modalOpen && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !busy) resetAndClose();
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="maintenance-modal-title"
            className="box-border w-[500px] max-w-[95vw] max-h-[92vh] overflow-y-auto bg-surface border-3 border-line-strong rounded-sm p-5 sm:p-6 shadow-[6px_6px_0_#141413]"
          >
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <h2
                  id="maintenance-modal-title"
                  className="w-full block leading-normal text-lg font-black text-text"
                >
                  Tạo yêu cầu báo hỏng
                </h2>
                <p className="w-full block leading-normal mt-1 text-xs font-bold text-text-muted">
                  Yêu cầu sẽ được gửi đến ban quản lý khu nội trú.
                </p>
              </div>
              <button
                type="button"
                disabled={busy}
                onClick={resetAndClose}
                aria-label="Đóng"
                className="p-1 border-2 border-transparent hover:border-line-strong rounded-sm text-text-muted hover:text-text transition-all outline-none! disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={submitRequest} className="space-y-4">
              <label className="block space-y-2 text-sm font-extrabold text-text">
                <span>Tên thiết bị / Sự cố</span>
                <input
                  required
                  maxLength={150}
                  value={form.title}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                  placeholder="VD: Quạt trần, vòi nước, đèn học..."
                  className={inputClass}
                />
              </label>

              <label className="block space-y-2 text-sm font-extrabold text-text">
                <span>Mô tả chi tiết</span>
                <textarea
                  required
                  maxLength={2000}
                  rows={4}
                  value={form.description}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  placeholder="Mô tả tình trạng hư hỏng và vị trí thiết bị..."
                  className={`${inputClass} resize-y`}
                />
              </label>

              <div className="space-y-2 text-sm font-extrabold text-text">
                <span>Mức độ khẩn cấp</span>
                <CustomSelect
                  value={form.priority}
                  onChange={(priority) =>
                    setForm((current) => ({ ...current, priority }))
                  }
                  options={[
                    { value: "MEDIUM", label: "Bình thường" },
                    { value: "URGENT", label: "Khẩn cấp" },
                  ]}
                />
              </div>

              <div className="space-y-2 text-sm font-extrabold text-text">
                <span>
                  Hình ảnh thực tế{" "}
                  <span className="font-semibold text-text-muted">
                    (không bắt buộc)
                  </span>
                </span>
                {!imageFile ? (
                  <label
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={dropImage}
                    className="block cursor-pointer bg-surface border-3 border-dashed border-line-strong rounded-sm p-3 font-bold text-sm text-center shadow-[3px_3px_0_#141413] hover:bg-surface-2 transition-all"
                  >
                    📁 Chọn ảnh chụp sự cố
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={selectImage}
                      className="sr-only"
                    />
                  </label>
                ) : (
                  <div className="flex items-center justify-between gap-3 p-3 bg-surface-2 border-3 border-line-strong rounded-sm shadow-[3px_3px_0_#141413] mt-2">
                    <div className="flex min-w-0 items-center gap-2 font-bold text-sm text-text">
                      <FileImage size={20} className="shrink-0" />
                      <span className="truncate">{imageFile.name}</span>
                      <span className="shrink-0 text-xs text-text-muted font-semibold">
                        ({formatFileSize(imageFile.size)})
                      </span>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setLightboxOpen(true)}
                        className="inline-flex items-center gap-1.5 bg-primary text-black border-2 border-line-strong rounded-sm px-2.5 py-2 text-xs! font-black shadow-[2px_2px_0_#141413] hover:-translate-0.5 hover:shadow-[3px_3px_0_#141413] active:translate-0.5 active:shadow-none transition-all outline-none!"
                      >
                        <Eye size={15} /> Xem ảnh
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => {
                          setImageFile(null);
                          setPreviewUrl("");
                        }}
                        className="inline-flex items-center gap-1.5 bg-error text-white border-2 border-line-strong rounded-sm px-2.5 py-2 text-xs! font-black shadow-[2px_2px_0_#141413] hover:-translate-0.5 hover:shadow-[3px_3px_0_#141413] active:translate-0.5 active:shadow-none transition-all outline-none! disabled:opacity-50"
                      >
                        <Trash2 size={15} /> Xóa
                      </button>
                    </div>
                  </div>
                )}
                <p className="text-xs font-semibold text-text-muted">
                  (Định dạng JPG, PNG, WEBP - Tối đa {MAX_FILE_SIZE_MB} MB)
                </p>
              </div>

              <div className="flex justify-end gap-3 border-t-3 border-line-strong pt-4">
                <button
                  type="button"
                  disabled={busy}
                  onClick={resetAndClose}
                  className="border-3 border-line-strong bg-surface rounded-sm px-4 py-2 text-sm! font-extrabold! text-text shadow-[3px_3px_0_#141413] hover:-translate-0.5 hover:shadow-[3px_3px_0_#141413] active:translate-0.5 active:shadow-none transition-all outline-none! disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="inline-flex items-center gap-2 border-3 border-line-strong bg-primary text-black rounded-sm px-4 py-2 text-sm! font-black! shadow-[3px_3px_0_#141413] hover:-translate-0.5 hover:shadow-[3px_3px_0_#141413] active:translate-0.5 active:shadow-none transition-all outline-none! disabled:opacity-50"
                >
                  {busy ? (
                    <>
                      <LoaderCircle size={17} className="animate-spin" /> Đang
                      gửi...
                    </>
                  ) : (
                    "Gửi yêu cầu"
                  )}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {lightboxOpen && previewUrl && (
        <div
          className="fixed inset-0 z-110 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setLightboxOpen(false);
          }}
        >
          <div className="relative box-border w-240 max-w-[95vw] border-3 border-line-strong bg-surface rounded-sm p-4 shadow-[6px_6px_0_#141413] flex flex-col items-center justify-center">
            <button
              type="button"
              aria-label="Đóng xem ảnh"
              onClick={() => setLightboxOpen(false)}
              className="absolute -right-3 -top-3 z-10 bg-surface border-3 border-line-strong rounded-full p-1.5 shadow-[2px_2px_0_#141413] hover:bg-error transition-all outline-none! cursor-pointer"
            >
              <X size={18} />
            </button>
            <img
              src={previewUrl}
              alt="Ảnh chụp sự cố kích thước đầy đủ"
              className="max-h-[80vh] max-w-full object-contain mx-auto block rounded-xs"
            />
          </div>
        </div>
      )}
    </Workspace>
  );
}
