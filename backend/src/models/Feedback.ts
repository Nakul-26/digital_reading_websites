import { InferSchemaType, Schema, model } from "mongoose";

const feedbackSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
}, { timestamps: true });

export type Feedback = InferSchemaType<typeof feedbackSchema>;

export default model<Feedback>("Feedback", feedbackSchema);
