"use client";
import { useState, useEffect } from "react";

export default function CVBuilderPage() {
  const [token, setToken] = useState("");
  const [title, setTitle] = useState("CV Kỹ Sư Phần Mềm");
  const [loading, setLoading] = useState(false);

  // 1. STATE ĐÃ ĐƯỢC NÂNG CẤP ĐẦY ĐỦ CÁC TRƯỜNG THEO YÊU CẦU
  const [cvData, setCvData] = useState({
    fullName: "Nguyễn Văn A",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200&h=200", // Link ảnh mặc định
    phone: "0912345678",
    email: "nguyenvana@gmail.com",
    address: "Quận 1, TP. Hồ Chí Minh",
    targetPosition: "Fullstack Developer",
    summary: "Tôi là một lập trình viên năng động, mong muốn cống hiến và phát triển các sản phẩm web chất lượng cao...",
    
    // Tách biệt kỹ năng
    technicalSkills: "ReactJS, Next.js, Node.js, MongoDB, TypeScript",
    softSkills: "Làm việc nhóm, Giải quyết vấn đề, Giao tiếp, Quản lý thời gian",
    
    // Cấu trúc học vấn nâng cao
    education: {
      type: "Đại học", // Đại học, Cao đẳng, Thạc sĩ, Khác
      school: "Đại học Công nghệ",
      major: "Công nghệ thông tin",
      details: "Tốt nghiệp loại Giỏi, điểm trung bình 3.6/4.0"
    },
    
    experience: {
      company: "Công ty Công nghệ ABC",
      position: "Fullstack Developer Intern",
      details: "Phát triển và tối ưu hóa giao diện hệ thống Web bằng Next.js.\nPhối hợp cùng đội ngũ Backend để thiết kế API RESTful."
    }
  });

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) setToken(storedToken);
    
    // Tự động lấy tên user thật điền vào CV nếu có
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setCvData(prev => ({ ...prev, fullName: user.fullName, email: user.email }));
    }
  }, []);

  const handleSaveCV = async () => {
    if (!token) {
      alert("Vui lòng đăng nhập tài khoản Ứng viên trước khi lưu CV!");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/resume/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ title, cvData })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      alert("🎉 " + data.message);
    } catch (err: any) {
      alert("Lỗi: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Topbar điều khiển */}
      <div className="flex flex-col md:flex-row items-center justify-between border-b pb-4 mb-6 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Tên quản lý CV</label>
          <input type="text" className="text-xl font-bold border-b border-dashed border-gray-300 focus:border-green-500 outline-none bg-transparent"
            value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <button onClick={handleSaveCV} disabled={loading} className="bg-green-500 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-green-600 transition shadow-sm disabled:bg-gray-300">
          {loading ? "Đang lưu..." : "Lưu CV lên hệ thống"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* ================= CỘT TRÁI: FORM CHỈNH SỬA CHI TIẾT ================= */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6 max-h-[85vh] overflow-y-auto custom-scrollbar">
          <h2 className="text-lg font-bold text-gray-800 border-l-4 border-green-500 pl-2">Thông tin CV</h2>
          
          {/* Khối 1: Thông tin cơ bản */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">1. Thông tin cá nhân & Liên hệ</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Họ và Tên</label>
                <input type="text" className="w-full p-2 border rounded-lg text-sm" value={cvData.fullName} onChange={e => setCvData({...cvData, fullName: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Vị trí ứng tuyển</label>
                <input type="text" className="w-full p-2 border rounded-lg text-sm" value={cvData.targetPosition} onChange={e => setCvData({...cvData, targetPosition: e.target.value})} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Số điện thoại</label>
                <input type="text" className="w-full p-2 border rounded-lg text-sm" value={cvData.phone} onChange={e => setCvData({...cvData, phone: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Email liên hệ</label>
                <input type="email" className="w-full p-2 border rounded-lg text-sm" value={cvData.email} onChange={e => setCvData({...cvData, email: e.target.value})} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Địa chỉ hiện tại</label>
                <input type="text" className="w-full p-2 border rounded-lg text-sm" value={cvData.address} onChange={e => setCvData({...cvData, address: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Link Ảnh đại diện (URL)</label>
                <input type="text" className="w-full p-2 border rounded-lg text-sm" value={cvData.avatar} onChange={e => setCvData({...cvData, avatar: e.target.value})} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Giới thiệu ngắn / Mục tiêu</label>
              <textarea rows={2} className="w-full p-2 border rounded-lg text-sm" value={cvData.summary} onChange={e => setCvData({...cvData, summary: e.target.value})} />
            </div>
          </div>

          {/* Khối 2: Học vấn & Bằng cấp */}
          <div className="border-t pt-4 space-y-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">2. Trình độ học vấn</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Hệ bằng cấp</label>
                <select className="w-full p-2 border rounded-lg text-sm bg-white" value={cvData.education.type} 
                  onChange={e => setCvData({...cvData, education: {...cvData.education, type: e.target.value}})}>
                  <option value="Đại học">Đại học</option>
                  <option value="Cao đẳng">Cao đẳng</option>
                  <option value="Thạc sĩ">Thạc sĩ</option>
                  <option value="Khác">Khác (Trung cấp/Chứng chỉ)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Nơi học (Tên trường)</label>
                <input type="text" className="w-full p-2 border rounded-lg text-sm" value={cvData.education.school} onChange={e => setCvData({...cvData, education: {...cvData.education, school: e.target.value}})} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Chuyên ngành</label>
                <input type="text" className="w-full p-2 border rounded-lg text-sm" value={cvData.education.major} onChange={e => setCvData({...cvData, education: {...cvData.education, major: e.target.value}})} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Mô tả học vấn / Thành tích</label>
                <input type="text" className="w-full p-2 border rounded-lg text-sm" value={cvData.education.details} onChange={e => setCvData({...cvData, education: {...cvData.education, details: e.target.value}})} />
              </div>
            </div>
          </div>

          {/* Khối 3: Kinh nghiệm làm việc */}
          <div className="border-t pt-4 space-y-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">3. Kinh nghiệm thực tế</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Tên công ty/Tổ chức</label>
                <input type="text" className="w-full p-2 border rounded-lg text-sm" value={cvData.experience.company} onChange={e => setCvData({...cvData, experience: {...cvData.experience, company: e.target.value}})} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Vị trí đảm nhiệm</label>
                <input type="text" className="w-full p-2 border rounded-lg text-sm" value={cvData.experience.position} onChange={e => setCvData({...cvData, experience: {...cvData.experience, position: e.target.value}})} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Chi tiết công việc / Đóng góp chính</label>
              <textarea rows={3} className="w-full p-2 border rounded-lg text-sm" value={cvData.experience.details} onChange={e => setCvData({...cvData, experience: {...cvData.experience, details: e.target.value}})} />
            </div>
          </div>

          {/* Khối 4: Kỹ năng tách biệt */}
          <div className="border-t pt-4 space-y-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">4. Bộ kỹ năng</h3>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Kỹ năng chuyên môn (Cách nhau bằng dấu phẩy)</label>
              <input type="text" className="w-full p-2 border rounded-lg text-sm" value={cvData.technicalSkills} onChange={e => setCvData({...cvData, technicalSkills: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Kỹ năng mềm (Cách nhau bằng dấu phẩy)</label>
              <input type="text" className="w-full p-2 border rounded-lg text-sm" value={cvData.softSkills} onChange={e => setCvData({...cvData, softSkills: e.target.value})} />
            </div>
          </div>
        </div>

        {/* ================= CỘT PHẢI: LIVE PREVIEW THEO CHUẨN TOPCV ================= */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden sticky top-24 grid grid-cols-3 min-h-[650px]">
          
          {/* THANH BÊN (LEFT SIDEBAR CV - MÀU SẪM) */}
          <div className="col-span-1 bg-slate-800 text-gray-300 p-5 flex flex-col items-center space-y-6 text-xs">
            {/* Ảnh đại diện tròn */}
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-green-500 bg-gray-600 shadow-md">
              <img src={cvData.avatar || "https://placehold.co/200"} alt="Avatar" className="w-full h-full object-cover" />
            </div>

            {/* Thông tin liên hệ dạng danh sách dọc */}
            <div className="w-full space-y-3 border-t border-gray-700 pt-4">
              <h4 className="text-white font-bold uppercase tracking-wider text-[11px] text-green-400">Liên hệ</h4>
              <p className="break-all"><strong>📞 SĐT:</strong><br/>{cvData.phone}</p>
              <p className="break-all"><strong>✉️ Email:</strong><br/>{cvData.email}</p>
              <p><strong>📍 Địa chỉ:</strong><br/>{cvData.address}</p>
            </div>

            {/* Kỹ năng mềm ở sidebar */}
            <div className="w-full space-y-2 border-t border-gray-700 pt-4">
              <h4 className="text-white font-bold uppercase tracking-wider text-[11px] text-green-400">Kỹ năng mềm</h4>
              <div className="flex flex-col space-y-1">
                {cvData.softSkills.split(",").map((s, i) => s.trim() && (
                  <span key={i} className="bg-slate-700 text-gray-200 px-2 py-0.5 rounded text-[10px] w-fit">{s.trim()}</span>
                ))}
              </div>
            </div>
          </div>

          {/* PHẦN NỘI DUNG CHÍNH (MAIN CONTENT CV - MÀU TRẮNG) */}
          <div className="col-span-2 p-6 space-y-5 text-xs text-gray-700 leading-relaxed bg-white">
            <div>
              <h1 className="text-2xl font-black text-gray-900 uppercase tracking-wide">{cvData.fullName}</h1>
              <p className="text-green-600 font-bold text-sm tracking-wide mt-0.5">{cvData.targetPosition}</p>
              <p className="mt-2 text-gray-500 italic border-l-2 border-gray-200 pl-2">{cvData.summary}</p>
            </div>

            {/* Kinh nghiệm */}
            <div>
              <h3 className="font-bold uppercase text-gray-900 border-b border-gray-200 pb-1 mb-2 text-xs flex items-center text-green-600">💼 Kinh nghiệm làm việc</h3>
              <div className="font-bold text-gray-800 flex justify-between">
                <span>{cvData.experience.company}</span>
                <span className="text-gray-400 font-normal">Tháng 06/2025 - Hiện tại</span>
              </div>
              <p className="italic text-gray-500 font-medium">{cvData.experience.position}</p>
              <p className="mt-1 text-gray-600 whitespace-pre-line bg-gray-50 p-2 rounded border border-gray-100">{cvData.experience.details}</p>
            </div>

            {/* Học vấn hiển thị Hệ bằng cấp */}
            <div>
              <h3 className="font-bold uppercase text-gray-900 border-b border-gray-200 pb-1 mb-2 text-xs flex items-center text-green-600">🎓 Trình độ học vấn</h3>
              <div className="font-bold text-gray-800 flex justify-between">
                <span>{cvData.education.school}</span>
                <span className="bg-green-50 text-green-700 font-semibold px-1.5 py-0.5 rounded text-[10px]">{cvData.education.type}</span>
              </div>
              <p className="text-gray-600 font-medium">Chuyên ngành: {cvData.education.major}</p>
              <p className="text-gray-400 italic mt-0.5">{cvData.education.details}</p>
            </div>

            {/* Kỹ năng chuyên môn */}
            <div>
              <h3 className="font-bold uppercase text-gray-900 border-b border-gray-200 pb-1 mb-2 text-xs flex items-center text-green-600">🛠️ Kỹ năng chuyên môn</h3>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {cvData.technicalSkills.split(",").map((s, i) => s.trim() && (
                  <span key={i} className="bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-md font-medium text-[11px]">{s.trim()}</span>
                ))}
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}