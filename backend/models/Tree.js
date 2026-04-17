import mongoose from "mongoose";

const TreeSchema = new mongoose.Schema({
  name: { type: String, default: "Nouvel Arbre" },
  collaborators: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, enum: ['editor', 'reader'], default: 'reader' }
  }]
}, { timestamps: true });

export const Tree = mongoose.model("Tree", TreeSchema);