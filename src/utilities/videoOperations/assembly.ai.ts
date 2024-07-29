import axios from 'axios'
import ErrorLogService from '../../errorLog/error.log.service';
import fs from 'fs-extra'
import { join } from 'path';

const errorLogService = new ErrorLogService();
export async function assemblyTranscribeAudio() {
  try {
    
const baseUrl = 'https://api.assemblyai.com/v2'

const headers = {
  authorization: 'c38dc46e6b414f5e8b2f67d28afe1755'
}
const scriptDirectory = __dirname;
const path = join(scriptDirectory, '../../../src/utilities/videoOperations/converted-audio/output2.mp3');
const audioData = await fs.readFile(path)
const uploadResponse = await axios.post(`${baseUrl}/upload`, audioData, {
  headers
})
const uploadUrl = uploadResponse.data.upload_url

const data = {
  audio_url: uploadUrl // You can also use a URL to an audio or video file on the web
}

const url = `${baseUrl}/transcript`
const response = await axios.post(url, data, { headers: headers })

const transcriptId = response.data.id
const pollingEndpoint = `${baseUrl}/transcript/${transcriptId}`

while (true) {
  const pollingResponse = await axios.get(pollingEndpoint, {
    headers: headers
  })
  const transcriptionResult = pollingResponse.data

  if (transcriptionResult.status === 'completed') {
    // console.log("Result___", transcriptionResult.text);
    return transcriptionResult;
    break
  } else if (transcriptionResult.status === 'error') {
    throw new Error(`Transcription failed: ${transcriptionResult.error}`)
  } else {
    await new Promise((resolve) => setTimeout(resolve, 3000))
  }
}
  } catch (error) {
    console.error('Error using assembly ai:--', error);
    await errorLogService.logAndNotifyError('assemblyTranscribeAudio', error);
  }
}