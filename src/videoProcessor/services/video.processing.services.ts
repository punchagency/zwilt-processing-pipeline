import {Service} from 'typedi';
import fs from 'node:fs';

import ffmpeg from 'fluent-ffmpeg';
// import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import path from 'node:path';
import processVideoConstant from '../../config/processVideoConstant';
import VideoProcessorModel from '../models/videoProcessor.model';
import {Request, Response} from 'express';
import https from 'node:https';
import {IncomingMessage} from 'node:http';
import download from 'download';
import {s3ClientPutObject} from '../../utilities/aws/s3Client';

@Service()
export default class VideoProcessingService {
  async processHlsVideo(stream: any) {
    // ffmpeg.setFfmpegPath(ffmpegInstaller.path);
    const mp4FileName = 'video.mp4';
    const hlsFolder = 'hls';
    const bucketName = process.env.AWS_BUCKET_NAME;
    const writeableStream = fs.createWriteStream('local.mp4');

    stream.pipe(writeableStream);
    await new Promise((resolve, reject) => {
      writeableStream.on('finish', resolve);
      writeableStream.on('error', reject);
    });

    const resolutions = [
      {
        resolution: '320x180',
        videoBitrate: '500k',
        audioBitrate: '64k',
      },
      {
        resolution: '854x480',
        videoBitrate: '1000k',
        audioBitrate: '128k',
      },
      {
        resolution: '1280x720',
        videoBitrate: '2500k',
        audioBitrate: '192k',
      },
    ];

    const variantPlaylists = [];

    /*
        create neccessary file for each resolution
        create variant playlist for each resolution which contains the .m3u8 file
        for that resolution and the segment files for that resolution
    */
    for (const {resolution, videoBitrate, audioBitrate} of resolutions) {
      console.log(`HLS conversion starting for ${resolution}`);
      const outputFileName = `${mp4FileName.replace(
        '.',
        '_'
      )}_${resolution}.m3u8`;
      const segmentFileName = `${mp4FileName.replace(
        '.',
        '_'
      )}_${resolution}_%03d.ts`;
      try {
        await new Promise<void>((resolve, reject) => {
          ffmpeg('./local.mp4')
            .outputOptions([
              `-c:v h264`,
              `-b:v ${videoBitrate}`,
              `-c:a aac`,
              `-b:a ${audioBitrate}`,
              `-vf scale=${resolution}`,
              `-f hls`,
              `-hls_time 10`,
              `-hls_list_size 0`,
              `-hls_segment_filename hls/${segmentFileName}`,
            ])
            .output(`hls/${outputFileName}`)
            .on('end', () => resolve())
            .on('error', err => reject(err))
            .run();
        });
        const variantPlaylist = {
          resolution,
          outputFileName,
        };
        variantPlaylists.push(variantPlaylist);
      } catch (err) {
        //TODO: HANDLE ERROR UPLOADING FILES TO S3
        console.log('FFMPEG ERROR', err);
      }
      //   console.log(`HLS conversion done for ${resolution}`);
    }

    /* Generating the HLS master m3u8 file add the filename of each resolution m3u8 */

    let masterPlaylist = variantPlaylists
      .map(variantPlaylist => {
        const {resolution, outputFileName} = variantPlaylist;
        const bandwidth =
          resolution === '320x180'
            ? 676800
            : resolution === '854x480'
            ? 1353600
            : 3230400;
        return `#EXT-X-STREAM-INF:BANDWIDTH=${bandwidth},RESOLUTION=${resolution}\n${outputFileName}`;
      })
      .join('\n');
    masterPlaylist = `#EXTM3U\n` + masterPlaylist;

    const masterPlaylistFileName = `${mp4FileName.replace(
      '.',
      '_'
    )}_master.m3u8`;
    const masterPlaylistPath = `hls/${masterPlaylistFileName}`;
    fs.writeFileSync(masterPlaylistPath, masterPlaylist);
    console.log(`HLS master m3u8 playlist generated`);

    console.log(`Deleting locally downloaded s3 mp4 file`);

    fs.unlinkSync('local.mp4');

    // upload to all files to s3
    const files = fs.readdirSync(hlsFolder);

    for (const file of files) {
      if (!file.startsWith(mp4FileName.replace('.', '_'))) {
        continue;
      }
      const filePath = path.join(hlsFolder, file);
      const fileStream = fs.createReadStream(filePath);
      const uploadParams = {
        Bucket: bucketName,
        Key: `${hlsFolder}/${file}`,
        Body: fileStream,
        ContentType: file.endsWith('.ts')
          ? 'video/mp2t'
          : file.endsWith('.m3u8')
          ? 'application/x-mpegURL'
          : null,
      } as any;
      await s3ClientPutObject(uploadParams);
      //remove/delete file locally after upload to aws s3
      fs.unlinkSync(filePath);
    }
  }

  async fetchVideoToProcess(req: Request, res: Response) {
    if (
      !fs.existsSync(processVideoConstant.PROCESSED_FOLDER) ||
      !fs.readdirSync(processVideoConstant.PROCESSED_FOLDER).length
    ) {
      console.log('No files in the processed folder');
    } else {
      // delete everything in the folder
      this.downloadVideosLocally(req, res);
    }
  }

  async downloadVideosLocally(_req: Request, res: Response) {
    const result = await VideoProcessorModel.find({})
      .select('- _id -videos._id -createdAt - __v')
      .exec();
    if (!result) {
      return;
    }

    //select all unprocessed videos
    const unProccessedVideos = result.map(data => {
      return {
        // user: data.user,
        videos: data.videos.filter(
          item =>
            //  item.isDownloaded === false
            item.isVideoProcessed === false
        ),
      };
    });

    let links: string[] = [];
    const validLinks: any = [];
    const promises: any = [];
    unProccessedVideos.forEach(obj => {
      links = [
        ...obj.videos.map(
          o => processVideoConstant.ZWILT_S3_URL + o.video_link
        ),
        ...links,
      ];
    });
    if (unProccessedVideos.length > 0) {
      //Filter out invalid links before downloading
      links.forEach(link => {
        if (link.startsWith('https')) {
          const promise = new Promise<void>((resolve, _reject) => {
            https.get(link, (res: IncomingMessage) => {
              console.log('Link: ', res.statusCode);
              if (
                res.statusCode &&
                res.statusCode >= 200 &&
                res.statusCode < 400
              ) {
                validLinks.push(link);
                resolve();
                // console.log("Valid Links: ", link);
              } else {
                // console.log("Invalid Links: ", link)
                // reject();
                resolve();
              }
            });
          });
          promises.push(promise);
        }
      });
      Promise.all(promises)
        .then(() => {
          (async () => {
            await Promise.all(
              validLinks.map(async (url: string) =>
                download(url, 'downloads', {
                  filename: encodeURIComponent(this.filterUrl(url)),
                })
              )
            );
          })()
            .then(() => {
              if (validLinks.length > 0) {
                this.updateDownloadState();
                return res.json({Success: 'Videos downloaded successfully'});
              } else {
                console.log('No valid links to download');
                return res.json({message: 'No valid links to download'});
              }
            })
            .catch(error => {
              console.log('Error occured when downloading videos. ', error);
              return res.json({'Error Occured': error});
            });
        })
        .catch(err =>
          console.log('An Error Occur while  Checking the links:', err)
        );
    }
  }

  filterUrl(url: string) {
    url = url.substring(url.indexOf('.com/') + 5);
    return url;
  }

  async updateDownloadState() {
    const videoDir = processVideoConstant.DOWNLOAD_FOLDER;

    //loop through all the files in the video directory
    fs.readdir(videoDir, async (err, files) => {
      if (err) {
        console.error('Could not list the directory.', err);
        process.exit(1);
      }
      if (files.length) {
        //TODO: look through this again
        const decodedVideoArr = files.map((file: string) =>
          decodeURIComponent(file)
        );
        try {
          const result = await VideoProcessorModel.updateMany(
            {},
            {$set: {'videos.$[elem].isDownloaded': true}},
            {arrayFilters: [{'elem.video_link': {$in: decodedVideoArr}}]}
          );
          if (result) {
            console.log('Video Downloaded Successfully');
            //TODO: PROCESS VIDEO HERE
          }
        } catch (err) {}
      }
    });
  }

  async processVideo() {
    const videoDir = processVideoConstant.DOWNLOAD_FOLDER;
    //loop through all the files in the video directory
    fs.readdir(videoDir, async (err, files) => {
      if (err) {
        console.error('Could not list the directory.', err);
        process.exit(1);
      }
      if (files.length > 0) {
        fs.readdir(processVideoConstant.DOWNLOAD_FOLDER, async (err, files) => {
          if (err) {
            console.log('Error reading files from download folder', err);
            return;
          }
          if (!fs.existsSync(`./processed/`)) {
            fs.mkdirSync(`processed`);
          }
          for (const file of files) {
            const fileName = file
              .split('.')
              .splice(0, file.split('.').length - 1)
              .join('.');
            //create file folder
            console.log('file', file);
            if (
              !fs.existsSync(
                `${processVideoConstant.PROCESSED_FOLDER}/${fileName}`
              )
            ) {
              fs.mkdirSync(`${processVideoConstant.PROCESSED}/${fileName}`);
            }
            try {
              const resolutions = [
                {
                  resolution: '320x180',
                  videoBitrate: '500k',
                  audioBitrate: '64k',
                  resolution_name: '144p',
                },
                {
                  resolution: '854x480',
                  videoBitrate: '900k',
                  audioBitrate: '128k',
                  resolution_name: '480p',
                },
                {
                  resolution: '640x360',
                  videoBitrate: '500k',
                  audioBitrate: '128k',
                  resolution_name: '360p',
                },
                // {
                //   resolution: "1280x720",
                //   videoBitrate: "2500k",
                //   audioBitrate: "192k",
                //   resolution_name: "720p",
                // },
              ];

              const variantPlaylists: any = [];
              await new Promise<void>((resolve, reject) => {
                for (const {
                  resolution,
                  audioBitrate,
                  videoBitrate,
                  resolution_name,
                } of resolutions) {
                  const segmentFileName = `video_${resolution}_%03d.ts`;
                  const outputFileName = `index.m3u8`;

                  try {
                    if (
                      !fs.existsSync(
                        `${processVideoConstant.PROCESSED_FOLDER}/${fileName}/${resolution_name}`
                      )
                    ) {
                      fs.mkdirSync(
                        `${processVideoConstant.PROCESSED_FOLDER}/${fileName}/${resolution_name}`
                      );
                    }
                    ffmpeg(`./downloads/${file}`)
                      .outputOptions([
                        `-c:v h264`,
                        `-b:v ${videoBitrate}`,
                        `-c:a aac`,
                        `-b:a ${audioBitrate}`,
                        `-vf scale=${resolution}`,
                        `-f hls`,
                        `-hls_time 10`,
                        `-hls_list_size 0`,
                        `-hls_segment_filename downloads/${fileName}/${resolution_name}/${segmentFileName}`,
                        `-hls_playlist_type vod`,
                      ])
                      .output(
                        `downloads/${fileName}/${resolution_name}/${outputFileName}`
                      )
                      .on('end', () => {
                        console.log('finished');
                        resolve();
                      })
                      .on('error', err => {
                        console.log('REAL error', err);
                        reject();
                      })
                      .run();
                    //   const outputLoc = `downloads/${fileName}/${resolution_name}/${outputFileName}`;
                    const variantPlaylist = {
                      resolution,
                      // outputFileName,
                      resolution_name,
                    };
                    variantPlaylists.push(variantPlaylist);
                  } catch (err) {
                    console.log(
                      `error converting resolution ${resolution}`,
                      err
                    );
                  }
                }
              });
              this.generateMasetrPlaylist(fileName, variantPlaylists);
            } catch (err) {
              //TODO: HANDLE ERROR UPLOADING FILES TO S3
              console.log('FFMPEG ERROR', err);
            }
          }
        });
      }
    });
  }

  async generateMasetrPlaylist(fileName: string, variantPlaylists: any) {
    let masterPlaylist = variantPlaylists
      .map(({resolution, resolution_name}: any) => {
        const outputLoc = `${resolution_name}/index.m3u8`;
        return `#EXT-X-STREAM-INF:BANDWIDTH=${this.getbandWidth(
          resolution
        )},RESOLUTION=${resolution}\n${outputLoc}\n`;
      })
      .join('');

    masterPlaylist = `#EXTM3U\n` + masterPlaylist;

    const masterPlaylistPath = `${processVideoConstant.PROCESSED}/${fileName}/${fileName}.m3u8`;
    fs.writeFileSync(masterPlaylistPath, masterPlaylist);
  }

  getbandWidth(resolution: string) {
    switch (resolution) {
      case '144p':
        return 500000;
      case '480p':
        return 1000000;
      case '720p':
        return 2500000;
      case '360p':
        return 800000;
      default:
        return 0;
    }
  }

  async uploadToAwsS3() {
    //downloads folder contains all FileNameFolder
    fs.readdir(
      `${processVideoConstant.PROCESSED_FOLDER}`,
      async (err, processedFolder) => {
        if (err) return;
        for (const fileNameFolder in processedFolder) {
          try {
            const stats = await fs.promises.stat(
              `${processVideoConstant.PROCESSED_FOLDER}/${fileNameFolder}`
            );
            //check if content is a directory
            //if is a directory then loop through the directory and upload all files in the directory
            /* 
          fileNameFolder 
            - 144p
              index.m3u8
              video_144p_000.ts
              video_144p_001.ts
            - 480p
              index.m3u8
              video_480p_000.ts
              video_480p_001.ts
            - 720p
            - fileName.m3u8
        */
            //fileNameFolder
            if (stats.isDirectory()) {
              fs.readdir(
                `${processVideoConstant.PROCESSED_FOLDER}/${fileNameFolder}`,
                async (err, fileNameFolderItr) => {
                  if (err) return;
                  for (const item of fileNameFolderItr) {
                    const itemStat = await fs.promises.stat(
                      `${processVideoConstant.PROCESSED_FOLDER}/${fileNameFolder}/${item}`
                    );
                    const is_resolution_folder = itemStat.isDirectory();
                    if (is_resolution_folder) {
                      //upload segments(chunks .ts) and resolution .m3u8
                      //loop through the resolution folder to upload the .m3u8 and segment(video chunk for resolution)

                      fs.readdir(
                        `${processVideoConstant.PROCESSED_FOLDER}/${fileNameFolder}/${item}`,
                        async (_err, resolutionFolderItr) => {
                          for (const resolutionFolderItem of resolutionFolderItr) {
                            try {
                              const filePath = path.join(
                                `${processVideoConstant.PROCESSED_FOLDER}/${fileNameFolder}/${item}`,
                                resolutionFolderItem
                              );
                              const fileStream = fs.createReadStream(filePath);
                              const uploadParams = {
                                Bucket: process.env.AWS_BUCKET_NAME,
                                Key: `${fileNameFolder}/${item}/${resolutionFolderItem}`,
                                Body: fileStream,
                                ContentType: resolutionFolderItem.endsWith(
                                  '.ts'
                                )
                                  ? 'video/mp2t'
                                  : resolutionFolderItem.endsWith('.m3u8')
                                  ? 'application/x-mpegURL'
                                  : null,
                              } as any;
                              await s3ClientPutObject(uploadParams);
                              //remove/delete file locally after upload to aws s3
                              fs.unlinkSync(filePath);
                            } catch (err) {
                              console.log(
                                'Error occured while uploading to aws s3',
                                `${fileNameFolder}/${item}/${resolutionFolderItem}`
                              );
                            }
                          }
                        }
                      );
                    } else {
                      // the is the master file
                      const filePath = path.join(
                        `${processVideoConstant.PROCESSED_FOLDER}/${fileNameFolder}`,
                        item
                      );
                      const fileStream = fs.createReadStream(filePath);

                      const uploadParams = {
                        Bucket: process.env.AWS_BUCKET_NAME,
                        Key: `${fileNameFolder}/${item}`,
                        Body: fileStream,
                        // ACL: 'public-read',
                        ContentType: item.endsWith('.ts')
                          ? 'video/mp2t'
                          : item.endsWith('.m3u8')
                          ? 'application/x-mpegURL'
                          : null,
                      } as any;
                      // {
                      //   accessKeyId: process.env.ACCESS_KEY_ID,
                      //   secretAccessKey: process.env.SECRET_ACCESS_KEY,
                      // }
                      await s3ClientPutObject(uploadParams);
                      //remove/delete file locally after upload to aws s3
                      fs.unlinkSync(filePath);
                    }
                  }
                }
              );
            }
          } catch (err) {
            console.log(
              'Error occured while uploading to aws s3',
              fileNameFolder
            );
          }
        }
      }
    );
  }

  async updateIsProcessedState(fileName: string) {
    const result = await VideoProcessorModel.updateMany(
      {},
      {$set: {'videos.$[elem].isVideoProcessed': true}},
      {arrayFilters: [{'elem.video_link': fileName}]}
    );
    if (result) {
      console.log('Video Processed Successfully');
    }
  }
}
