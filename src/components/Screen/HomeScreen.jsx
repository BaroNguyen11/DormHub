// ====================================
// HOME SCREEN - Màn hình trang chủ
// ====================================
// Hiển thị hero section và feature grid cho trang landing
// Mục đích: Giới thiệu hệ thống và các tính năng chính

import { Link } from "react-router-dom";
import {
  ArrowRight,
  Home,
  FileText,
  CreditCard,
  Wrench,
} from "lucide-react";

/**
 * Component HomeScreen - Trang chủ của hệ thống
 * Hiển thị:
 * 1. Hero section: Tiêu đề lớn, mô tả, và CTA buttons
 * 2. Feature grid: 4 tính năng chính của hệ thống
 */
export default function HomeScreen() {
  // Danh sách features: [Icon, Title, Description]
  const features = [
    [
      Home,
      "Tìm phòng dễ dàng",
      "Xem sức chứa, vị trí và mức phí trước khi chọn.",
    ],
    [
      FileText,
      "Đăng ký minh bạch",
      "Theo dõi hồ sơ từ khi nộp đến khi được phân phòng.",
    ],
    [
      CreditCard,
      "Tài chính rõ ràng",
      "Xem hóa đơn và trạng thái thanh toán ở một nơi.",
    ],
    [
      Wrench,
      "Hỗ trợ kịp thời",
      "Gửi yêu cầu sửa chữa và theo dõi tiến độ.",
    ],
  ];

  return (
    <>
      {/* Hero Section */}
      <div className="hero">
        <div>
          {/* Eyebrow text - text nhỏ phía trên */}
          <p className="eyebrow">STUDENT RESIDENCE · CAMPUS LIVING</p>
          
          {/* Heading chính */}
          <h1>
            Chỗ ở an tâm.
            <br />
            Hành trình học tập trọn vẹn.
          </h1>
          
          {/* Mô tả ngắn */}
          <p>
            Tìm phòng phù hợp, đăng ký nội trú và theo dõi cuộc sống ký túc xá
            thuận tiện cùng DormHub.
          </p>
          
          {/* CTA Buttons */}
          <div className="hero-actions">
            {/* Primary CTA: Khám phá phòng */}
            <Link to="/rooms" className="button primary">
              Khám phá phòng <ArrowRight size={16} />
            </Link>
            
            {/* Secondary CTA: Kích hoạt tài khoản */}
            <Link to="/verify-email" className="button light">
              Kích hoạt tài khoản
            </Link>
          </div>
        </div>
        
        {/* Hero Art - Illustration bên phải */}
        <div className="hero-art">
          {/* Sun decoration */}
          <div className="sun" />
          
          {/* Building illustration với 12 windows */}
          <div className="building-art">
            {Array.from({ length: 12 }, (_, i) => (
              <i key={i} />
            ))}
          </div>
          
          {/* Caption text */}
          <div className="art-caption">A place to belong.</div>
        </div>
      </div>
      
      {/* Feature Grid - 4 tính năng chính */}
      <div className="feature-grid">
        {features.map(([Icon, title, description]) => (
          <div className="feature" key={title}>
            {/* Icon của feature */}
            <Icon size={22} />
            
            {/* Tiêu đề feature */}
            <h3>{title}</h3>
            
            {/* Mô tả feature */}
            <p>{description}</p>
          </div>
        ))}
      </div>
    </>
  );
}
