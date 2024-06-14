import https from 'https';
import download from 'download';
import { join } from 'path';
import { CONSTANTS, videoReelsDownloadPath, videoTranscribeDownloadPath } from './../../utilities/constants';
import ClientResponse from '../../utilities/response';
import { VIDEO_OPERATION_TYPE } from '../../videoProcessor/services/enum';
import { deleteFilesInDirectory, ensureDirectoryExists, filterUrl } from '../../videoProcessor/services/utils';
import fs from 'fs-extra';

const downloadVideosLocally = async (type: VIDEO_OPERATION_TYPE, links: string[]) => {
    try {
        if (links.length === 0) {
            return new ClientResponse(404, false, 'No videos to download', null);
        }

        const validLinks: string[] = await Promise.all(
            links.map(link => new Promise<string>((resolve, reject) => {
                const fullURL = link.startsWith('https') ? link : `${CONSTANTS.ZWILT_S3_URL}${link}`;
                https.get(fullURL, (res: any) => {
                    if (res.statusCode >= 200 && res.statusCode < 400) {
                        resolve(fullURL);
                    } else {
                        reject(new Error(`Failed to validate link: ${fullURL}`));
                    }
                }).on('error', reject);
            }))
        ).catch(error => {
            console.error('An error occurred while validating links:', error);
            return [];
        });

        if (validLinks.length === 0) {
            return new ClientResponse(404, false, 'No valid videos to download', null);
        }

        const downloadPath = join(__dirname, type === VIDEO_OPERATION_TYPE.TRANSCRIBE ? videoTranscribeDownloadPath : videoReelsDownloadPath);

        // Ensure the directory exists
        await ensureDirectoryExists(downloadPath);

        console.log("Downloading Video...");
        await Promise.all(validLinks.map(async (url) => {
            const filePath = join(downloadPath, encodeURIComponent(filterUrl(url)));
            console.log(`Downloading: ${url} to ${filePath}`);
            await download(url, downloadPath, { filename: encodeURIComponent(filterUrl(url)) });
            console.log(`Downloaded: ${url} to ${filePath}`);
        }));

        console.log('Videos Downloaded...', downloadPath);

        // Verify each file exists
        for (const url of validLinks) {
            const filePath = join(downloadPath, encodeURIComponent(filterUrl(url)));
            try {
                await fs.access(filePath);
                console.log(`File exists: ${filePath}`);
            } catch (err) {
                console.error(`File does not exist: ${filePath}`);
                return new ClientResponse(500, false, `File not downloaded: ${filePath}`, null);
            }
        }
        deleteFilesInDirectory(downloadPath);
        return 'success';
    } catch (error) {
        console.error('Error occurred when downloading videos.', error);
        return new ClientResponse(500, false, 'Internal Server Error', error.message);
    }
};

export default downloadVideosLocally;

// const downloadVideosLocally = async (type: VIDEO_OPERATION_TYPE, links: string[]) => {
//     try {
//         if (links.length === 0) {
//             return new ClientResponse(404, false, 'No videos to download', null);
//         }

//         const validLinks: string[] = await Promise.all(
//             links.map(link => new Promise<string>((resolve, reject) => {
//                 const fullURL = link.startsWith('https') ? link : `${CONSTANTS.ZWILT_S3_URL}${link}`;
//                 https.get(fullURL, (res: any) => {
//                     if (res.statusCode >= 200 && res.statusCode < 400) {
//                         resolve(fullURL);
//                     } else {
//                         reject(new Error(`Failed to validate link: ${fullURL}`));
//                     }
//                 }).on('error', reject);
//             }))
//         ).catch(error => {
//             console.error('An error occurred while validating links:', error);
//             return [];
//         });

//         if (validLinks.length === 0) {
//             return new ClientResponse(404, false, 'No valid videos to download', null);
//         }

//         const downloadPath = join(__dirname, type === VIDEO_OPERATION_TYPE.TRANSCRIBE ? videoTranscribeDownloadPath : videoReelsDownloadPath);
       
//          // Ensure the directory exists
//          await ensureDirectoryExists(downloadPath);
       
//         console.log("Downloading Video...");
//         await Promise.all(validLinks.map(url => download(url, downloadPath, {
//             filename: encodeURIComponent(filterUrl(url)),
//         })));

//         console.log('Videos Downloaded...', downloadPath);

//         return 'success';
//     } catch (error) {
//         console.error('Error occurred when downloading videos.', error);
//         return new ClientResponse(500, false, 'Internal Server Error', error.message);
//     }
// };

// export default downloadVideosLocally;
