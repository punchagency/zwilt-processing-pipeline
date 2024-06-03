export const locationCaseInsensitive = (locationArray: string[]) => {
  const locationRegex: any = [];
  locationArray.forEach(location => {
    locationRegex.push(new RegExp(location, 'i'));
  });
  return locationRegex;
};
