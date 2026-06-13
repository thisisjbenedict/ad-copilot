const express = require("express");
const cors = require("cors");
const multer = require("multer");
const {extractText} = require("./services/pdfService");
const {analyzeScript} = require("./services/analysisService");

const app = express();
const upload = multer({
    dest: "uploads/"
});

const PORT = 3001;
let latestAnalysis = null;

app.use(cors());

app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});

app.post("/upload", 
    upload.single("script"), 
    async (req, res) => {
        try{
            if (!req.file) {
                return res.status(400).json({
                    error: "No file uploaded"
                });
            }
        
            const text = await extractText(req.file.path);
            const analysis =
  await analyzeScript(text);

latestAnalysis =
  analysis;

res.json({
  success: true,
  fileName:
    req.file.originalname,
  preview:
    text.substring(0,500),
  analysis,
});
        } catch(error){
            console.error(error);
            res.status(500).json({
                error: "Upload failed",
            });
        }
    }
);

const PDFDocument =
  require("pdfkit");

app.get("/export-pdf", (req, res) => {

    if (!latestAnalysis) {

        return res
            .status(400)
            .send("Please analyze a screenplay first.");

    }

    const doc = new PDFDocument({
        margin: 50
    });

    res.setHeader(
        "Content-Type",
        "application/pdf"
    );

    res.setHeader(
        "Content-Disposition",
        "attachment; filename=script2shoot-report.pdf"
    );

    doc.pipe(res);

    /*
     * COVER
     */

    doc
        .fontSize(24)
        .text("Script2Shoot", {
            align: "center"
        });

    doc.moveDown();

    doc
        .fontSize(16)
        .text("Production Planning Report", {
            align: "center"
        });

    doc.moveDown(2);

    doc.text(
        `Generated: ${new Date().toLocaleString()}`
    );

    doc.moveDown(2);

    /*
     * PROJECT SUMMARY
     */

    doc
        .fontSize(18)
        .text("Project Summary");

    doc.moveDown();

    doc.text(
        `Genre: ${
            latestAnalysis.genre ||
            "Unknown"
        }`
    );

    doc.text(
        `Scenes count: ${
            latestAnalysis.scenes?.length ||
            0
        }`
    );

    doc.moveDown(2);

    /*
     * SCENE BREAKDOWN
     */

    doc
        .fontSize(18)
        .text("Scene Breakdown");

    doc.moveDown();

    latestAnalysis.scenes?.forEach(scene => {

        doc
            .fontSize(13)
            .text(
                `Scene ${scene.sceneNumber}: ${scene.title}`
            );

        doc.text(
            `Location: ${
                scene.location || "Unknown"
            }`
        );

        doc.text(
            `Actors: ${
                scene.actors?.join(", ") ||
                "None"
            }`
        );

        doc.text(
            `Props: ${
                scene.props?.join(", ") ||
                "None"
            }`
        );

        doc.text(
            `Complexity: ${
                scene.complexityScore || 0
            } / 10`
        );

        doc.moveDown();

    });

    /*
     * REQUIREMENTS
     */

    doc.addPage();

    doc
        .fontSize(18)
        .text("Production Requirements");

    doc.moveDown();

    const requirements = [
        ...new Set(
            latestAnalysis.scenes?.flatMap(
                scene =>
                    scene.specialRequirements || []
            ) || []
        )
    ];

    if (requirements.length > 0) {

        requirements.forEach(reqItem => {

            doc.text(
                `• ${reqItem}`
            );

        });

    } else {

        doc.text(
            "No special requirements identified."
        );

    }

    /*
     * PRODUCTION NOTES
     */

    doc.moveDown(2);

    doc
        .fontSize(18)
        .text("Production Notes");

    doc.moveDown();

    const allRequirements =
        requirements
            .join(" ")
            .toLowerCase();

    if (
        allRequirements.includes("crowd")
    ) {

        doc.text(
            "• Consider crowd management and additional assistant directors."
        );

    }

    if (
        allRequirements.includes("vehicle")
    ) {

        doc.text(
            "• Vehicle scenes may require permits and safety supervision."
        );

    }

    if (
        allRequirements.includes("animal")
    ) {

        doc.text(
            "• Animal scenes may require handlers and special scheduling."
        );

    }

    if (
        allRequirements.includes("stunt")
    ) {

        doc.text(
            "• Stunt sequences should be reviewed with a stunt coordinator."
        );

    }

    if (
        allRequirements.includes("night")
    ) {

        doc.text(
            "• Night shoots may require additional lighting and crew planning."
        );

    }

    if (
        requirements.length === 0
    ) {

        doc.text(
            "• No major production risks detected."
        );

    }

    /*
     * SHOOT PLAN
     */

    if (
        latestAnalysis.shootPlan &&
        latestAnalysis.shootPlan.length
    ) {

        doc.addPage();

        doc
            .fontSize(18)
            .text("Shoot Plan");

        doc.moveDown();

        latestAnalysis.shootPlan.forEach(day => {

  doc
    .fontSize(14)
    .text(
      `Day ${day.day}`
    );

  doc.text(
    `Location: ${day.location}`
  );

  doc.text(
    `Scene Count: ${
      day.totalScenes
    }`
  );

  doc.text(
    `Scene Numbers: ${
      day.sceneNumbers.join(", ")
    }`
  );

  doc.text(
    `Complexity: ${
      day.averageComplexity
    } / 10`
  );

  doc.text(
    `Risk Level: ${
      day.riskLevel
    }`
  );

  doc.text(
    `Actor Count: ${
      day.actors.length
    }`
  );

  doc.text(
    `Actors: ${
      day.actors.join(", ")
    }`
  );

  if (
    day.requirements?.length
  ) {

    doc.text(
      `Requirements: ${
        day.requirements.join(", ")
      }`
    );

  }

  doc.text(
    `Recommendation: ${
      day.recommendation
    }`
  );

  doc.moveDown(2);

});

    }

    doc.end();

});