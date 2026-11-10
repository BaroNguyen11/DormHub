const AI_BASE_URL = import.meta.env.VITE_AI_BASE_URL || "/ai-proxy/v1";
const AI_API_KEY = import.meta.env.VITE_AI_API_KEY;
const AI_MODEL = import.meta.env.VITE_AI_MODEL || "llama-3.3-70b-versatile";

// Validate API key is configured
if (!AI_API_KEY) {
  console.error("❌ VITE_AI_API_KEY is not configured. Set it in .env file.");
  throw new Error(
    "AI_API_KEY is not configured. Set VITE_AI_API_KEY in .env file.",
  );
}

export async function sendChatMessage(messages, options = {}) {
  try {
    // Validate messages
    if (!Array.isArray(messages) || messages.length === 0) {
      throw new Error("Messages phải là mảng không rỗng");
    }

    // Prepare request body
    const requestBody = {
      model: options.model || AI_MODEL,
      messages: messages,
      stream: false,
      temperature: options.temperature || 0.7,
      max_tokens: options.max_tokens || 2000,
      ...options.extra,
    };

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${AI_API_KEY}`, 
    };



    const response = await fetch(AI_BASE_URL + "/chat/completions", {
      method: "POST",
      headers,
      body: JSON.stringify(requestBody),
    });

    // Check response status
    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ AI API Error:", response.status, errorText);

      if (response.status === 401) {
        throw new Error("API key không hợp lệ");
      } else if (response.status === 429) {
        throw new Error("Đã vượt quá giới hạn request. Vui lòng thử lại sau.");
      } else if (response.status >= 500) {
        throw new Error("Server AI đang gặp sự cố. Vui lòng thử lại sau.");
      } else {
        throw new Error(`Lỗi AI API: ${response.status}`);
      }
    }

    // Parse response
    const data = await response.json();

    // Extract message content
    const content = data?.choices?.[0]?.message?.content;

    if (!content) {
      console.error("❌ Invalid response structure:", data);
      throw new Error("Phản hồi từ AI không hợp lệ");
    }

    console.log("✅ AI Response received:", content.substring(0, 100) + "...");

    return content;
  } catch (error) {
    console.error("❌ AI Service Error:", error);

    // Re-throw với message thân thiện
    if (error.message.includes("fetch")) {
      throw new Error(
        "Không thể kết nối tới AI server. Kiểm tra mạng của bạn.",
        { cause: error },
      );
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
- Hỗ trợ người dùng về các chức năng của hệ thống
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
