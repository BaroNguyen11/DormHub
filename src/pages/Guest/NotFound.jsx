import { useNavigate } from "react-router-dom";
import { ArrowLeft, Compass, Home } from "lucide-react";
import useAuth from "../../hooks/useAuth";

export default function NotFound() {
  const navigate = useNavigate();
  const { role } = useAuth();
  const homePath =
    role === "MANAGER" ? "/manager" : role === "STUDENT" ? "/student" : "/";

  return (
    <main className="min-h-screen grid place-items-center bg-surface-2 p-6">
      <section className="w-full md:w-150 box-border text-center">
        <span className="mb-4 inline-flex rounded-sm border-3 border-line-strong bg-error px-4 py-1 text-sm font-black text-white shadow-[3px_3px_0_#141413]">
          404 ERROR
        </span>

        <h1 className="mb-3 text-3xl font-black leading-tight text-text sm:text-4xl">
          Trang bạn tìm kiếm không tồn tại!
        </h1>
        <p className="mb-6 text-sm font-bold leading-relaxed text-text-muted sm:text-base">
          Đường dẫn có thể đã bị đổi hoặc không còn hoạt động trên hệ thống
          DormHub.
        </p>

        <div className="mb-7 border-4 border-line-strong bg-surface rounded-sm p-8 text-center shadow-[8px_8px_0_#141413]">
          <div className="mx-auto mb-5 grid size-24 place-items-center border-3 border-line-strong bg-warning rounded-sm shadow-[4px_4px_0_#141413]">
            <Compass size={52} strokeWidth={2.5} className="text-text" />
          </div>
          <p className="m-0 text-sm font-extrabold text-text">
            Có vẻ bạn đã đi lạc khỏi khu nội trú.
          </p>
        </div>

        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => navigate(homePath, { replace: true })}
            className="inline-flex items-center justify-center gap-2 rounded-sm border-3 border-line-strong bg-primary px-6 py-2 font-black! text-black shadow-[4px_4px_0_#141413] hover:translate-y-0.5 hover:shadow-none transition-all cursor-pointer outline-none!"
          >
            <Home size={18} strokeWidth={2.5} />
            Quay lại Trang chủ / Tổng quan
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center gap-2 rounded-sm border-3 border-line-strong bg-surface px-6 py-2 font-bold! text-black shadow-[4px_4px_0_#141413] hover:bg-surface-2 hover:translate-y-0.5 hover:shadow-none transition-all cursor-pointer outline-none!"
          >
            <ArrowLeft size={18} strokeWidth={2.5} />
            Quay lại trang trước
          </button>
        </div>
      </section>
    </main>
  );
}
