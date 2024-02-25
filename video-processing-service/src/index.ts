import express from "express";
//ffmpeg is a cli-tool, thus this module is just a wrapper
import ffmpeg from "fluent-ffmpeg";

const app = express();


//Middleware
app.use(express.json());

app.post("/process-video", (req, res) => {
    //Get path of the input video file from the request body
    const inputFilePath = req.body.inputFilePath;
    const outputFilePath = req.body.outputFilePath;

    if (!inputFilePath || !outputFilePath) {
        res.status(400).send("Bad Request: Missing file path.");
    }

    ffmpeg(inputFilePath)
        .outputOption("-vf", "scale=-1:360") //360p
        .on("end", () => {
            return res.status(200).send("Video processing started.")
        })
        .on("error", function(err: any) {
            console.log('An error occured: ' + err.message);
            res.status(500).send('An error occured: ' + err.message);
        })
        .save(outputFilePath);

});
//If we don't have env variable PATH we set it to 3000
const port = process.env.PORT || 3000; 
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});



























