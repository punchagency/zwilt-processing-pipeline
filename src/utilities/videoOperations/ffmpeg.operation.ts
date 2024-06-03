import { exec } from 'child_process';
import { promisify } from 'util';
import { join } from 'path';

const execPromise = promisify(exec);

export async function convertVideoToMP3() {
  // Input video file path
  const scriptDirectory = __dirname;

  // Construct the input video file path dynamically
  const inputVideo = join(scriptDirectory, '../../../src/utilities/videoOperations/downloads/input2.mp4');
  
  // Output MP3 file path
  const outputMP3 = join(scriptDirectory, '../../../src/utilities/videoOperations/converted-audio/output2.mp3');

  try {
    // Check if the input video file exists
    const fs = require('fs');
    if (!fs.existsSync(inputVideo)) {
      console.error('Input video file not found.');
      return;
    }

   // convert video to MP3
    const command = `ffmpeg -i "${inputVideo}" -vn -ac 2 -ar 44100 -ab 192k -f mp3 "${outputMP3}"`;
     await execPromise(command);
    // const { stdout, stderr } = await execPromise(command);

    console.log('Conversion finished.');
  } catch (error) {
    console.error('Error converting video to MP3:', error.message);
  }
}