import VideoProcessorModel from "../../../videoProcessor/models/videoProcessor.model";
import AssessmentResponseModel from "../../../interview/models/assessments/assessment.response.model";
import fs, { ensureDir } from "fs-extra";
import { join } from "path";
import ffmpeg from "fluent-ffmpeg";
import ClientResponse from "../../../utilities/response";
import { deleteFile, deleteFilesInDirectory, moveFile } from "../utils";
import ErrorLogService from "../../../errorLog/error.log.service";

const errorLogService = new ErrorLogService();
const videoExtensions = [".mp4", ".mov", ".avi", ".mkv", ".flv", ".wmv"];

export const cleanUpVideos = async function executeProcessVideoCleanUp() {
  const videoDir = join(__dirname, "../../storage/videoCleanUp/downloads");
  const processingDir = join(
    __dirname,
    "../../storage/videoCleanUp/processing"
  );
  const uploadDir = join(__dirname, "../../storage/videoCleanUp/upload");

  try {
    // Ensure directories exist
    await ensureDir(videoDir);
    await ensureDir(processingDir);
    await ensureDir(uploadDir);

    const files = await fs.readdir(videoDir);
    const videoFiles = files.filter((file) =>
      videoExtensions.some((ext) => file.endsWith(ext))
    );

    if (videoFiles.length === 0) {
      console.log("No video in the cleanup downloads folder to process");
      return new ClientResponse(
        400,
        false,
        "No video in the cleanup downloads folder to process",
        null
      );
    }

    const inputVideoPath = `${videoDir}/${videoFiles[0]}`;
    const outputVideoPath = `${processingDir}/${videoFiles[0]}`;
    const uploadVideoPath = `${uploadDir}/${videoFiles[0]}`;

    console.log("Processing video cleanup...");
    await convertToMp4(inputVideoPath, outputVideoPath);
    await moveFile(outputVideoPath, uploadDir);

    const videoDurationInSeconds = await getVideoDuration(uploadVideoPath);
    console.log("Video duration (seconds):", videoDurationInSeconds);

    await updateDocument(videoFiles[0], videoDurationInSeconds);
    await VideoProcessorModel.uploadFileToAws(inputVideoPath);
    console.log("Uploaded to AWS...");
    await deleteFile(inputVideoPath);
    await deleteFilesInDirectory(uploadDir);

    console.log("Video cleanup and upload completed successfully!");
    return "success";
  } catch (error) {
    console.error("Error during video cleanup:", error);
    await errorLogService.logAndNotifyError("videoCleanUp", error);
    throw new ClientResponse(
      500,
      false,
      "Error during video cleanup",
      error.message
    );
  }
};

function convertToMp4(inputPath: string, outputPath: string) {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .outputFormat("mp4")
      .videoCodec("copy")
      .audioCodec("copy")
      .addOutputOption("-strict", "-2")
      .on("end", resolve)
      .on("error", (err, stdout, stderr) => {
        console.error("FFmpeg error:", err);
        console.error("FFmpeg stdout:", stdout);
        console.error("FFmpeg stderr:", stderr);
        reject(err);
      })
      .save(outputPath);
  });
}

function getVideoDuration(filePath: string) {
  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(filePath)
      .ffprobe((err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data.format.duration);
        }
      });
  });
}

async function updateDocument(fileName: string, videoDurationInSeconds: any) {
  try {
    const filter = { video_link: fileName };
    const update = { $set: { video_duration: videoDurationInSeconds } };
    await AssessmentResponseModel.findOneAndUpdate(filter, update, {
      new: true,
    });

    const filter2 = { "videos.video_link": fileName };
    const update2 = { $set: { "videos.$.isCleanedUp": true } };
    await VideoProcessorModel.findOneAndUpdate(filter2, update2, { new: true });

    return "success";
  } catch (error) {
    console.error("Error updating documents:", error);
    await errorLogService.logAndNotifyError("videoCleanUp", error);
    throw error;
  }
}
