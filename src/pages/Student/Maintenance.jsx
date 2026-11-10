import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

const MAX_FILE_SIZE_MB = 10;

const inputClass =
  "w-full border-3 border-line-strong bg-surface rounded-sm px-4 py-2 text-sm font-bold text-text shadow-[3px_3px_0_#141413] focus:shadow-[4px_4px_0_#141413] outline-none! transition-all";
const statusLabels = {
  PENDING: "Đang chờ xử lý",
  IN_PROGRESS: "Đang xử lý",
  COMPLETED: "Đã hoàn thành",
  REJECTED: "Đã từ chối",
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
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [reloadVersion, setReloadVersion] = useState(0);
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

  const loadRequests = useCallback(async () => {
    try {
      const result = await resources.list("/student/maintenance", {
        page: 0,
        size: 50,
      });
      setRequests(asList(result));
    } catch {
      // API client displays request errors globally.
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadRequests();
  }, [loadRequests, reloadVersion]);

  useEffect(() => {
    if (!previewUrl.startsWith("blob:")) return undefined;
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const visibleRequests = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("vi");
    if (!query) return requests;
    return requests.filter((request) =>
      [request.title, request.description, request.type, request.status]
        .filter(Boolean)
        .some((value) => String(value).toLocaleLowerCase("vi").includes(query)),
    );
  }, [requests, search]);

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

      const created = await resources.create("/student/maintenance", {
        title: assetName,
        assetName,
        description,
        priority: form.priority,
        type: inferType(assetName),
        imageUrl: imageUrl || null,
      });

      toast.success("Tạo yêu cầu báo hỏng thành công!");
      resetAndClose();
      if (created)
        setRequests((current) => [
          created,
          ...current.filter((item) => item.id !== created.id),
        ]);
      setRefreshing(true);
      setReloadVersion((version) => version + 1);
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

        <section className="bg-surface border-4 border-line-strong rounded-sm shadow-[5px_5px_0_#141413] overflow-hidden">
          <div className="flex flex-col items-center sm:flex-row gap-3 p-4 bg-surface-2 border-b-4 border-line-strong">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted"
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Tìm theo thiết bị, mô tả hoặc trạng thái..."
                className={`${inputClass} pl-10`}
              />
            </div>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="inline-flex shrink-0 items-center text-sm! justify-center gap-2 bg-primary text-black font-black! border-3 border-line-strong rounded-sm px-4 py-2 shadow-[3px_3px_0_#141413] hover:shadow-[5px_5px_0_#141413] hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all outline-none!"
            >
              <Plus size={18} strokeWidth={3} /> Tạo báo hỏng mới
            </button>
            <button
              type="button"
              onClick={() => {
                setRefreshing(true);
                setReloadVersion((version) => version + 1);
              }}
              aria-label="Tải lại danh sách"
              className="size-10 shrink-0 grid place-items-center bg-surface border-3 border-line-strong rounded-sm shadow-[2px_2px_0_#141413] hover:bg-warning transition-all outline-none!"
            >
              <RefreshCw
                size={18}
                className={refreshing ? "animate-spin" : ""}
              />
            </button>
          </div>

          {loading ? (
            <div className="p-12 text-center font-extrabold text-text-muted">
              Đang tải danh sách...
            </div>
          ) : visibleRequests.length === 0 ? (
            <div className="p-12 text-center font-extrabold text-text-muted">
              {search
                ? "Không tìm thấy yêu cầu phù hợp."
                : "Bạn chưa có yêu cầu báo hỏng nào."}
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 p-4">
              {visibleRequests.map((request) => (
                <article
                  key={request.id}
                  className="flex gap-4 bg-surface border-3 border-line-strong rounded-sm p-4 shadow-[3px_3px_0_#141413]"
                >
                  {request.imageUrl && (
                    <img
                      src={request.imageUrl}
                      alt={`Ảnh sự cố: ${request.title}`}
                      className="size-24 shrink-0 object-cover border-2 border-line-strong rounded-sm"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <h2 className="font-black text-text">
                        {request.title || "Yêu cầu báo hỏng"}
                      </h2>
                      <span
                        className={`px-2 py-1 border-2 border-line-strong rounded-xs text-xs font-extrabold shadow-[1.5px_1.5px_0_#141413] ${request.status === "PENDING" ? "bg-warning text-black" : request.status === "REJECTED" ? "bg-error text-white" : request.status === "COMPLETED" ? "bg-success text-black" : "bg-primary text-black"}`}
                      >
                        {statusLabels[request.status] || request.status}
                      </span>
                    </div>
                    <p className="mt-2 text-sm font-semibold text-text-muted line-clamp-3">
                      {request.description}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-extrabold text-text-muted">
                      <span>
                        Mức độ:{" "}
                        {request.priority === "URGENT"
                          ? "Khẩn cấp"
                          : "Bình thường"}
                      </span>
                      <span>{getDateLabel(request.createdAt)}</span>
                    </div>
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
