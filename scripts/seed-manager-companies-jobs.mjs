import mongoose from "mongoose";
import nextEnv from "@next/env";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

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

const locations = [
  "Hà Nội",
  "TP. Hồ Chí Minh",
  "Đà Nẵng",
  "Cần Thơ",
  "Hải Phòng",
  "Bình Dương",
];

const companyNames = [
  "Công ty TNHH Công nghệ Sao Việt",
  "Công ty Cổ phần Giải pháp số Ánh Dương",
  "Công ty TNHH Phần mềm Đại Việt",
  "Công ty TNHH MTV Kỹ thuật Minh Tâm",
  "Công ty Cổ phần Công nghệ Hướng Dương",
  "Công ty TNHH Dịch vụ số Thành Công",
  "Công ty TNHH Giải pháp Công nghệ Nam Phương",
  "Công ty Cổ phần Phát triển Phần mềm Việt An",
  "Công ty TNHH Công nghệ Tầm Nhìn Mới",
  "Công ty TNHH MTV Truyền thông Bách Khoa",
  "Công ty Cổ phần Dữ liệu Thông Minh",
  "Công ty TNHH Giải pháp Kết Nối Việt",
  "Công ty TNHH Công nghệ Mặt Trời",
  "Công ty Cổ phần Sáng tạo Số Đông Á",
  "Công ty TNHH Dịch vụ Kỹ thuật Phúc An",
  "Công ty TNHH MTV Giải pháp An Phát",
  "Công ty Cổ phần Công nghệ Tiến Đạt",
  "Công ty TNHH Phần mềm Minh Long",
  "Công ty TNHH Giải pháp Số Toàn Cầu",
  "Công ty Cổ phần Công nghệ Việt Tín",
  "Công ty TNHH Công nghệ Hoàng Gia",
  "Công ty TNHH MTV Dịch vụ Tin học Gia Hưng",
  "Công ty Cổ phần Phát triển Công nghệ Trường Sơn",
  "Công ty TNHH Phần mềm Hải Đăng",
  "Công ty TNHH Giải pháp Kỹ thuật Phương Nam",
  "Công ty Cổ phần Công nghệ Đại Phát",
  "Công ty TNHH Dịch vụ Số Hưng Thịnh",
  "Công ty TNHH MTV Công nghệ Tân Tiến",
  "Công ty Cổ phần Giải pháp Doanh nghiệp Việt",
  "Công ty TNHH Công nghệ Bình Minh",
  "Công ty TNHH Phát triển Phần mềm Nhật Minh",
  "Công ty Cổ phần Kỹ thuật và Công nghệ Thành Đô",
  "Công ty TNHH Giải pháp Công nghệ An Bình",
  "Công ty TNHH MTV Dữ liệu Số Việt",
  "Công ty Cổ phần Dịch vụ Công nghệ Phú Hưng",
  "Công ty TNHH Phần mềm Sao Mai",
  "Công ty TNHH Công nghệ và Truyền thông Thiên Hà",
  "Công ty Cổ phần Giải pháp Kinh doanh Số",
  "Công ty TNHH MTV Kỹ thuật Hoàng Minh",
  "Công ty TNHH Công nghệ Thịnh Phát",
  "Công ty Cổ phần Phần mềm Việt Thành",
  "Công ty TNHH Giải pháp Công nghệ Trí Việt",
  "Công ty TNHH MTV Dịch vụ Số Minh Khang",
  "Công ty Cổ phần Công nghệ Phương Đông",
  "Công ty TNHH Giải pháp Công nghệ Đại Nam",
  "Công ty Cổ phần Phần mềm Á Châu",
  "Công ty TNHH MTV Công nghệ Vạn Phúc",
  "Công ty TNHH Dịch vụ Tin học Thành Đạt",
  "Công ty Cổ phần Công nghệ Sông Hồng",
  "Công ty TNHH Giải pháp Số Hoàng Phúc",
  "Công ty TNHH Phần mềm Việt Hưng",
  "Công ty Cổ phần Dữ liệu và Công nghệ Việt",
  "Công ty TNHH MTV Truyền thông Sao Bắc Đẩu",
  "Công ty TNHH Công nghệ Đức Minh",
  "Công ty Cổ phần Giải pháp Phần mềm Phú An",
  "Công ty TNHH Dịch vụ Công nghệ Đại Thành",
  "Công ty TNHH MTV Kỹ thuật Số Hòa Bình",
  "Công ty Cổ phần Công nghệ Nam Việt",
  "Công ty TNHH Phát triển Giải pháp Số",
  "Công ty TNHH Phần mềm Đông Dương",
  "Công ty Cổ phần Công nghệ và Dịch vụ An Khang",
  "Công ty TNHH MTV Giải pháp Tin học Thành Nhân",
  "Công ty TNHH Công nghệ Sáng Tạo Việt",
  "Công ty Cổ phần Phát triển Số Phương Đông",
  "Công ty TNHH Dịch vụ Công nghệ Bảo Tín",
  "Công ty TNHH MTV Phần mềm Minh Phát",
  "Công ty Cổ phần Công nghệ Hòa Phát",
  "Công ty TNHH Giải pháp Doanh nghiệp Đại Việt",
  "Công ty TNHH Công nghệ Trường Phát",
  "Công ty Cổ phần Dịch vụ Số Thành Nam",
  "Công ty TNHH MTV Công nghệ Hoài Nam",
  "Công ty TNHH Phát triển Phần mềm An Việt",
  "Công ty Cổ phần Công nghệ Vĩnh Phúc",
  "Công ty TNHH Giải pháp Số Hưng Việt",
  "Công ty TNHH MTV Dịch vụ Kỹ thuật Nam Á",
  "Công ty Cổ phần Phần mềm và Dữ liệu Minh Châu",
  "Công ty TNHH Công nghệ Đại Thành",
  "Công ty TNHH Giải pháp Công nghệ Phúc Thịnh",
  "Công ty Cổ phần Dịch vụ Tin học Việt Nhật",
  "Công ty TNHH MTV Truyền thông Việt Thành",
  "Công ty TNHH Phần mềm An Phú",
  "Công ty Cổ phần Công nghệ Tân Phú",
  "Công ty TNHH Dịch vụ Số Thành Vinh",
  "Công ty TNHH MTV Giải pháp Công nghệ Đại Lộc",
];

const positions = [
  { title: "Lập trình viên Backend", category: "Công nghệ Thông tin" },
  { title: "Chuyên viên phân tích dữ liệu", category: "Khoa học dữ liệu và Trí tuệ nhân tạo" },
  { title: "Kỹ sư an ninh mạng", category: "An ninh mạng" },
  { title: "Kỹ sư DevOps", category: "DevOps và Điện toán đám mây" },
  { title: "Chuyên viên Marketing số", category: "Marketing số" },
  { title: "Chuyên viên tuyển dụng", category: "Tuyển dụng" },
  { title: "Chuyên viên thiết kế UI/UX", category: "Thiết kế UI/UX" },
  { title: "Chuyên viên quản lý sản phẩm", category: "Quản lý sản phẩm" },
  { title: "Kế toán tổng hợp", category: "Kế toán và Kiểm toán" },
  { title: "Nhân viên kinh doanh", category: "Kinh doanh và Bán hàng" },
  { title: "Chuyên viên kiểm soát chất lượng", category: "Đảm bảo và Kiểm soát chất lượng" },
  { title: "Điều phối viên Logistics", category: "Chuỗi cung ứng và Logistics" },
];

const Company =
  mongoose.models.Company ||
  mongoose.model(
    "Company",
    new mongoose.Schema(
      {
        name: { type: String, required: true },
        logo: { type: String, default: "" },
        website: { type: String, default: "" },
        address: { type: String, required: true },
        scale: { type: String, default: "10-50 nhân viên" },
        description: { type: String, required: true },
        images: [{ type: String }],
        isVerified: { type: Boolean, default: false },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      },
      { timestamps: true }
    )
  );

const Job =
  mongoose.models.Job ||
  mongoose.model(
    "Job",
    new mongoose.Schema(
      {
        title: { type: String, required: true },
        slug: { type: String, required: true },
        companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
        categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
        managerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        description: { type: String, required: true },
        requirements: { type: String, required: true },
        benefits: { type: String, required: true },
        location: { type: String, required: true },
        salaryMin: { type: Number, default: 0 },
        salaryMax: { type: Number, default: 0 },
        experience: { type: String, required: true },
        jobType: { type: String, enum: ["Full-time", "Part-time", "Remote"], default: "Full-time" },
        status: {
          type: String,
          enum: ["PENDING", "APPROVED", "REJECTED", "EXPIRED"],
          default: "PENDING",
        },
        views: { type: Number, default: 0 },
        deadline: { type: Date, required: true },
      },
      { timestamps: true }
    )
  );

const Category =
  mongoose.models.Category ||
  mongoose.model(
    "Category",
    new mongoose.Schema({
      name: { type: String, required: true, unique: true },
      slug: { type: String, required: true, unique: true },
      skills: [{ type: String }],
    })
  );

function createJobDescription(position) {
  return `Chúng tôi đang tìm kiếm ${position} nhiệt huyết để cùng phát triển sản phẩm và quy trình của công ty.`;
}

function getCompanyName(managerIndex, companyNumber) {
  const name = companyNames[managerIndex * 2 + companyNumber - 1];
  if (!name) {
    throw new Error(`No demo company name configured for manager ${managerIndex + 1}, company ${companyNumber}.`);
  }
  return name;
}

async function main() {
  await mongoose.connect(uri);

  const managers = await mongoose.connection.db
    .collection("users")
    .find({ role: "MANAGER" })
    .sort({ createdAt: 1, _id: 1 })
    .toArray();
  if (managers.length === 0) {
    throw new Error("No manager accounts found; no seed data was written.");
  }
  if (companyNames.length < managers.length * 2) {
    throw new Error(
      `Need ${managers.length * 2} unique company names for ${managers.length} managers, but only ${companyNames.length} are configured; no seed data was written.`
    );
  }
  if (new Set(companyNames).size !== companyNames.length) {
    throw new Error("Configured demo company names must be unique; no seed data was written.");
  }

  const categoryDocuments = await Category.find({
    name: { $in: positions.map((position) => position.category) },
  }).lean();
  const categoryIds = new Map(categoryDocuments.map((category) => [category.name, category._id]));
  const missingCategories = [...new Set(positions.map((position) => position.category))].filter(
    (category) => !categoryIds.has(category)
  );
  if (missingCategories.length) {
    throw new Error(`Missing required categories: ${missingCategories.join(", ")}`);
  }

  const deletedJobs = await Job.deleteMany({});
  const deletedCompanies = await Company.deleteMany({});
  await mongoose.connection.db.collection("users").updateMany(
    { role: "MANAGER" },
    { $set: { companyId: null } }
  );

  for (let managerIndex = 0; managerIndex < managers.length; managerIndex += 1) {
    const manager = managers[managerIndex];
    const companies = [];
    for (let companyNumber = 1; companyNumber <= 2; companyNumber += 1) {
      const companyName = getCompanyName(managerIndex, companyNumber);
      const location = locations[(managerIndex + companyNumber - 1) % locations.length];
      const company = await Company.create({
        name: companyName,
        website: `https://company-${managerIndex + 1}-${companyNumber}.example.test`,
        address: location,
        scale: "10-50 nhân viên",
        description: `Doanh nghiệp hoạt động trong lĩnh vực công nghệ và dịch vụ tại ${location}.`,
        isVerified: false,
        createdBy: manager._id,
      });
      companies.push(company);

      const firstPositionIndex = (companyNumber - 1) * 6;
      for (let slot = 0; slot < 6; slot += 1) {
        const position = positions[firstPositionIndex + slot];
        const slug = `demo-${manager._id}-${companyNumber}-${slot + 1}`;
        const salaryMin = 15_250_000 + (managerIndex * 12 + firstPositionIndex + slot) * 250_000;
        const jobLocation = locations[(managerIndex + companyNumber + slot) % locations.length];
        await Job.create({
          title: position.title,
          slug,
          companyId: company._id,
          categoryId: categoryIds.get(position.category),
          managerId: manager._id,
          description: createJobDescription(position.title),
          requirements: "Có kinh nghiệm hoặc nền tảng chuyên môn phù hợp; chủ động và có tinh thần làm việc nhóm.",
          benefits: "Mức lương cạnh tranh, chế độ bảo hiểm theo quy định và cơ hội phát triển chuyên môn.",
          location: jobLocation,
          salaryMin,
          salaryMax: salaryMin + 5_000_000,
          experience: "1-3 năm",
          jobType: "Full-time",
          status: "APPROVED",
          views: 0,
          deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        });
      }
    }

    await mongoose.connection.db.collection("users").updateOne(
      { _id: manager._id },
      { $set: { companyId: companies[1]._id } }
    );
  }

  const [companyTotals, jobTotals, invalidJobs, companyCounts] = await Promise.all([
    Company.countDocuments(),
    Job.countDocuments(),
    Job.countDocuments({
      $or: [
        { title: { $exists: false } },
        { title: "" },
        { salaryMin: { $lte: 0 } },
        { salaryMax: { $lte: 0 } },
      ],
    }),
    Company.aggregate([
      { $match: { createdBy: { $in: managers.map((manager) => manager._id) } } },
      { $group: { _id: "$createdBy", count: { $sum: 1 } } },
      { $match: { count: { $ne: 2 } } },
      { $count: "managersNotAtTwoCompanies" },
    ]),
  ]);

  const jobsPerCompanyIssues = await Job.aggregate([
    { $match: { managerId: { $in: managers.map((manager) => manager._id) } } },
    { $group: { _id: "$companyId", count: { $sum: 1 } } },
    { $match: { count: { $ne: 6 } } },
    { $count: "companiesNotAtSixJobs" },
  ]);

  console.log(
    JSON.stringify(
      {
        database: databaseName,
        managersProcessed: managers.length,
        companiesDeleted: deletedCompanies.deletedCount,
        jobsDeleted: deletedJobs.deletedCount,
        companiesCreated: managers.length * 2,
        jobsCreated: managers.length * 12,
        companyTotal: companyTotals,
        jobTotal: jobTotals,
        jobsMissingPositionOrPositiveSalary: invalidJobs,
        managersNotAtTwoCompanies: companyCounts[0]?.managersNotAtTwoCompanies ?? 0,
        companiesNotAtSixJobs: jobsPerCompanyIssues[0]?.companiesNotAtSixJobs ?? 0,
      },
      null,
      2
    )
  );
}

try {
  await main();
} finally {
  await mongoose.disconnect();
}
