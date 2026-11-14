import { useCallback, useEffect, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { Text } from "react-native";
import { Button, Field, Heading, Loading, Notice, Screen } from "@/src/components/ui";
import { useAuth } from "@/src/providers/AuthProvider";
import { apiRequest, type ApiEnvelope, type Resume } from "@/src/lib/api";

export default function EditResumeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token } = useAuth();
  const [resume, setResume] = useState<Resume | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadResume = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const result = await apiRequest<ApiEnvelope<Resume[]>>("/api/resume", { token });
      const selected = result.data?.find((item) => item._id === id);
      if (!selected) throw new Error("Không tìm thấy CV trong tài khoản của bạn.");
      setResume(selected);
      setFullName(selected.cvData?.fullName ?? "");
      setEmail(selected.cvData?.email ?? "");
      setPhone(selected.cvData?.phone ?? "");
      setAddress(selected.cvData?.address ?? "");
      setTargetPosition(selected.cvData?.targetPosition ?? "");
      setSummary(selected.cvData?.summary ?? "");
      setTechnicalSkills(selected.cvData?.technicalSkills ?? "");
      setSoftSkills(selected.cvData?.softSkills ?? "");
      setEducationType(selected.cvData?.education?.[0]?.type ?? "");
      setSchool(selected.cvData?.education?.[0]?.school ?? "");
      setMajor(selected.cvData?.education?.[0]?.major ?? "");
      setEducationDetails(selected.cvData?.education?.[0]?.details ?? "");
      setExperienceCompany(selected.cvData?.experience?.[0]?.company ?? "");
      setExperiencePosition(selected.cvData?.experience?.[0]?.position ?? "");
      setExperienceDetails(selected.cvData?.experience?.[0]?.details ?? "");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Không thể tải CV.");
    } finally {
      setLoading(false);
    }
  }, [token, id]);

  useEffect(() => {
    void Promise.resolve().then(loadResume);
  }, [loadResume]);

  const save = async () => {
    if (!token || !resume) return;
    setSaving(true);
    setError("");
    try {
      await apiRequest("/api/resume/save", {
        method: "POST",
        token,
        body: {
          title: resume.title,
          type: "ONLINE",
          isPublic: resume.isPublic,
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
      setError(saveError instanceof Error ? saveError.message : "Không thể cập nhật CV.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading label="Đang tải CV..." />;
  if (!token) return <Screen><Heading title="Đăng nhập để sửa CV" /><Button title="Đăng nhập" onPress={() => router.push("/login")} /></Screen>;
  if (!resume) {
    return <Screen><Notice message={error || "Không tìm thấy CV."} /><Button title="Quay lại CV của tôi" onPress={() => router.replace("/(tabs)/resumes")} secondary /></Screen>;
  }

  return (
    <Screen>
      <Heading title="Cập nhật CV" subtitle="Các thay đổi sẽ được lưu vào CV hiện tại." />
      {error ? <Notice message={error} /> : null}
      <Field label="Tên CV" value={resume.title} editable={false} />
      <Field label="Họ và tên" value={fullName} onChangeText={setFullName} />
      <Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      <Field label="Số điện thoại" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      <Field label="Địa chỉ" value={address} onChangeText={setAddress} />
      <Field label="Vị trí mong muốn" value={targetPosition} onChangeText={setTargetPosition} />
      <Field label="Giới thiệu bản thân" value={summary} onChangeText={setSummary} multiline maxLength={3000} />
      <Field label="Kỹ năng chuyên môn" value={technicalSkills} onChangeText={setTechnicalSkills} multiline />
      <Field label="Kỹ năng mềm" value={softSkills} onChangeText={setSoftSkills} multiline />
      <Field label="Trình độ học vấn" value={educationType} onChangeText={setEducationType} />
      <Field label="Trường học" value={school} onChangeText={setSchool} />
      <Field label="Chuyên ngành" value={major} onChangeText={setMajor} />
      <Field label="Chi tiết học vấn" value={educationDetails} onChangeText={setEducationDetails} multiline />
      <Field label="Công ty đã làm việc" value={experienceCompany} onChangeText={setExperienceCompany} />
      <Field label="Vị trí đã đảm nhiệm" value={experiencePosition} onChangeText={setExperiencePosition} />
      <Field label="Chi tiết kinh nghiệm" value={experienceDetails} onChangeText={setExperienceDetails} multiline />
      <Text style={{ color: "#64748b", fontSize: 12 }}>Tên CV không thể đổi tại đây vì backend lưu cập nhật theo tên CV.</Text>
      <Button title="Lưu thay đổi" loading={saving} onPress={() => void save()} />
    </Screen>
  );
}
