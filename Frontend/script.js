let addCard = document.getElementById("addCard");
let displayCard = document.getElementById("displayCard");
let downloadCard = document.getElementById("downloadCard");
let fileInput = document.getElementById("fileInput");
let imageBefore = document.getElementById("display-img");
let startBtn = document.getElementById("startBtn");
let imageAfter = document.querySelector(".image-after");
let imageBeforeSM = document.querySelector(".image-before");
let downloadHref = document.getElementById("downloadHref");
let backgroundColorPicker = document.getElementById("bgcolor");
let convertToJpgBtn = document.getElementById("convertToJpg");
let convertToPngBtn = document.getElementById("convertToPng");
let compressBtn = document.getElementById("compressBtn");
let applyColorBtn = document.getElementById("applyColorBtn");

let file = null;
let resultBlobUrl = null;

const url = 'https://sdk.photoroom.com/v1/segment';
const apiKey = "sandbox_sk_pr_imagebackgroundremover_9bdec37331ad07abe6165de002c43656249aada9";

// Section visibility
const activeScreen = (screen) => {
  addCard.style.display = "none";
  displayCard.style.display = "none";
  downloadCard.style.display = "none";
  screen.style.display = "flex";
};

activeScreen(addCard);

// File input handler
fileInput.addEventListener("input", () => {
  file = fileInput.files[0];
  if (file) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      imageBefore.src = reader.result;
      imageBeforeSM.src = reader.result;
    };
    activeScreen(displayCard);
  }
});

// Drag and drop
const uploadArea = document.querySelector('.upload-area');

uploadArea.addEventListener('dragover', (e) => {
  e.preventDefault();
  uploadArea.style.borderColor = '#0d6efd';
  uploadArea.style.backgroundColor = 'rgba(13, 110, 253, 0.1)';
});

uploadArea.addEventListener('dragleave', (e) => {
  e.preventDefault();
  uploadArea.style.borderColor = '#6c757d';
  uploadArea.style.backgroundColor = 'transparent';
});

uploadArea.addEventListener('drop', (e) => {
  e.preventDefault();
  uploadArea.style.borderColor = '#6c757d';
  uploadArea.style.backgroundColor = 'transparent';

  const droppedFile = e.dataTransfer.files[0];
  if (droppedFile && droppedFile.type.startsWith('image/')) {
    file = droppedFile;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      imageBefore.src = reader.result;
      imageBeforeSM.src = reader.result;
    };
    activeScreen(displayCard);
  }
});

// Remove background from image
async function removeBackground(imageFile) {
  const formData = new FormData();
  formData.append('image_file', imageFile);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'X-Api-Key': apiKey
    },
    body: formData
  });

  if (!response.ok) {
    try {
      console.error(await response.json());
    } catch (e) {
      console.error(await response.text());
    }
    throw new Error('Network response was not ok');
  }

  return await response.blob();
}

// Start Button
startBtn.addEventListener("click", async () => {
  startBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Processing...';
  startBtn.disabled = true;

  try {
    const blob = await removeBackground(file);

    if (!blob.type.startsWith('image/')) {
      alert('Invalid image response from API.');
      return;
    }

    resultBlobUrl = URL.createObjectURL(blob);
    imageAfter.src = resultBlobUrl;
    downloadHref.setAttribute("href", resultBlobUrl);
    activeScreen(downloadCard);
  } catch (err) {
    alert("Error removing background: " + err.message);
    console.error(err);
  } finally {
    startBtn.innerHTML = '<i class="fas fa-magic me-2"></i>Remove Background';
    startBtn.disabled = false;
  }
});

// Apply solid background color
function applySolidBackground() {
  if (!resultBlobUrl) return;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const img = new Image();
  const bgColor = backgroundColorPicker.value;

  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);

    const newDataUrl = canvas.toDataURL("image/png");
    imageAfter.src = newDataUrl;
    downloadHref.setAttribute("href", newDataUrl);
  };

  img.src = resultBlobUrl;
}

// Format conversion
function convertToFormat(format) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const img = new Image();

  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    const dataUrl = canvas.toDataURL(format);
    imageAfter.src = dataUrl;
    downloadHref.setAttribute("href", dataUrl);
  };

  img.src = imageAfter.src;
}

// Compress image
function compressImage() {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const img = new Image();

  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.5);
    imageAfter.src = compressedDataUrl;
    downloadHref.setAttribute("href", compressedDataUrl);
  };

  img.src = imageAfter.src;
}

// Button bindings
if (convertToJpgBtn)
  convertToJpgBtn.addEventListener("click", () => convertToFormat("image/jpeg"));
if (convertToPngBtn)
  convertToPngBtn.addEventListener("click", () => convertToFormat("image/png"));
if (compressBtn)
  compressBtn.addEventListener("click", compressImage);
if (applyColorBtn)
  applyColorBtn.addEventListener("click", applySolidBackground);
