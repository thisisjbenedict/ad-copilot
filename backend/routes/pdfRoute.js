const PDFDocument =
  require("pdfkit");

app.get(
  "/export-pdf",
  (req,res) => {

    const doc =
      new PDFDocument();

    res.setHeader(
      "Content-Type",
      "application/pdf"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=report.pdf"
    );

    doc.pipe(res);

    doc.fontSize(24)
       .text("Script2Shoot");

    doc.moveDown();

    doc.text(
      "Production Planning Report"
    );

    doc.end();

  }
);