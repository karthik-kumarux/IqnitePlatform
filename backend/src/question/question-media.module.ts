import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { QuestionMedia, QuestionMediaSchema } from './schemas/question-media.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: QuestionMedia.name, schema: QuestionMediaSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class QuestionMediaModule {}
