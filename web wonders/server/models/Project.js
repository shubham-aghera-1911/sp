import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    done: { type: Boolean, default: false },
    assignee: { type: String, default: "You" },
  },
  { _id: true }
);

const projectSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true },
    subject: { type: String, required: true },
    deadline: { type: String, required: true },
    members: { type: [String], default: [] },
    tasks: { type: [taskSchema], default: [] },
  },
  { timestamps: true }
);

projectSchema.virtual("progress").get(function () {
  if (!this.tasks.length) return 0;
  return Math.round((this.tasks.filter((t) => t.done).length / this.tasks.length) * 100);
});
projectSchema.set("toJSON", { virtuals: true });

export default mongoose.model("Project", projectSchema);
