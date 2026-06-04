const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());

app.get("/health", (req, res) => {
    res.json({
        status: "UP",
        service: "AD Copilot Backend",
    } );
});

const PORT = 3001;

app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});