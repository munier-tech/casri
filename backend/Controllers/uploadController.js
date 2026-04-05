// Simple image upload controller for Vercel
// Since Vercel can't write to disk, we'll provide base64 conversion

export const uploadImage = async (req, res) => {
  try {
    console.log("=== UPLOAD IMAGE REQUEST ===");
    
    if (!req.file && !req.body.imageData) {
      return res.status(400).json({
        success: false,
        error: "No image file or image data provided"
      });
    }

    // If image data is provided as base64
    if (req.body.imageData) {
      console.log("✅ Base64 image data received");
      return res.status(200).json({
        success: true,
        message: "Image processed successfully",
        imageUrl: req.body.imageData, // Return the base64 data
        type: "base64"
      });
    }

    // If file is uploaded (though this won't work on Vercel)
    if (req.file) {
      console.log("❌ File upload attempted on Vercel (not supported)");
      return res.status(400).json({
        success: false,
        error: "File uploads not supported on Vercel. Please use base64 image data or external URLs."
      });
    }

    return res.status(400).json({
      success: false,
      error: "No valid image data provided"
    });

  } catch (error) {
    console.error("❌ Error processing image:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Convert file to base64 (client-side helper endpoint)
export const convertToBase64 = async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Use this JavaScript code on frontend to convert images to base64:",
    code: `
    // Frontend JavaScript code:
    function convertImageToBase64(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }
    
    // Usage:
    const base64 = await convertImageToBase64(fileInput.files[0]);
    // Send base64 as imageUrl in your requests
    `
  });
};