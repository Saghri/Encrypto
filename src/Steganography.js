// Add secret key to this code. the secret key is used for steganography. User is asked for secret key during embedding text and extracting text. During extracting text the code checks if the secret key entered by user is same as the one entered during embedding text into image than it displays extracted text.


// Add secret key to this code. the secret key is used for steganography.After User is asked for secret key during embedding text and extracting text. the secret key is used to embed text into image and also for the extracting embedded text. each time user is asked for the secret key



import React, { useState, useEffect } from 'react';

const Steganography = () => {
  const [image, setImage] = useState(null);
  const [text, setText] = useState('');
  const [stegoImage, setStegoImage] = useState(null);
  const [extractedText, setExtractedText] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
    }
  };

  const handleTextChange = (e) => {
    setText(e.target.value);
  };

  const embedText = () => {
    const secretKey = prompt('Please enter the secret key for embedding:');
    if (!secretKey) {
      alert('Secret key is required for embedding.');
      return;
    }
    const img = document.getElementById('image');
    if (!img.complete) {
      alert("Image not loaded yet. Please try again.");
      return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const encryptedText = xorEncrypt(text, secretKey);
    const textBinary = textToBinary(encryptedText);
    const stegoImageData = embedTextInImage(imageData, textBinary);
    const stegoImage = new Image();
    stegoImage.src = imageDataToDataURL(stegoImageData);
    setStegoImage(stegoImage);
  };

  const extractText = () => {
    const secretKey = prompt('Please enter the secret key for extracting:');
    if (!secretKey) {
      alert('Secret key is required for extracting.');
      return;
    }
    const img = document.getElementById('stegoImage');
    if (!img.complete) {
      alert("Stego image not loaded yet. Please try again.");
      return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const extractedBinary = extractTextFromImage(imageData);
    const extractedText = binaryToText(extractedBinary);
    const decryptedText = xorDecrypt(extractedText, secretKey);

    const finalText = decryptedText.slice(0,text.length);

    setExtractedText(finalText);
  };

  const xorEncrypt = (text, key) => {
    return text.split('').map((char, i) => {
      return String.fromCharCode(char.charCodeAt(0) ^ key.charCodeAt(i % key.length));
    }).join('');
  };

  const xorDecrypt = (encryptedText, key) => {
    return xorEncrypt(encryptedText, key); // XOR decryption is the same as encryption
  };

  const textToBinary = (text) => {
    return text.split('').map((char) => {
      return char.charCodeAt(0).toString(2).padStart(8, '0');
    }).join('');
  };

  const embedTextInImage = (imageData, textBinary) => {
    const pixels = imageData.data;
    for (let i = 0; i < textBinary.length; i++) {
      const pixelIndex = Math.floor(i / 3);
      const bitIndex = i % 3;
      const bitValue = parseInt(textBinary[i], 2);
      pixels[pixelIndex * 4 + bitIndex] = (pixels[pixelIndex * 4 + bitIndex] & ~1) | bitValue;
    }
    return imageData;
  };

  const imageDataToDataURL = (imageData) => {
    const canvas = document.createElement('canvas');
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    const ctx = canvas.getContext('2d');
    ctx.putImageData(imageData, 0, 0);
    return canvas.toDataURL();
  };

  const extractTextFromImage = (imageData) => {
    const pixels = imageData.data;
    let binaryText = '';
    for (let i = 0; i < pixels.length; i += 4) {
      for (let j = 0; j < 3; j++) {
        binaryText += pixels[i + j] & 1;
      }
    }
    return binaryText;
  };

  const binaryToText = (binary) => {
    let text = '';
    for (let i = 0; i < binary.length; i += 8) {
      const charCode = parseInt(binary.substring(i, i + 8), 2);
      text += String.fromCharCode(charCode);
    }
    return text;
  };

  useEffect(() => {
    if (image) {
      const img = document.getElementById('image');
      img.src = image;
    }
  }, [image]);

  useEffect(() => {
    if (stegoImage) {
      const img = document.getElementById('stegoImage');
      img.src = stegoImage.src;
    }
  }, [stegoImage]);

  return (
    <div>
      <h1>Steganography</h1>
      <input type="file" accept="image/*" onChange={handleImageChange} />
      <input type="text" value={text} onChange={handleTextChange} placeholder="Text to embed" />
      <button onClick={embedText}>Embed Text</button>
      {image && <img id="image" src={image} alt="Original Image" />}
      {stegoImage && (
        <div>
          <img id="stegoImage" src={stegoImage.src} alt="Stego Image" />
          <button onClick={extractText}>Extract Text</button>
          <p>Extracted Text: {extractedText}</p>
        </div>
      )}
    </div>
  );
};

export default Steganography;
