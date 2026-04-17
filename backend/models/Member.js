import mongoose from "mongoose";

const MemberSchema = new mongoose.Schema({
 
  treeId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Tree', 
    required: true 
  },

  nodeId: { type: String, required: true, trim: true }, 

 
  firstName: { type: String, default: '' },
  lastName: { type: String, default: '' },
  name: { type: String, default: '' }, 
  gender: { type: String, enum: ['male', 'female'], default: 'male' },

  email: { type: String, required: true, trim: true, lowercase: true },
  phone: { type: String, default: '' },
  professions: { type: String, default: '' },
  addresses: { type: String, default: '' },

 
  birthDate: { type: String, default: '' }, 
  deathDate: { type: String, default: '' },
  birthYear: { type: String, default: '' }, 

  
  parentId: { type: String, default: null },
  spouseId: { type: String, default: null },
  childrenIds: [{ type: String }], 
  
}, { 
  timestamps: true
});


MemberSchema.index({ treeId: 1, nodeId: 1 }, { unique: true });
MemberSchema.index({ treeId: 1, email: 1 }, { unique: true });

const MemberModel = mongoose.model("Member", MemberSchema);

export { MemberModel as Member };