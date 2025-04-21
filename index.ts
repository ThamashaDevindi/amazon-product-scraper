import cors from "cors";
import express from "express";
import axios from "axios";
import { JSDOM } from "jsdom";



const app = express();
const PORT = 3000;

app.use(cors());

app.get("/api/scrape", async (req, res) => {
  const keyword = req.query.keyword as string;

  if (!keyword) {
    return res.status(400).json({ error: "Missing 'keyword' query parameter" });
  }

  try {
    const url = `https://www.amazon.com/s?k=${encodeURIComponent(keyword)}`;

    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36",
      },
    });

    const dom = new JSDOM(response.data);
    const document = dom.window.document;
    const items = document.querySelectorAll("[data-component-type='s-search-result']");

    const results: any[] = [];

    items.forEach((item) => {
      const title = item.querySelector("h2 a span")?.textContent?.trim() || "No Title";
      const rating = item.querySelector(".a-icon-alt")?.textContent?.split(" ")[0] || "No Rating";
      const reviewCount = item.querySelector(".a-size-base.s-underline-text")?.textContent?.trim() || "0";
      const image = item.querySelector("img.s-image")?.getAttribute("src") || "";

      results.push({ title, rating, reviewCount, image });
    });

    res.json({ results });
  } catch (error) {
    console.error("Scraping error:", error);
    res.status(500).json({ error: "Failed to scrape data" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server is running at http://localhost:${PORT}`);
});
