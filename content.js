// // Find all images and send their details to the background script
// document.querySelectorAll('img').forEach((img, index) => {
//     const { src, naturalWidth: width, naturalHeight: height } = img;
  
//     // Send image details to the background script for analysis
//     chrome.runtime.sendMessage({ action: "analyzeImage", src, width, height, index }, response => {
//       if (response && response.shouldBlur) {
//         // If the response indicates the image should be blurred, apply the blur
//         img.style.filter = 'blur(8px)';
  
//         // Optionally, replace the src with a blurred image URL provided by your API
//         // img.src = response.blurredImageUrl;
  
//         // Preserve original dimensions
//         img.style.width = `${width}px`;
//         img.style.height = `${height}px`;
//       }
//     });
//   });
//   chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//     if (request.action === "startAnalysis") {
//         document.querySelectorAll('img').forEach((img, index) => {
//             const { src, naturalWidth: width, naturalHeight: height } = img;
//             chrome.runtime.sendMessage({action: "analyzeImage", src, width, height, index}, (response) => {
//                 if (response.shouldBlur) {
//                     img.src = response.blurredImageUrl; // Or apply CSS blur directly
//                     img.style.width = `${width}px`;
//                     img.style.height = `${height}px`;
//                 }
//             });
//         });
//     }
// });



//   chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//     if (request.action === "analyzeImage") {
//         analyzeImageWithGPT4(request.src).then(result => {
//             // Process the result to decide if the image should be blurred
//             // This will depend on how you interpret the API's response
//             const shouldBlur = interpretGPT4Response(result);
//             sendResponse({ shouldBlur: shouldBlur, blurredImageUrl: "URL_TO_A_BLURRED_IMAGE" });
//         }).catch(error => {
//             console.error(error);
//             sendResponse({ shouldBlur: false });
//         });

//         return true; // Indicate that sendResponse will be called asynchronously
//     }
// });

//   // In content.js
// chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
//     if (request.action === "blurImage" && request.shouldBlur) {
//       document.querySelectorAll('img').forEach((img) => {
//         if (img.src === request.imageUrl) {
//           img.style.filter = 'blur(8px)';
//         }
//       });
//     }
//   });
  

// content.js v1.0


// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//     if (request.action === "startFiltering") {
//         analyzeAndFilterImages();
//     }
// });

// function analyzeAndFilterImages() {
//     document.querySelectorAll('img').forEach((img, index) => {
//         const { src, naturalWidth: width, naturalHeight: height } = img;
        
//         chrome.runtime.sendMessage({ action: "analyzeImage", src, width, height, index }, (response) => {
//             if (response.shouldBlur) {
//                 img.style.filter = 'blur(8px)'; // Directly applying blur or replacing the src as needed
//             }
//         });
//     });
// }


///// Version 2.0

// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//     if (request.action === "startAnalysis") {
//         analyzeAndBlurImages();
//     }
// });

// function analyzeAndBlurImages() {
//     document.querySelectorAll('img').forEach((img, index) => {
//         const { src, naturalWidth: width, naturalHeight: height } = img;
//         // Send image details to the background script for analysis
//         chrome.runtime.sendMessage({ action: "analyzeImage", src, width, height, index }, (response) => {
//             if (response && response.shouldBlur) {
//                 // Assuming response contains the URL to a blurred image
//                 // and that you've verified the image should be blurred
//                 img.src = response.blurredImageUrl; // Or apply CSS blur directly

//                 // Preserve original dimensions if the blurred image's dimensions are different
//                 img.style.width = `${width}px`;
//                 img.style.height = `${height}px`;
//             }
//         });
//     });
// }





// Listen for a message from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "startAnalysis") {
        analyzePageImages();
    }
});

function analyzePageImages() {
    const images = document.getElementsByTagName('img'); // Get all image elements
    for (let img of images) {
        analyzeImage(img.src).then(shouldBlur => {
            if (shouldBlur) {
                // Apply a CSS blur filter if the image should be blurred
                img.style.filter = 'blur(8px)';
            }
        }).catch(error => console.error('Error analyzing image:', error));
    }
}

async function analyzeImage(imageUrl) {
    return new Promise((resolve, reject) => {
        // Send the image URL to the background script for analysis
        chrome.runtime.sendMessage({action: "analyzeImage", src: imageUrl}, response => {
            if (response.shouldBlur) {
                resolve(true);
            } else {
                resolve(false);
            }
        });
    });
}
