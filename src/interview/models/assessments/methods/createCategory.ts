import { ReturnModelType } from '@typegoose/typegoose';
import { AssessmentCategory } from '../assessment.category.schema';
import { CreateAssessmentCategoriesInput } from 'interview/dto/interview.input';

export default async function createCategory(
  interviewAssessmentModel: ReturnModelType<typeof AssessmentCategory>,
  input: CreateAssessmentCategoriesInput
) {
  let category = await interviewAssessmentModel.findOne({ categoryId: input.categoryId }).lean();

  if (!category) {
    category = await interviewAssessmentModel.create(input);
  }

  return category;
}
