import express from "express";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes FIRST
  app.post("/api/download-report", async (req, res) => {
    try {
      const { url, symbol, year } = req.body;
      if (!url || !symbol || !year) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const reportsDir = path.join(__dirname, "Annual_reports");
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }

      // Determine extension from URL or default to pdf
      let ext = ".pdf";
      if (url.toLowerCase().endsWith(".html") || url.toLowerCase().endsWith(".htm")) {
        ext = ".html";
      }

      const fileName = `${symbol}_${year}${ext}`;
      const filePath = path.join(reportsDir, fileName);

      // Fetch the report
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch report: ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      fs.writeFileSync(filePath, buffer);

      res.json({ success: true, message: `Report saved to Annual_reports/${fileName}`, filePath });
    } catch (error: any) {
      console.error("Error downloading report:", error);
      res.status(500).json({ error: error.message || "Failed to download report" });
    }
  });

  app.get("/api/report/:symbol/:year", (req, res) => {
    const { symbol, year } = req.params;
    const reportsDir = path.join(__dirname, "Annual_reports");
    const pdfPath = path.join(reportsDir, `${symbol}_${year}.pdf`);
    const htmlPath = path.join(reportsDir, `${symbol}_${year}.html`);
    
    if (fs.existsSync(pdfPath)) {
      res.sendFile(pdfPath);
    } else if (fs.existsSync(htmlPath)) {
      res.sendFile(htmlPath);
    } else {
      res.status(404).send("Report not found on server. Please click 'Save to App' first to download it.");
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
