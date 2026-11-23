import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import nextEnv from "@next/env";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

const DEMO_PASSWORD = "12356789";

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error("MONGODB_URI is required in .env.local");
}

const parsedUri = new URL(uri);
const databaseName = decodeURIComponent(parsedUri.pathname.slice(1));
const isLocalHost = ["localhost", "127.0.0.1", "::1"].includes(parsedUri.hostname);
const isExplicitProductionDatabase = /prod(?:uction)?/i.test(databaseName);
const isNonProductionDatabase = /(^|[-_])(dev|development|local|test|testing)([-_]|$)/i.test(databaseName);

if (!databaseName || isExplicitProductionDatabase || (!isLocalHost && !isNonProductionDatabase)) {
  throw new Error(
    "Refusing to seed an unverified database. Use a local MongoDB host or a database named dev/local/test."
  );
}

const categories = [
  { name: "Công nghệ thông tin", skills: ["Lập trình", "Phát triển phần mềm", "Cơ sở dữ liệu"] },
  { name: "Khoa học dữ liệu và Trí tuệ nhân tạo", skills: ["Python", "Machine Learning", "Phân tích dữ liệu"] },
  { name: "An ninh mạng", skills: ["Bảo mật hệ thống", "Kiểm thử xâm nhập", "SOC"] },
  { name: "DevOps và Điện toán đám mây", skills: ["Docker", "Kubernetes", "AWS"] },
  { name: "Quản lý sản phẩm", skills: ["Product roadmap", "Agile", "Phân tích sản phẩm"] },
  { name: "Thiết kế UI/UX", skills: ["Figma", "Thiết kế giao diện", "Nghiên cứu người dùng"] },
  { name: "Thiết kế đồ họa", skills: ["Adobe Illustrator", "Photoshop", "Thiết kế thương hiệu"] },
  { name: "Marketing số", skills: ["Digital Marketing", "Quảng cáo trực tuyến", "Phân tích chiến dịch"] },
  { name: "Sáng tạo nội dung và Copywriting", skills: ["Viết nội dung", "Biên tập", "Kể chuyện thương hiệu"] },
  { name: "SEO và Tiếp thị công cụ tìm kiếm", skills: ["SEO", "Google Analytics", "Nghiên cứu từ khóa"] },
  { name: "Kinh doanh và Bán hàng", skills: ["Tư vấn bán hàng", "Đàm phán", "CRM"] },
  { name: "Phát triển kinh doanh", skills: ["Phát triển đối tác", "Nghiên cứu thị trường", "B2B"] },
  { name: "Chăm sóc khách hàng", skills: ["Hỗ trợ khách hàng", "Giao tiếp", "Xử lý khiếu nại"] },
  { name: "Nhân sự", skills: ["Quản trị nhân sự", "C&B", "Quan hệ lao động"] },
  { name: "Tuyển dụng", skills: ["Phỏng vấn", "Sourcing", "Quản lý ứng viên"] },
  { name: "Kế toán và Kiểm toán", skills: ["Kế toán tổng hợp", "Báo cáo tài chính", "Kiểm toán"] },
  { name: "Tài chính và Ngân hàng", skills: ["Phân tích tài chính", "Tín dụng", "Quản trị rủi ro"] },
  { name: "Hành chính và Văn phòng", skills: ["Hành chính văn phòng", "Quản lý hồ sơ", "Microsoft Office"] },
  { name: "Pháp lý", skills: ["Tư vấn pháp luật", "Soạn thảo hợp đồng", "Tuân thủ"] },
  { name: "Chuỗi cung ứng và Logistics", skills: ["Quản lý kho", "Vận tải", "Hoạch định chuỗi cung ứng"] },
  { name: "Thu mua và Cung ứng", skills: ["Đàm phán nhà cung cấp", "Quản lý hợp đồng", "Procurement"] },
  { name: "Sản xuất và Chế tạo", skills: ["Vận hành sản xuất", "Lean", "Quản lý dây chuyền"] },
  { name: "Đảm bảo và Kiểm soát chất lượng", skills: ["QA/QC", "ISO", "Kiểm soát quy trình"] },
  { name: "Xây dựng và Kiến trúc", skills: ["AutoCAD", "Quản lý công trình", "Thiết kế kiến trúc"] },
  { name: "Bất động sản", skills: ["Tư vấn bất động sản", "Định giá", "Quản lý tài sản"] },
  { name: "Giáo dục và Đào tạo", skills: ["Giảng dạy", "Thiết kế chương trình", "Đào tạo"] },
  { name: "Y tế và Điều dưỡng", skills: ["Chăm sóc bệnh nhân", "Điều dưỡng", "Sơ cứu"] },
  { name: "Dược phẩm và Công nghệ sinh học", skills: ["Dược", "Nghiên cứu lâm sàng", "Công nghệ sinh học"] },
  { name: "Nhà hàng, Khách sạn và Du lịch", skills: ["Lễ tân", "Dịch vụ nhà hàng", "Điều hành tour"] },
  { name: "Vận tải và Giao nhận", skills: ["Điều phối vận tải", "Giao nhận", "Quản lý đội xe"] },
];

const candidateNames = [
  "Nguyễn Văn Bình",
  "Trần Thị Minh Anh",
  "Lê Hoàng Nam",
  "Phạm Ngọc Hà",
  "Hoàng Quốc Bảo",
  "Võ Thị Thanh Trúc",
  "Đặng Minh Quân",
  "Bùi Thu Trang",
  "Đỗ Gia Huy",
  "Hồ Ngọc Mai",
  "Ngô Thành Đạt",
  "Dương Thảo Vy",
  "Lý Tuấn Kiệt",
  "Phan Khánh Linh",
  "Vũ Đức Anh",
  "Mai Phương Thảo",
  "Cao Nhật Minh",
  "Trịnh Thị Hương",
  "Tạ Quang Huy",
  "Đinh Bảo Ngọc",
  "Lương Hoài An",
  "Châu Minh Khang",
  "Tô Ngọc Diệp",
  "La Thành Công",
  "Hà Thị Kim Oanh",
  "Đào Anh Tuấn",
  "Phùng Mỹ Duyên",
  "Tăng Quốc Khánh",
  "Chu Hải Yến",
  "Lâm Gia Phúc",
];

const managerNames = [
  "Nguyễn Minh Tuấn",
  "Trần Hoàng Yến",
  "Lê Quốc Hưng",
  "Phạm Thanh Tâm",
  "Hoàng Thị Thu Hà",
  "Võ Anh Dũng",
  "Đặng Ngọc Lan",
  "Bùi Đức Thịnh",
  "Đỗ Khánh Vy",
  "Hồ Thanh Phong",
  "Ngô Thị Bích Ngọc",
  "Dương Quang Vinh",
  "Lý Mỹ Linh",
  "Phan Quốc Việt",
  "Vũ Thu Hằng",
  "Mai Hoàng Long",
  "Cao Thị Ngọc Ánh",
  "Trịnh Minh Đức",
  "Tạ Phương Uyên",
  "Đinh Thành Trung",
];

function slugify(text) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/-+/g, "-");
}

function emailLocalPart(fullName) {
  return fullName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function createAccount(role, index) {
  const fullName = (role === "MANAGER" ? managerNames : candidateNames)[index - 1];
  if (!fullName) {
    throw new Error(`No demo name configured for ${role} account ${index}`);
  }
  return {
    email: `${emailLocalPart(fullName)}@gmail.com`,
    password: DEMO_PASSWORD,
    fullName,
    dateOfBirth: new Date(Date.UTC(1990, 0, 1 + (index % 28))),
    role,
    isVerified: true,
    isFirstLogin: true,
    isBlocked: false,
    ...(role === "MANAGER" ? { companyId: null } : {}),
  };
}

const Category =
  mongoose.models.Category ||
  mongoose.model(
    "Category",
    new mongoose.Schema(
      {
        name: { type: String, required: true, unique: true },
        slug: { type: String, required: true, unique: true },
        skills: [{ type: String }],
      },
      { timestamps: true }
    )
  );

const User =
  mongoose.models.User ||
  mongoose.model(
    "User",
    new mongoose.Schema(
      {
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        fullName: { type: String, required: true },
        dateOfBirth: { type: Date, required: true },
        role: { type: String, enum: ["ADMIN", "MANAGER", "CANDIDATE"], default: "CANDIDATE" },
        isVerified: { type: Boolean, default: false },
        isFirstLogin: { type: Boolean, default: true },
        companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", default: null },
        isBlocked: { type: Boolean, default: false },
      },
      { timestamps: true }
    )
  );

async function seedCategories() {
  const categoryRecords = categories.map(({ name, skills }) => ({
    name,
    slug: slugify(name),
    skills,
  }));
  const existing = await Category.find({
    $or: [
      { name: { $in: categoryRecords.map((category) => category.name) } },
      { slug: { $in: categoryRecords.map((category) => category.slug) } },
    ],
  })
    .select("name slug")
    .lean();
  const existingNames = new Set(existing.map((category) => category.name));
  const existingSlugs = new Set(existing.map((category) => category.slug));
  const missing = categoryRecords.filter(
    (category) => !existingNames.has(category.name) && !existingSlugs.has(category.slug)
  );

  if (missing.length === 0) return 0;
  await Category.insertMany(missing);
  return missing.length;
}

async function seedAccounts(role, count) {
  const credentials = [];
  let updated = 0;
  const prefix = role === "MANAGER" ? "manager" : "candidate";
  const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10);

  for (let index = 1; index <= count; index += 1) {
    const account = createAccount(role, index);
    const existingAccount = await User.findOne({ email: account.email }).select("_id role").lean();
    if (existingAccount && existingAccount.role !== role) {
      throw new Error(
        `Cannot seed ${account.email}: the email belongs to a ${existingAccount.role} account.`
      );
    }

    const legacyEmail = `${prefix}${String(index).padStart(2, "0")}@gmail.com`;
    const legacyAccount = await User.findOne({ email: legacyEmail, role }).select("_id").lean();
    if (legacyAccount) {
      if (existingAccount) {
        throw new Error(
          `Cannot migrate ${legacyEmail}: ${account.email} already belongs to another account.`
        );
      }
      await User.updateOne(
        { _id: legacyAccount._id },
        {
          $set: {
            email: account.email,
            fullName: account.fullName,
            password: hashedPassword,
          },
        }
      );
      updated += 1;
      credentials.push({ role, email: account.email, password: DEMO_PASSWORD });
      continue;
    }

    if (existingAccount) {
      await User.updateOne(
        { _id: existingAccount._id },
        { $set: { fullName: account.fullName, password: hashedPassword } }
      );
      updated += 1;
      credentials.push({ role, email: account.email, password: DEMO_PASSWORD });
      continue;
    }

    account.password = hashedPassword;
    await User.create(account);
    credentials.push({ role, email: account.email, password: DEMO_PASSWORD });
  }

  return { credentials, updated };
}

try {
  await mongoose.connect(uri);
  const createdCategories = await seedCategories();
  const candidates = await seedAccounts("CANDIDATE", candidateNames.length);
  const managers = await seedAccounts("MANAGER", managerNames.length);

  console.log(`Database: ${databaseName}`);
  console.log(`Categories: ${createdCategories} created, ${categories.length - createdCategories} already existed.`);
  console.log(`Candidates: ${candidates.credentials.length} created, ${candidates.updated} updated.`);
  console.log(`Managers: ${managers.credentials.length} created, ${managers.updated} updated.`);
  console.log(`\nShared password for all demo candidate and manager accounts: ${DEMO_PASSWORD}`);
  console.log("Demo account credentials:");
  console.table([...candidates.credentials, ...managers.credentials]);
} finally {
  await mongoose.disconnect();
}
