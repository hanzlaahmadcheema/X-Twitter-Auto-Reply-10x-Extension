from fastapi import FastAPI
from fastapi.responses import FileResponse
from tweetcapture import TweetCapture
import os

app = FastAPI()

# Initialize TweetCapture
tweet = TweetCapture()

# Create downloads folder if it doesn't exist
os.makedirs("downloads", exist_ok=True)

@app.get("/capture")
async def capture_tweet(url: str, mode: int = 3, wait_time: float = 3.0):
    """
    API to capture a tweet screenshot and return the file path as JSON.
    """
    if not (1.0 <= wait_time <= 10.0):
        return {"error": "wait_time must be between 1.0 and 10.0 seconds"}

    tweet.set_wait_time(wait_time)

    # Generate filename
    tweet_id = url.split("/")[-1]  # Extract tweet ID from URL
    output_path = f"downloads/{tweet_id}.png"

    # Capture the tweet screenshot
    await tweet.screenshot(url, output_path, mode=mode, overwrite=True)

    return {
        "status": "success",
        "message": "Screenshot captured successfully",
        "file_path": output_path
    }

# Serve the captured screenshots
@app.get("/downloads/{filename}")
async def get_screenshot(filename: str):
    file_path = f"downloads/{filename}"
    if not os.path.exists(file_path):
        return {"error": "File not found"}
    return FileResponse(file_path, media_type="image/png", filename=filename)

# Run API using: uvicorn tweet_api:app --reload
