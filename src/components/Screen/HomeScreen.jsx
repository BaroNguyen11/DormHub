// ====================================
// HOME SCREEN - Neo-Brutalism Design
// ====================================
// Bold borders, strong shadows, neon colors, geometric shapes

import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowRight, Home, FileText, CreditCard, Wrench } from "lucide-react";
import { Button } from "../ui/button";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
  }
};

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
      <section className="min-h-[calc(100vh-74px)] bg-gradient-to-br from-[#f5f7fa] to-[#e4e8ec] relative overflow-hidden">
        {/* Background geometric patterns - Neo-Brutalism BOLD */}
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          <div className="absolute top-20 left-20 w-64 h-64 border-4 border-[#00d2ff] rotate-12" />
          <div className="absolute bottom-20 right-20 w-48 h-48 border-4 border-[#00ff88]" />
          <div className="absolute top-1/2 right-1/4 w-32 h-32 border-4 border-[#ff6b6b] -rotate-12" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-8 lg:px-16 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left - Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-block px-4 py-2 mb-6 bg-[#00d2ff] text-white text-xs font-extrabold uppercase tracking-widest rounded-[var(--radius-md)] shadow-[4px_4px_0_rgba(0,0,0,0.25)] border-3 border-[#000000]">
                Student Residence
              </div>
              
              <h1 className="font-extrabold text-5xl lg:text-7xl text-[#1a1a1a] leading-[1.1] mb-8">
                Chỗ ở an tâm.<br />
                <span className="text-[#00d2ff]">Hành trình học tập</span>
                <br />
                trọn vẹn.
              </h1>
              
              <p className="text-lg text-[#4b5563] mb-10 leading-relaxed max-w-lg font-medium">
                Tìm phòng phù hợp, đăng ký nội trú và theo dõi cuộc sống ký túc xá
                thuận tiện cùng DormHub.
              </p>
              
              <div className="flex flex-wrap gap-4">
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
            </motion.div>
            
            {/* Right - Neo-Brutalism geometric blocks */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="relative h-[500px] hidden lg:block"
            >
              <div className="grid grid-cols-3 gap-4 h-full">
                {/* Large block - top left */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                  className="col-span-2 row-span-2 bg-gradient-to-br from-[#00d2ff] to-[#00b8e6] border-4 border-[#000000] rounded-[var(--radius-lg)] flex items-center justify-center shadow-[8px_8px_0_rgba(0,0,0,0.25)] hover:shadow-[12px_12px_0_rgba(0,0,0,0.3)] hover:-translate-y-2 transition-all duration-300"
                >
                  <Home size={80} className="text-white opacity-90" />
                </motion.div>
                
                {/* Small block - top right */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.4 }}
                  className="bg-gradient-to-br from-[#00ff88] to-[#00e677] border-4 border-[#000000] rounded-[var(--radius-lg)] shadow-[6px_6px_0_rgba(0,0,0,0.25)] hover:shadow-[8px_8px_0_rgba(0,0,0,0.3)] hover:-translate-y-2 transition-all duration-300"
                />
                
                {/* Small block - middle right */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.4 }}
                  className="bg-gradient-to-br from-[#ffcc00] to-[#e6b800] border-4 border-[#000000] rounded-[var(--radius-lg)] shadow-[6px_6px_0_rgba(0,0,0,0.25)] hover:shadow-[8px_8px_0_rgba(0,0,0,0.3)] hover:-translate-y-2 transition-all duration-300"
                />
                
                {/* Medium block - bottom left */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.4 }}
                  className="bg-gradient-to-br from-[#ff6b6b] to-[#ff5252] border-4 border-[#000000] rounded-[var(--radius-lg)] shadow-[6px_6px_0_rgba(0,0,0,0.25)] hover:shadow-[8px_8px_0_rgba(0,0,0,0.3)] hover:-translate-y-2 transition-all duration-300"
                />
                
                {/* Large block - bottom right */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9, duration: 0.4 }}
                  className="col-span-2 bg-gradient-to-br from-[#ff3366] to-[#e62b59] border-4 border-[#000000] rounded-[var(--radius-lg)] shadow-[6px_6px_0_rgba(0,0,0,0.25)] hover:shadow-[8px_8px_0_rgba(0,0,0,0.3)] hover:-translate-y-2 transition-all duration-300"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Features Section - Neo-Brutalism */}
      <section className="bg-white py-24 border-t-4 border-[#333333]">
        <div className="max-w-7xl mx-auto px-8 lg:px-16">
          {/* Section header */}
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 mb-4 bg-[#ffe8e8] text-[#ff6b6b] text-xs font-extrabold uppercase tracking-widest rounded-[var(--radius-md)] border-3 border-[#ff6b6b] shadow-[3px_3px_0_rgba(0,0,0,0.2)]">
              Tính năng
            </div>
            <h2 className="font-extrabold text-4xl lg:text-5xl text-[#1a1a1a] mb-4">
              Mọi thứ bạn cần, một nơi duy nhất
            </h2>
            <p className="text-xl text-[#4b5563] font-medium">
              Quản lý cuộc sống ký túc xá dễ dàng hơn bao giờ hết
            </p>
          </div>
          
          {/* Feature grid - Neo-Brutalism cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, description }, idx) => {
              const colorMap = [
                { bg: '#00d2ff', border: '#000000', light: '#e0f7ff' },
                { bg: '#00ff88', border: '#000000', light: '#e0f7e8' },
                { bg: '#ffcc00', border: '#000000', light: '#fffbe0' },
                { bg: '#ff6b6b', border: '#000000', light: '#ffe8e8' }
              ];
              const colors = colorMap[idx % colorMap.length];
              return (
                <motion.div 
                  key={title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  className="bg-white border-3 border-[#333333] rounded-[var(--radius-lg)] p-8 shadow-[6px_6px_0_rgba(0,0,0,0.15)] hover:shadow-[8px_8px_0_rgba(0,0,0,0.25)] hover:-translate-y-2 transition-all duration-300"
                  style={{ '--hover-border': colors.border }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = colors.bg}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = '#333333'}
                >
                  <div className="w-16 h-16 rounded-[var(--radius-md)] flex items-center justify-center mb-6 shadow-[4px_4px_0_rgba(0,0,0,0.2)] border-3" style={{ backgroundColor: colors.bg, borderColor: colors.border }}>
                    <Icon size={32} className="text-white" />
                  </div>
                  <h3 className="font-extrabold text-xl text-[#1a1a1a] mb-3">
                    {title}
                  </h3>
                  <p className="text-[#4b5563] leading-relaxed font-medium">
                    {description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
