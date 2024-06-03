import moment from 'moment';
import fs from 'fs';

export function calculateNextReleaseDate(
  contractStartDate: string,
  paymentRelease: string
) {
  const startDate = moment(contractStartDate);

  switch (paymentRelease) {
    case 'Daily':
      return startDate.add(1, 'days').toDate();
    case 'Weekly':
      return startDate.add(1, 'weeks').toDate();
    case 'Bi-Weekly':
      return startDate.add(2, 'weeks').toDate();
    case 'Monthly':
      return startDate.add(1, 'months').toDate();
    default:
      return startDate.add(2, 'weeks').toDate();
  }
}

  export function getMediaUrl(mediaUrl: string | undefined | null) {
        if (mediaUrl?.startsWith('https://zwilt.s3.amazonaws.com/')) {
            const modifiedUrl = mediaUrl.replace(
                'https://zwilt.s3.amazonaws.com/',
                `https://d2b6gadzbomflj.cloudfront.net/`,
            );
            return modifiedUrl;
        } else if (mediaUrl?.startsWith('https://')) {
            return mediaUrl;
        } else {
            return `https://d2b6gadzbomflj.cloudfront.net/${mediaUrl}`;
    }
  }
    
export function writeToFile(path: string, data: any) {
  const filePath = path;

  fs.writeFile(filePath, data, err => {
    if (err) {
      console.error('Error writing to file:', err);
    } else {
      console.log('Data has been written to the file successfully.');
    }
  });
}
