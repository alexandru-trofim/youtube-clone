import express from "express";
//ffmpeg is a cli-tool, thus this module is just a wrapper
import ffmpeg from "fluent-ffmpeg";
import { convertVideo, deleteProcessedVideo, deleteRawVideo, downloadRawVideo, uploadProcessedVideo } from "./storage";

const app = express();


//Middleware
app.use(express.json());

// Process a video file from Cloud Storage into 360p
app.post("/process-video", async (req, res) => {

    // Get the bucket and filename from the Cloud Pub/Sub message
    let data;
    try {
        const message = Buffer.from(req.body.message.data, 'base64').toString('utf8');
        data = JSON.parse(message);
        if (!data.name) {
            throw new Error('Invalid message payload received.');
        }
    } catch (error) {
        console.error(error);
        return res.status(400).send('Bad Request: missing filename.');
    }

    const inputFileName = data.name;
    const outputFileName = `processed-${inputFileName}`;

    // Download the raw video from Cloud Storage
    await downloadRawVideo(inputFileName);

    //Process the video into 360p
    try {
        await convertVideo(inputFileName, outputFileName);
    } catch (err) {
        await Promise.all([
            deleteRawVideo(inputFileName),
            deleteProcessedVideo(outputFileName)
        ]);
        res.status(500).send('Processing failed');
    }

    // Upload processed video to Cloud Storage
    await uploadProcessedVideo(outputFileName);

    await Promise.all([
        deleteRawVideo(inputFileName),
        deleteProcessedVideo(outputFileName)
    ]);

    return res.status(200).send('Processing ginished successfully');
});
//If we don't have env variable PATH we set it to 3000
const port = process.env.PORT || 3000; 
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});



























