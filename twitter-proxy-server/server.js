import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

dotenv.config();
const app = express();
const PORT = 3000;

app.use(cors({ origin: 'https://x.com' }));

app.get('/api/user/:username', async (req, res) => {
  const username = req.params.username;
  const twitterBearerToken = process.env.TWITTER_BEARER_TOKEN;

  if (!twitterBearerToken) {
    return res.status(500).json({ error: "Twitter API token not found" });
  }

  const url = `https://api.twitter.com/2/users/by/username/${username}?user.fields=description`;

  try {
    const response = await fetch(url, {
      headers: {
        "Authorization": `Bearer ${twitterBearerToken}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: errorText });
    }

    const data = await response.json();
    const description = data?.data?.description || "No description available";

    res.json({ description });
  } catch (error) {
    console.error("Error fetching Twitter description:", error);
    res.status(500).json({ error: "Failed to fetch description" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
