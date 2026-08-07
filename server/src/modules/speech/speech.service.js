import axios from 'axios';

export async function getSpeechToken() {
  const key = process.env.AZURE_SPEECH_KEY;
  const region = process.env.AZURE_SPEECH_REGION;

  if (!key || !region) {
    const error = new Error('Azure Speech is not configured');
    error.statusCode = 503;
    throw error;
  }

  const response = await axios.post(
    `https://${region}.api.cognitive.microsoft.com/sts/v1.0/issueToken`,
    null,
    {
      headers: {
        'Ocp-Apim-Subscription-Key': key,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      timeout: 8000,
    },
  );

  return {
    token: response.data,
    region,
    expiresInSeconds: 540,
  };
}
