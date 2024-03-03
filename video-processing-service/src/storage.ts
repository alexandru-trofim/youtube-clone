import { Storage } from "@google-cloud/storage";
import fs from 'fs';
import ffmpeg from "fluent-ffmpeg";
import { StorageExceptionMessages } from "@google-cloud/storage/build/cjs/src/storage";
import { resolve } from "path";


const storage = new Storage();

const rawVideoBucketName = "trosha-yt-raw-videos";
const processedVideoBucketName= "trosha-yt-raw-videos";

const localRawVideoPath = "./raw-videos";
const localProcessedVideoPath = "./raw-videos";

/**
 * Creates the local directories for raw and processed videos.
 */
export function setupDirectories() {
    ensureDirectoryExistence(localProcessedVideoPath);
    ensureDirectoryExistence(localRawVideoPath);
}

/**
 * Converts the video we got from the cloud to 360p and saves into Processed folder 
 * @param rawVideoName 
 * @param processedVideoName 
 * @returns A promise that resolves when the video has been converted.
 */
export function convertVideo(rawVideoName: string, processedVideoName: string) {

    return new Promise<void>( (resolve, reject) => {
        ffmpeg(`${localRawVideoPath}/${rawVideoName}`)
            .outputOption("-vf", "scale=-1:360") //360p
            .on("end", () => {
                console.log("Processing finished successfully");
                resolve();
            })
            .on("error", function(err: any) {
                console.log('An error occured: ' + err.message);
                reject(err);

            })
            .save(`${localProcessedVideoPath}/${processedVideoName}`);
    });

}

/**
 * 
 * @param fileName 
 */
export async function downloadRawVideo(fileName: string) {
    await storage.bucket(rawVideoBucketName)
        .file(fileName)
        .download({
            destination : `${localRawVideoPath}/${fileName}`,
        });
        console.log(
            `gs://${rawVideoBucketName}/${fileName} downloaded to 
            ${localRawVideoPath}/${fileName}.`
        );
}

/**
 * 
 * @param fileName 
 */
export async function uploadProcessedVideo(fileName: string) {
    const bucket = storage.bucket(processedVideoBucketName);

    // Upload video to the bucket
    await bucket.upload(`${localProcessedVideoPath}/${fileName}`, {
        destination: fileName,
    });

    console.log(
        `${localProcessedVideoPath}/${fileName} uploaded to 
        gs://${processedVideoBucketName}/${fileName}.`);

    // Set the video public
    await bucket.file(fileName).makePublic();

}


export function deleteRawVideo(fileName: string) {
    return deleteFile(`${localRawVideoPath}/${fileName}`);
}

export function deleteProcessedVideo(fileName: string) {
    return deleteFile(`${localProcessedVideoPath}/${fileName}`);
}

export function deleteFile(filePath: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        if (fs.existsSync(filePath)) {
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error(`Failed to delete file at ${filePath}`, err);
                    reject(err);
                } else {
                    console.log(`File deleted at ${filePath}`);
                    resolve();
                }
            });
        } else {
            console.log(`File not found at ${filePath}, skipping dlete.`);
            resolve();
        }
    });
}

function ensureDirectoryExistence(dirPath: string) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, {recursive: true});
        console.log(`Directory created at ${dirPath}`);
    }
}









