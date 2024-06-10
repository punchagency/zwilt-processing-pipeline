export function pickOneFromEachCategory(categories: any) {
  return categories.map((category: any) => {
    const { _id, categoryId, name, assessmentResponse } = category;
    if (assessmentResponse.length > 0) {
      const firstResponse = assessmentResponse[0];
      return {
        _id,
        categoryId,
        name,
        response: {
          video_link: firstResponse.video_link,
          transcript: firstResponse.transcript
        }
      };
    }
    return null;
  }).filter((item: any) => item !== null); 
}
