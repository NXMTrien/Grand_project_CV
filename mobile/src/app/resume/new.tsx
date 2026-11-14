import { useState } from "react";
import { router } from "expo-router";
import { Text } from "react-native";
import { apiRequest } from "@/src/lib/api";
import { Button, Field, Heading, Notice, Screen } from "@/src/components/ui";
import { useAuth } from "@/src/providers/AuthProvider";

export default function CreateResumeScreen() {
  const { token, user } = useAuth();
  const [title, setTitle] = useState("");
  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [address, setAddress] = useState("");
  const [targetPosition, setTargetPosition] = useState("");
  const [summary, setSummary] = useState("");
  const [technicalSkills, setTechnicalSkills] = useState("");
  const [softSkills, setSoftSkills] = useState("");
  const [educationType, setEducationType] = useState("");
  const [school, setSchool] = useState("");
  const [major, setMajor] = useState("");
  const [educationDetails, setEducationDetails] = useState("");
  const [experienceCompany, setExperienceCompany] = useState("");
  const [experiencePosition, setExperiencePosition] = useState("");
  const [experienceDetails, setExperienceDetails] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const save = async () => {
    if (!token) {
      router.replace("/login");
      return;
    }
    if (!title.trim()) {
      setError("Vui lòng nhập tiêu đề CV.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await apiRequest("/api/resume/save", {
        method: "POST",
        token,
        body: {
          title: title.trim(),
          type: "ONLINE",
          isPublic: true,
          cvData: {
            fullName: fullName.trim(),
            email: email.trim(),
            phone: phone.trim(),
            address: address.trim(),
            targetPosition: targetPosition.trim(),
            summary: summary.trim(),
            technicalSkills: technicalSkills.trim(),
            softSkills: softSkills.trim(),
            education: school.trim() || major.trim() || educationDetails.trim()
              ? [{ type: educationType.trim(), school: school.trim(), major: major.trim(), details: educationDetails.trim() }]
              : [],
            experience: experienceCompany.trim() || experiencePosition.trim() || experienceDetails.trim()
              ? [{ company: experienceCompany.trim(), position: experiencePosition.trim(), details: experienceDetails.trim() }]
              : [],
          },
        },
      });
      router.replace("/(tabs)/resumes");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Không thể lưu CV.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return <Screen><Heading title="Đăng nhập để tạo CV" /><Button title="Đăng nhập" onPress={() => router.push("/login")} /></Screen>;
  }

  return (
    <Screen>
      <Heading title="Tạo CV trực tuyến" subtitle="Thông tin này được lưu vào hồ sơ ứng viên của bạn." />
      {error ? <Notice message={error} /> : null}
      <Field label="Tên CV" value={title} onChangeText={setTitle} placeholder="Ví dụ: CV Marketing 2026" />
      <Field label="Họ và tên" value={fullName} onChangeText={setFullName} />
      <Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      <Field label="Số điện thoại" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      <Field label="Địa chỉ" value={address} onChangeText={setAddress} />
      <Field label="Vị trí mong muốn" value={targetPosition} onChangeText={setTargetPosition} />
      <Field label="Giới thiệu bản thân" value={summary} onChangeText={setSummary} multiline maxLength={3000} />
      <Field label="Kỹ năng chuyên môn" value={technicalSkills} onChangeText={setTechnicalSkills} multiline placeholder="Các kỹ năng, phân tách bằng dấu phẩy" />
      <Field label="Kỹ năng mềm" value={softSkills} onChangeText={setSoftSkills} multiline />
      <Field label="Trình độ học vấn" value={educationType} onChangeText={setEducationType} placeholder="Ví dụ: Đại học" />
      <Field label="Trường học" value={school} onChangeText={setSchool} />
      <Field label="Chuyên ngành" value={major} onChangeText={setMajor} />
      <Field label="Chi tiết học vấn" value={educationDetails} onChangeText={setEducationDetails} multiline />
      <Field label="Công ty đã làm việc" value={experienceCompany} onChangeText={setExperienceCompany} />
      <Field label="Vị trí đã đảm nhiệm" value={experiencePosition} onChangeText={setExperiencePosition} />
      <Field label="Chi tiết kinh nghiệm" value={experienceDetails} onChangeText={setExperienceDetails} multiline />
      <Text style={{ color: "#64748b", fontSize: 12, lineHeight: 18 }}>CV được lưu trên tài khoản của bạn và có thể chọn khi ứng tuyển.</Text>
      <Button title="Lưu CV" loading={loading} onPress={() => void save()} />
    </Screen>
  );
}
