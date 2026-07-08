"use client";
import { useState, useEffect } from "react";

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    name: "", phone: "", skills: "", experience: ""
  });
  const [isEditing, setIsEditing] = useState(false);

  // Giả lập Fetch data khi vào trang
  useEffect(() => {
    setProfile({
      name: "Nguyễn Văn A",
      phone: "0987654321",
      skills: "React, Next.js, TailwindCSS",
      experience: "2 năm kinh nghiệm làm Frontend Developer"
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    // Gọi API PUT /api/users/profile tại đây
    alert("Đã lưu thông tin thành công!");
    setIsEditing(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow mt-10">
      <h1 className="text-2xl font-bold mb-6 text-green-600">Thông tin cá nhân</h1>
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Họ và tên</label>
          <input
            type="text"
            className="w-full border p-2 rounded disabled:bg-gray-100"
            disabled={!isEditing}
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Số điện thoại</label>
          <input
            type="text"
            className="w-full border p-2 rounded disabled:bg-gray-100"
            disabled={!isEditing}
            value={profile.phone}
            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Kỹ năng</label>
          <input
            type="text"
            className="w-full border p-2 rounded disabled:bg-gray-100"
            disabled={!isEditing}
            value={profile.skills}
            onChange={(e) => setProfile({ ...profile, skills: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Kinh nghiệm làm việc</label>
          <textarea
            className="w-full border p-2 rounded disabled:bg-gray-100"
            rows={4}
            disabled={!isEditing}
            value={profile.experience}
            onChange={(e) => setProfile({ ...profile, experience: e.target.value })}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          {isEditing ? (
            <>
              <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 border rounded">Hủy</button>
              <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Lưu thay đổi</button>
            </>
          ) : (
            <button type="button" onClick={() => setIsEditing(true)} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Chỉnh sửa thông tin</button>
          )}
        </div>
      </form>
    </div>
  );
}