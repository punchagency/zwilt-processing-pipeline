import axios from 'axios';
import fs from 'fs-extra';
import {join} from 'path';
import {
  convertedAudioPath,
  scriptDirectory,
  videoCleanUpDownloadPath,
  videoTranscribeDownloadPath,
  videoTranscribeProcessingPath,
} from '../../../utilities/constants';
import VideoProcessorModel from '../../../videoProcessor/models/videoProcessor.model';
import AssessmentResponseModel from '../../../interview/models/assessments/assessment.response.model';
import {changeFileExtension, deleteFilesInDirectory, moveFile} from '../utils';
import ClientResponse from '../../../utilities/response';
import {convertVideoToMP3} from '../audioOperations/video.to.audio.service';
import {cleanUpVideos} from './video.cleanup.service';

export const assemblyAITranscribeAudio =
  async function executeAssemblyAITranscibeAudio() {
    try {
      const baseUrl = 'https://api.assemblyai.com/v2';
      const headers = {
        authorization: 'c38dc46e6b414f5e8b2f67d28afe1755',
      };

      const convertedAudioDir = join(scriptDirectory, convertedAudioPath);
      const audioFiles = fs.readdirSync(convertedAudioDir);

      if (audioFiles.length > 0) {
        const audioFileName = audioFiles[0];
        const convertedAudioFilePath = join(
          scriptDirectory,
          convertedAudioPath + '/' + audioFileName
        );
        const processingDir = join(
          scriptDirectory,
          videoTranscribeProcessingPath
        );
        const path = join(scriptDirectory, convertedAudioPath, audioFileName);
        const audioData = await fs.readFile(path);
        console.log('Connecting to assembly AI...');
        const uploadResponse = await axios.post(
          `${baseUrl}/upload`,
          audioData,
          {
            headers,
          }
        );

        const uploadUrl = uploadResponse.data.upload_url;

        const data = {
          audio_url: uploadUrl,
        };

        const url = `${baseUrl}/transcript`;
        const response = await axios.post(url, data, {headers});

        const transcriptId = response.data.id;
        const pollingEndpoint = `${baseUrl}/transcript/${transcriptId}`;
        console.log(`Generating transcript for ${audioFileName} ....`);
        let polling = true;

        while (polling) {
          const pollingResponse = await axios.get(pollingEndpoint, {
            headers,
          });
          const transcriptionResult = pollingResponse.data;

          if (transcriptionResult.status === 'completed') {
            console.log('Transcript generated successfully....');
            moveFile(convertedAudioFilePath, processingDir)
              .then(() => {
                console.log('Updating db record....');
                const {id, text} = transcriptionResult;

                const simplifiedWords = transcriptionResult.words.map(
                  (word: any) => ({
                    text: word.text,
                    start: word.start,
                    end: word.end,
                  })
                );

                const simplifiedTranscript = {id, text, words: simplifiedWords};

                const audioFileNameMp4 = changeFileExtension(
                  audioFileName,
                  '.mp4'
                );
                updateDocument(
                  audioFileNameMp4,
                  simplifiedTranscript,
                  processingDir
                );
              })
              .catch(err => {
                console.error('Error moving file:', err);
              });
            polling = false;
          } else if (transcriptionResult.status === 'error') {
            throw new Error(
              `Transcription failed: ${transcriptionResult.error}`
            );
          } else {
            await new Promise(resolve => setTimeout(resolve, 3000));
          }
        }
      } else {
        return new ClientResponse(
          200,
          true,
          'EXITED>>No audio file in the convertedAudios folder to process',
          null
        );
      }
    } catch (error) {
      console.error('Error transcribing audio:', error);
      return undefined;
    }
    return undefined;
  };

const updateDocument = async (
  initialFilename: string,
  transcriptionResult: any,
  processingDir: string
) => {
  try {
    const inputVideoPath = join(
      scriptDirectory,
      videoTranscribeDownloadPath + '/' + initialFilename
    );
    const videoCleanUpDownloadDir = join(
      scriptDirectory,
      videoCleanUpDownloadPath
    );

    const filter = {'videos.video_link': initialFilename};
    const update = {$set: {'videos.$.transcript': transcriptionResult}};
    await AssessmentResponseModel.findOneAndUpdate(filter, update, {new: true});

    const videoProcessorUpdateFilter = {'videos.video_link': initialFilename};
    const videoProcessorUpdate = {$set: {'videos.$.isTranscribed': true}};

    await VideoProcessorModel.findOneAndUpdate(
      videoProcessorUpdateFilter,
      videoProcessorUpdate,
      {new: true}
    );

    deleteFilesInDirectory(processingDir);
    moveFile(inputVideoPath, videoCleanUpDownloadDir)
      .then(() => {
        // return
        console.log(`Transcribe Flow Completed for ${initialFilename}`);
        convertVideoToMP3();
        cleanUpVideos();
      })
      .catch(err => {
        console.log('Error deleting file...', err);
      });
  } catch (error) { 
    console.error('Error updating documents:', error);
    throw error;
  }
};
