import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class QuestionMedia extends Document {
  @Prop({ required: true, index: true })
  questionId: string; // Reference to PostgreSQL Question ID

  @Prop({ required: true })
  imageData: string; // Base64 image data

  @Prop({ required: true })
  mimeType: string; // image/jpeg, image/png, etc.

  @Prop()
  originalName: string;

  @Prop()
  size: number; // File size in bytes
}

export const QuestionMediaSchema = SchemaFactory.createForClass(QuestionMedia);

// Create index for faster lookups
QuestionMediaSchema.index({ questionId: 1 });
