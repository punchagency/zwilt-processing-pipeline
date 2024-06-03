// import { RevAiApiClient } from 'revai-node-sdk';
// import { join } from 'path';

// export async function transcribeAudio() {
//   try {
//     const accessToken =
//       '02bRRavT2jUE6stuWNkQKWJZJ3zB8dxYvBi1t6YVrJ6WdSMH3N415brcUgVcPGr_7JhOReE0LgJdV1-wDDzD3n-DXIywo';
//     const scriptDirectory = __dirname;
//     const filePath = join(
//       scriptDirectory,
//       '../../../src/utilities/videoOperations/converted-audio/output.mp3'
//     );

//     // Initialize the client with your access token
//     var client = new RevAiApiClient(accessToken);

//     // Submit a local file
//     var job = await client.submitJobLocalFile(filePath);

//     // Wait for the job to complete
//     await client.awaitJobCompletion(job.id);

//     // Retrieve transcript as an object
//     var transcriptObject = await client.getTranscriptObject(job.id);

//     // Return the transcript data
//     return transcriptObject;
//   } catch (error) {
//     console.error('Error converting video to MP3:', error);
//   }
// }



const revai = require('revai-node-sdk');
const fs = require('fs');
import { join } from 'path';


const token = '02bRRavT2jUE6stuWNkQKWJZJ3zB8dxYvBi1t6YVrJ6WdSMH3N415brcUgVcPGr_7JhOReE0LgJdV1-wDDzD3n-DXIywo';
    const scriptDirectory = __dirname;
    const filePath = join(
      scriptDirectory,
      '../../../src/utilities/videoOperations/converted-audio/output.mp3'
    );

// Initialize your client with your audio configuration and access token
const audioConfig = new revai.AudioConfig(
    /* contentType */ "audio/x-raw",
    /* layout */      "interleaved",
    /* sample rate */ 16000,
    /* format */      "S16LE",
    /* channels */    1
);

var client = new revai.RevAiStreamingClient(token, audioConfig);

// Create your event responses
client.on('close', (code: any, reason: any) => {
    console.log(`Connection closed, ${code}: ${reason}`);
});
client.on('httpResponse', (code: any) => {
    console.log(`Streaming client received http response with code: ${code}`);
})
client.on('connectFailed', (error: any) => {
    console.log(`Connection failed with error: ${error}`);
})
client.on('connect', (connectionMessage: any) => {
    console.log(`Connected with message: ${connectionMessage}`);
})

// Begin streaming session
var stream = client.start();

// Read file from disk
var file = fs.createReadStream(filePath);

stream.on('data', (data: any) => {
    console.log(data);
});
stream.on('end', function () {
    console.log("End of Stream");
});

file.on('end', () => {
    client.end();
});

// Stream the file
file.pipe(stream);

// var textStream = await client.getTranscriptTextStream(job.id);
// var transcriptStream = await client.getTranscriptObjectStream(job.id);

// Forcibly ends the streaming session
// stream.end();