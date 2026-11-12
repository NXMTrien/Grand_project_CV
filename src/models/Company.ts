import mongoose, { Schema, model, models } from "mongoose";

const CompanySchema = new Schema(
  {
    name: { type: String, required: true },
    logo: { type: String, default: "" },
    website: { type: String, default: "" },
    address: { type: String, required: true },
    scale: { type: String, default: "10-50 nhân viên" }, 
    description: { type: String, required: true },       
    images: [{ type: String }],                         
    isVerified: { type: Boolean, default: false } ,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }     
  },
  { timestamps: true }
);

const Company = models.Company || model("Company", CompanySchema);
export default Company;