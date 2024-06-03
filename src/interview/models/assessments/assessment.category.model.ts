import { getModelForClass } from '@typegoose/typegoose';
import { AssessmentCategory } from './assessment.category.schema'

const AssessmentCategoryModel = getModelForClass(AssessmentCategory);

export default AssessmentCategoryModel;