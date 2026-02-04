import mongoose from "mongoose";

const facultySchema = new mongoose.Schema({
    name: { type: String, required: true },
    degree: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true }, // Image filename store hoga
}, { timestamps: true });

const Faculty = mongoose.model("Faculty", facultySchema);
export default Faculty;