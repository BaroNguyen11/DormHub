import { Link } from "react-router-dom";
import { motion } from "motion/react";
import {
  ArrowRight,
  Home,
  FileText,
  CreditCard,
  Wrench,
  Zap,
  MapPin,
  Bus,
  ShieldCheck,
  Sparkles,
  Search,
  Building2,
  Wind,
  CircleDollarSign,
  Camera,
  Clock,
} from "lucide-react";
import { Button } from "../ui/button";

const ROOM_MAP = [
  "free",
  "taken",
  "free",
  "taken",
  "taken",
  "hold",
  "free",
  "taken",
];

const CELL_COLOR = {
  free: "bg-accent",
  hold: "bg-warning",
  taken: "bg-gray-300",
};

const FEATURES = [
  { icon: MapPin, title: "Gần trường", desc: "Đi bộ đến lớp" },
  { icon: Bus, title: "Gần xe bus", desc: "Đi lại thuận tiện" },
  { icon: ShieldCheck, title: "An ninh", desc: "Khu ở được bảo vệ" },
];

const card =
  "border-4 border-line-strong rounded-2xl shadow-[6px_6px_0_#141413] hover:shadow-[9px_9px_0_#141413] hover:-translate-0.5 transition-all duration-300";

export default function HomeScreen() {
  const features = [
    {
      icon: Home,
      title: "Tìm phòng dễ dàng",
      description: "Xem sức chứa, vị trí và mức phí trước khi chọn.",
    },
    {
      icon: FileText,
      title: "Đăng ký minh bạch",
      description: "Theo dõi hồ sơ từ khi nộp đến khi được phân phòng.",
    },
    {
      icon: CreditCard,
      title: "Tài chính rõ ràng",
      description: "Xem hóa đơn và trạng thái thanh toán ở một nơi.",
    },
    {
      icon: Wrench,
      title: "Hỗ trợ kịp thời",
      description: "Gửi yêu cầu sửa chữa và theo dõi tiến độ.",
    },
  ];

  return (
    <>
      {/* Hero Section - Neo-Brutalism */}
      <section className="min-h-[calc(100vh-74px)] bg-linear-to-br from-bg to-[#e4e8ec] relative overflow-hidden">
        {/* Pattern trang trí nền */}
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          <div className="absolute top-20 left-20 w-64 h-64 border-4 border-[#00d2ff] rotate-12" />
          <div className="absolute bottom-20 right-20 w-48 h-48 border-4 border-success" />
        </div>

        <div className="relative max-w-7xl mx-auto px-8 lg:px-16 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >

              <h1 className="font-extrabold text-5xl lg:text-7xl text-[#1a1a1a] leading-[1.1] mb-8">
                Chỗ ở an tâm
                <br />
                <span className="text-[#00d2ff]">Hành trình học tập </span>
                trọn vẹn.
              </h1>

              <p className="text-lg text-[#4b5563] mb-10 leading-relaxed font-medium">
                Tìm phòng phù hợp, đăng ký nội trú và theo dõi cuộc sống ký túc
                xá thuận tiện cùng DormHub.
              </p>

              <div className="flex flex-wrap gap-4 mb-8">
                <Link to="/rooms">
                  <Button variant="primary" size="lg">
                    Khám phá phòng
                    <ArrowRight size={18} />
                  </Button>
                </Link>
                <Link to="/verify-email">
                  <Button variant="outline" size="lg">
                    Kích hoạt tài khoản
                  </Button>
                </Link>
              </div>

              {/* Social Proof */}
              <div className="text-sm font-extrabold text-[#1a1a1a] flex items-center gap-2">
                <span className="text-amber-500">⚡</span>
                <span>500+ sinh viên đã đăng ký · 5 khu KTX</span>
              </div>
            </motion.div>

            {/* Right - Neo-Brutalism Bento Grid */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="relative hidden lg:flex flex-col gap-5 w-full"
            >
              {/* Hàng 1: Thẻ Ảnh (7 cột) + Thẻ Nhỏ (5 cột) */}
              <div className="grid grid-cols-12 gap-5 items-stretch">
                {/* Thẻ Ảnh Phòng KTX */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                  className={`col-span-7 relative overflow-hidden bg-white min-h-77.5 flex flex-col ${card}`}
                >
                  <img
                    src="/banner.png"
                    alt="Phòng ký túc xá"
                    className="w-full h-full object-cover"
                  />

                  {/* Thẻ nổi 1: Giá phòng */}
                  <div className="absolute top-3 left-3 bg-[#00d2ff] text-black text-xs font-extrabold px-3 py-1.5 rounded-lg border-2 border-line-strong shadow-[3px_3px_0_#141413]">
                    Phòng 4 người · 450k/tháng
                  </div>

                  {/* Thẻ nổi 3: Khoảng cách */}
                  <div className="absolute bottom-3 left-3 bg-white text-black text-xs font-extrabold px-3 py-1.5 rounded-lg border-2 border-line-strong shadow-[3px_3px_0_#141413]">
                    Cách trường 5p đi bộ
                  </div>
                </motion.div>

                {/* Cột phải: Thanh toán + Sơ đồ phòng */}
                <div className="col-span-5 flex flex-col gap-5 justify-between">
                  {/* Card Thanh toán 1-click */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.4 }}
                    className={`bg-warning p-4 flex-1 flex flex-col justify-center ${card}`}
                  >
                    <div className="items-center gap-2">
                      <h3 className="text-base font-extrabold leading-tight">
                        Thanh toán 1-click
                      </h3>
                    </div>
                    <p className="mt-1.5 text-xs font-bold text-black/80">
                      Đóng tiền điện/nước & phòng ngay trên điện thoại
                    </p>
                  </motion.div>

                  {/* Card Sơ đồ phòng */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7, duration: 0.4 }}
                    className={`bg-white p-4 flex-1 flex flex-col justify-between ${card}`}
                  >
                    <h3 className="text-sm font-extrabold mb-2 text-black">
                      Sơ đồ phòng trực quan
                    </h3>
                    <div className="grid grid-cols-4 gap-1.5 mb-2">
                      {ROOM_MAP.map((s, i) => (
                        <div
                          key={i}
                          className={`h-7 rounded-md border-2 border-line-strong transition-transform hover:scale-105 ${CELL_COLOR[s]}`}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-bold text-black">
                      {[
                        ["bg-accent", "Trống"],
                        ["bg-warning", "Giữ chỗ"],
                        ["bg-gray-300", "Đã ở"],
                      ].map(([c, t]) => (
                        <span key={t} className="flex items-center gap-1">
                          <span
                            className={`inline-block size-2.5 rounded-xs border border-line-strong ${c}`}
                          />
                          {t}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Hàng 2: Dải lợi ích (Full Width cân bằng tuyệt đối) */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.4 }}
                className={`bg-accent px-6 py-4 flex items-center justify-between gap-4 ${card}`}
              >
                {FEATURES.map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="flex items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-line-strong bg-white shadow-[2px_2px_0_#141413]">
                      <Icon
                        size={18}
                        strokeWidth={2.5}
                        className="text-black"
                      />
                    </div>
                    <div>
                      <b className="block text-xs md:text-sm font-extrabold text-black leading-tight">
                        {title}
                      </b>
                      <span className="text-[11px] font-bold text-black/75 block">
                        {desc}
                      </span>
                    </div>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section - Neo-Brutalism Bento Grid */}
      <section className="bg-white py-20 border-t-4 border-line-strong">
        <div className="max-w-7xl mx-auto px-8 lg:px-16">
          {/* Section Header - Căn trái cá tính hơn */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <div className="inline-flex items-center gap-1 px-3 py-1 mb-3 bg-warning text-black text-xs font-extrabold uppercase tracking-widest rounded-md border-2 border-line-strong shadow-[3px_3px_0_#141413]">
                <Sparkles size={18}/> TÍNH NĂNG NỔI BẬT
              </div>
              <h2 className="font-extrabold text-3xl lg:text-5xl text-[#1a1a1a] leading-tight">
                Giải quyết mọi thủ tục 
                <span className="text-primary"> chỉ trong vài cú click.</span>
              </h2>
            </div>
          </div>

          {/* Bento Grid Features Layout */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* FEATURE 1: Card Rộng (Col span 2) - Tìm phòng */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="lg:col-span-2 bg-[#e0f7ff] border-4 border-line-strong rounded-2xl p-7 shadow-[6px_6px_0_#141413] hover:shadow-[9px_9px_0_#141413] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between gap-6"
            >
              <div className="flex justify-between items-start">
                <div className="size-12 rounded-xl bg-white border-3 border-line-strong flex items-center justify-center font-extrabold text-xl shadow-[3px_3px_0_#141413]">
                  01
                </div>
                <span className="flex items-center gap-1 px-3 py-1 bg-white rounded-full border-2 border-line-strong text-xs font-bold shadow-[2px_2px_0_#141413]">
                  <Search size={14} strokeWidth={3} /> Trực quan 100%
                </span>
              </div>

              <div>
                <h3 className="font-extrabold text-2xl text-black mb-2">
                  Tìm & Giữ chỗ phòng KTX
                </h3>
                <p className="text-text-muted font-medium text-sm  leading-relaxed">
                  Xem rõ sơ đồ phòng, danh sách bạn cùng phòng, tiện nghi (máy
                  lạnh, ban công) và giá tiền công khai trước khi đăng ký.
                </p>
              </div>

              {/* Mini UI Demo đè lên Card */}
              <div className="flex flex-wrap gap-2 pt-2 border-t-2 border-black/10">
                <span className="flex items-center gap-0.5 px-3 py-1 bg-white rounded-lg border-2 border-line-strong text-xs font-bold text-black">
                  <Building2 size={16} strokeWidth={2}/> Dãy nhà A2
                </span>
                <span className="flex items-center gap-0.5 px-3 py-1 bg-success rounded-lg border-2 border-line-strong text-xs font-bold text-black">
                  <Wind size={16} strokeWidth={2}/> Có Máy lạnh
                </span>
                <span className="flex items-center gap-0.5 px-3 py-1 bg-warning rounded-lg border-2 border-line-strong text-xs font-bold text-black">
                  <CircleDollarSign size={16} strokeWidth={2}/> 450.000đ/tháng
                </span>
              </div>
            </motion.div>

            {/* FEATURE 2: Đăng ký minh bạch */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="bg-white border-4 border-line-strong rounded-2xl p-7 shadow-[6px_6px_0_#141413] hover:shadow-[9px_9px_0_#141413] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between gap-6"
            >
              <div className="flex justify-between items-start">
                <div className="size-12 rounded-xl bg-success-light border-3 border-line-strong flex items-center justify-center font-extrabold text-xl shadow-[3px_3px_0_#141413]">
                  02
                </div>
                <span className="flex items-center gap-1 px-3 py-1 bg-success text-black rounded-full border-2 border-line-strong text-xs font-bold shadow-[2px_2px_0_#141413]">
                  <Zap size={17} fill="#fecd00"/> Phê duyệt nhanh
                </span>
              </div>

              <div>
                <h3 className="font-extrabold text-xl text-black mb-2">
                  Xét duyệt hồ sơ Online
                </h3>
                <p className="text-text-muted font-medium text-sm leading-relaxed">
                  Nộp giấy tờ đối tượng ưu tiên, theo dõi trạng thái hồ sơ theo
                  thời gian thực không lo thất lạc.
                </p>
              </div>

              <div className="bg-[#f8f9fa] p-3 rounded-xl border-2 border-line-strong flex items-center gap-3">
                <div className="size-3 rounded-full bg-success animate-pulse" />
                <span className="text-xs font-extrabold text-black">
                  Trạng thái: Đã tiếp nhận hồ sơ
                </span>
              </div>
            </motion.div>

            {/* FEATURE 3: Quản lý tài chính */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="bg-white border-4 border-line-strong rounded-2xl p-7 shadow-[6px_6px_0_#141413] hover:shadow-[9px_9px_0_#141413] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between gap-6"
            >
              <div className="flex justify-between items-start">
                <div className="size-12 rounded-xl bg-warning-light border-3 border-line-strong flex items-center justify-center font-extrabold text-xl shadow-[3px_3px_0_#141413]">
                  03
                </div>
                <span className="flex items-center gap-1 px-3 py-1 bg-warning text-black rounded-full border-2 border-line-strong text-xs font-bold shadow-[2px_2px_0_#141413]">
                  <CreditCard size={17} strokeWidth={2.5}/> QR Code 1-touch
                </span>
              </div>

              <div>
                <h3 className="font-extrabold text-xl text-black mb-2">
                  Hóa đơn & Điện nước
                </h3>
                <p className="text-text-muted font-medium text-sm leading-relaxed">
                  Nhận thông báo chỉ số điện nước hàng tháng, gạch nợ tự động
                  ngay sau khi chuyển khoản.
                </p>
              </div>

              <div className="bg-warning-light px-3 py-2 rounded-xl border-2 border-line-strong flex justify-between items-center text-xs font-extrabold">
                <span>Tiền điện T10: 120.000đ</span>
                <span className="text-emerald-700">✓ Đã thu</span>
              </div>
            </motion.div>

            {/* FEATURE 4: Card Rộng (Col span 2) - Báo sự cố */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="lg:col-span-2 bg-[#ffe8e8] border-4 border-line-strong rounded-2xl p-7 shadow-[6px_6px_0_#141413] hover:shadow-[9px_9px_0_#141413] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between gap-6"
            >
              <div className="flex justify-between items-start">
                <div className="size-12 rounded-xl bg-white border-3 border-line-strong flex items-center justify-center font-extrabold text-xl shadow-[3px_3px_0_#141413]">
                  04
                </div>
                <span className="flex items-center gap-1 px-3 py-1 bg-accent text-white rounded-full border-2 border-line-strong text-xs font-bold shadow-[2px_2px_0_#141413]">
                  <Wrench size={16} strokeWidth={2.5} /> Kỹ thuật 24/7
                </span>
              </div>

              <div>
                <h3 className="font-extrabold text-2xl text-black mb-2">
                  Gửi yêu cầu sửa chữa thiết bị
                </h3>
                <p className="text-text-muted font-medium text-sm  leading-relaxed">
                  Hỏng bóng đèn, vòi nước rỉ hay wifi yếu? Chỉ cần chụp ảnh gửi
                  ticket, ban quản lý KTX sẽ phân công thợ sửa chữa trong 24h.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 px-4 py-2 bg-white rounded-xl border-2 border-line-strong text-xs font-extrabold text-black shadow-[2px_2px_0_#141413]">
                  <Camera size={16} strokeWidth={2.5}/> Chụp ảnh sự cố
                </div>
                <div className="flex items-center gap-1 px-4 py-2 bg-white rounded-xl border-2 border-line-strong text-xs font-extrabold text-black shadow-[2px_2px_0_#141413]">
                  <Clock size={16} strokeWidth={2.5}/> Phản hồi &lt; 24h
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
