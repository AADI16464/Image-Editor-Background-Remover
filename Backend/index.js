const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fetch = require('node-fetch');
const fs = require('fs');
require('dotenv').config();

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());

app.post('/api/remove-bg', upload.single('image'), async (req, res) => {
  const apiKey = process.env.PHOTOROOM_API_KEY;
  const imagePath = req.file.path;

  const fileData = fs.readFileSync(imagePath);

  try {
    const response = await fetch('https://sdk.photoroom.com/v1/segment', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/octet-stream'
      },
      body: fileData
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const blob = await response.buffer();
    res.set('Content-Type', 'image/png');
    res.send(blob);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    fs.unlinkSync(imagePath); // Clean up uploaded file
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
