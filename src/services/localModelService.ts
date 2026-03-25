export async function analyzeArabicSentimentBatchLocal(
  comments: string[],
  // endpoint: string = "http://localhost:8555/analyze"
  endpoint: string = "https://nonevadingly-postcardinal-kaitlynn.ngrok-free.dev/analyze"

): Promise<{ sentiment: 'positive' | 'negative' | 'neutral', score: number }[]> {
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ comments })
    });

    if (!response.ok) {
        throw new Error(`Local model API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error analyzing sentiment locally:", error);
    // Fallback to neutral on error
    return comments.map(() => ({ sentiment: 'neutral', score: 0 }));
  }
}
