import * as fs from 'fs';

export function deleteFile(filePath: string): void {
  fs.unlink(filePath, err => {
    if (err) console.log(err);
    else console.log('\nDeleted file:' + filePath);
  });
};