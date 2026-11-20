// src/services/ai.service.js
import { api } from "../lib/api";

/**
 * Gửi tin nhắn chat tới AI thông qua Backend Spring Boot (/api/v1/ai/chat)
 * Tự động đính kèm cookie xác thực JWT và CSRF token.
 * 
 * @param {Array<{role: string, content: string}>} messages - Lịch sử hội thoại
 * @param {Object} [options={}] - Các cấu hình mở rộng (model, temperature, max_tokens, ...)
 * @returns {Promise<string>} Nội dung phản hồi từ AI
 */
export async function sendChatMessage(messages, options = {}) {
  try {
    if (!Array.isArray(messages) || messages.length === 0) {
      throw new Error("Messages phải là mảng không rỗng");
    }

    const payload = {
      messages,
      model: options.model,
      temperature: options.temperature || 0.7,
      maxTokens: options.max_tokens || options.maxTokens || 2000,
      ...options.extra,
    };

    // Gọi backend Spring Boot endpoint /api/v1/ai/chat
    const response = await api("/ai/chat", {
      method: "POST",
      body: payload,
      successNotify: false,
    });

    if (!response) {
      throw new Error("Không nhận được phản hồi từ AI");
    }

    const content = typeof response === "string"
      ? response
      : response.content || response.reply || response.data || JSON.stringify(response);

    return content;
  } catch (error) {
    console.error("❌ AI Service Error:", error);
    if (error?.message?.includes("fetch") || error?.status === 0) {
      throw new Error("Không thể kết nối tới máy chủ DormHub. Vui lòng kiểm tra lại dịch vụ Server!");
    }
    throw error;
  }
}

/**
 * Tạo system prompt cho chatbot trong DormHub
 * @param {string} role - User role (STUDENT hoặc MANAGER)
 * @param {Object} user - Thông tin user
 * @returns {string}
 */
export function createSystemPrompt(role, user) {
  const basePrompt = `Bạn là trợ lý AI thông minh của DormHub - hệ thống quản lý ký túc xá.

Vai trò của bạn:
- Hỗ trợ người dùng về các chức năng của hệ thống KTX DormHub
- Giải đáp thắc mắc về hóa đơn, hợp đồng, phòng, bảo trì
- Hướng dẫn sử dụng các tính năng
- Trả lời bằng tiếng Việt, thân thiện và chuyên nghiệp

**QUAN TRỌNG - Formatting rules:**
- Dùng **bold** cho keywords và actions quan trọng
- Dùng numbered lists (1. 2. 3.) cho steps
- Dùng bullet lists (- ) cho features/options
- Dùng ### cho section headings nếu response dài
- Dùng \`code\` cho tên menu/button
- Xuống dòng giữa các sections để dễ đọc

Lưu ý:
- Không cung cấp thông tin tài chính cụ thể (số tiền, số tài khoản)
- Không có quyền thay đổi dữ liệu, chỉ hướng dẫn
- Nếu không chắc chắn, khuyên người dùng liên hệ quản lý`;

  if (role === "STUDENT") {
    return (
      basePrompt +
      `

Người dùng hiện tại: Sinh viên
Tên: ${user?.fullName || "Sinh viên"}
Bạn có thể hướng dẫn:
- Xem và thanh toán hóa đơn
- Gửi yêu cầu bảo trì
- Xem thông tin phòng và hợp đồng
- Đăng ký phòng mới`
    );
  }

  if (role === "MANAGER") {
    return (
      basePrompt +
      `

Người dùng hiện tại: Quản lý
Tên: ${user?.fullName || "Quản lý"}
Bạn có thể hướng dẫn:
- Quản lý phòng, tòa nhà
- Duyệt đơn đăng ký
- Tạo và quản lý hóa đơn
- Xử lý yêu cầu bảo trì
- Xem thống kê và báo cáo`
    );
  }

  return basePrompt;
}

/**
 * Format messages array từ conversation history
 * @param {Array} conversation - Mảng {role, content}
 * @param {string} systemPrompt - System prompt
 * @returns {Array}
 */
export function formatMessages(conversation, systemPrompt) {
  return [
    { role: "system", content: systemPrompt },
    ...conversation.map((msg) => ({
      role: msg.role,
      content: msg.content,
    })),
  ];
}

// Export service object
export const aiService = {
  sendChatMessage,
  createSystemPrompt,
  formatMessages,
};
