// chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
//     // Check if the tab's status is 'complete' to ensure the page is fully loaded
//     if (changeInfo.status === 'complete' && tab.url) {
//         // Inject the content script into the tab
//         chrome.scripting.executeScript({
//             target: { tabId: tabId },
//             files: ['content.js']
//         }).then(() => {
//             console.log("Content script injected");
//         }).catch(err => console.error(err));
//     }
// });

// // // Listen for messages from content scripts
// // chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
// //     if (request.action === "analyzeImage") {
// //         // Here, you would typically send the image data to an external API for analysis.
// //         // This is a placeholder for where you would make the API call.
// //         // For demonstration, let's assume every image needs to be blurred (which you wouldn't do in a real app).
        
// //         // Simulate API call response
// //         setTimeout(() => {
// //             sendResponse({ shouldBlur: true, blurredImageUrl: "URL_TO_A_BLURRED_IMAGE_VERSION" });
// //         }, 1000); // Simulate network delay

// //         // Return true to indicate you wish to send a response asynchronously
// //         return true;
// //     }
// // });
// // Corrected and simplified for demonstration
// chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
//     if (request.action === "analyzeImage") {
//         const filtersSet = await getFilterPreferences(); // Ensure this is async and waits
//         analyzeImageWithGPT4(request.src, filtersSet).then(data => {
//             const shouldBlur = data.choices[0].text.trim().toLowerCase() === 'yes';
//             // Assuming we're in an async context, or refactor to use .then() chaining
//             chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
//                 chrome.tabs.sendMessage(tabs[0].id, {action: "blurImage", shouldBlur: shouldBlur, imageUrl: request.src});
//             });
//             sendResponse({ shouldBlur: shouldBlur });
//         }).catch(error => {
//             console.error(error);
//             sendResponse({ shouldBlur: false });
//         });
//         return true; // Indicate async response to keep the messaging channel open
//     }
// });


// async function analyzeImageWithGPT4(imageUrl) {
//     const apiKey = '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'; // Ideally fetched securely from chrome.storage.local or a server
//     const gpt4Endpoint = 'https://api.openai.com/v1/images/edits'; // Use the correct endpoint for image analysis

//     try {
//         const response = await fetch(gpt4Endpoint, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Authorization': `Bearer ${apiKey}`
//             },
//             body: JSON.stringify({
//                 // Your specific payload here. This will depend on the API's requirements for image analysis.
//                 // prompt: `Analyze this image: ${imageUrl}`, // Example, adjust based on actual API capabilities
//                 prompt : `Given the themes ${Array.from(filtersSet).join(', ')}, does the image at ${imageUrl} match any of these themes?`,

//                 model: 'text-davinci-003', // Specify the correct model for your task
//                 // Include other parameters as required by the API
//             })
//         });

//         if (!response.ok) {
//             throw new Error(`API call failed: ${response.statusText}`);
//         }

//         const data = await response.json();
//         return data; // Process this data to determine if the image should be blurred
//     } catch (error) {
//         console.error('Failed to analyze image with GPT-4:', error);
//         return null; // Handle errors or fallbacks as necessary
//     }
// }

// function getFilterPreferences() {
//     return new Promise((resolve, reject) => {
//       chrome.storage.local.get(['filtersSet'], (result) => {
//         if (chrome.runtime.lastError) {
//           reject(chrome.runtime.lastError);
//         } else {
//           resolve(new Set(result.filtersSet || []));
//         }
//       });
//     });
//   }
//   analyzeImageWithGPT4(imageUrl, filtersSet).then(data => {
//     const shouldBlur = data.choices[0].text.trim().toLowerCase() === 'yes';
    
//     // Now, you would communicate back to the content script with this decision
//     // For example, using chrome.tabs.sendMessage to send the decision to the content script
//   });
//   // In background.js, continuing from the previous code block
// chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
//     chrome.tabs.sendMessage(tabs[0].id, {action: "blurImage", shouldBlur: shouldBlur, imageUrl: imageUrl});
//   });
  

















// Async function to get filter preferences from storage
async function getFilterPreferences() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['filtersSet'], (result) => {
            if (chrome.runtime.lastError) {
                return reject(chrome.runtime.lastError);
            }
            resolve(new Set(result.filtersSet || []));
        });
        // console.log()
    });
}

// Function to analyze the image with GPT-4
async function analyzeImageWithGPT4(imageUrl, filtersSet) {
    const apiKey = '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'; // Remember to replace 'YOUR_API_KEY' with your actual API key
    const gpt4Endpoint = 'https://api.openai.com/v1/images/edits'; // Ensure you're using the correct endpoint

    try {
        const response = await fetch(gpt4Endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                // Adjust the payload as per the actual requirements of your endpoint
                prompt: `Given the themes ${Array.from(filtersSet).join(', ')}, does the image at ${imageUrl} match any of these themes?`,
                model: 'gpt-4-vision-preview', // Ensure this is the model you intend to use
            })
        });

        if (!response.ok) {
            throw new Error(`API call failed: ${response.statusText}`);
        }

        const data = await response.json();
        return data; // Interpret this data to determine if the image should be blurred
    } catch (error) {
        console.error('Failed to analyze image with GPT-4:', error);
        return { shouldBlur: false }; // Default response in case of error
    }
}

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    if (request.action === "analyzeImage") {
        try {
            const filtersSet = await getFilterPreferences(); // Retrieve user's filter preferences
            const data = await analyzeImageWithGPT4(request.src, filtersSet); // Analyze the image

            // Interpret GPT-4's response (this is placeholder logic)
            const shouldBlur = data.choices && data.choices[0].text.trim().toLowerCase() === 'yes';
            
            sendResponse({ shouldBlur });
        } catch (error) {
            console.error(error);
            sendResponse({ shouldBlur: false });
        }

        return true; // Indicates an asynchronous response
    }
});

// Tab update listener to inject content script
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ['content.js']
        }).then(() => {
            console.log("Content script injected");
        }).catch(err => console.error(err));
    }
});
