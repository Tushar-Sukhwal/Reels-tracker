// Content script for tracking YouTube shorts

let shortStartTime: number | null = null;
let currentShortElement: Element | null = null;
let youtubeObserver: MutationObserver | null = null;

// Initialize tracking when the script loads
function initializeYouTubeTracking() {
  console.log("YouTube Shorts Tracker initialized");

  // Set up mutation observer to watch for shorts
  youtubeObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === "childList") {
        checkForShorts();
      }
    });
  });

  youtubeObserver.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // Initial check
  checkForShorts();
}

function checkForShorts() {
  // YouTube shorts are typically in video elements within the shorts player
  const videoElements = document.querySelectorAll("video");

  videoElements.forEach((video) => {
    if (isShortVideo(video) && video !== currentShortElement) {
      handleShortStart(video);
    }
  });
}

function isShortVideo(video: HTMLVideoElement): boolean {
  // Check if we're on a shorts page
  const isShortsPage =
    window.location.pathname.includes("/shorts/") ||
    document.querySelector("#shorts-player") !== null ||
    document.querySelector("ytd-shorts") !== null ||
    document.querySelector("[is-shorts]") !== null;

  if (!isShortsPage) return false;

  // Check if the video is visible and playing
  const rect = video.getBoundingClientRect();
  const isVisible =
    rect.width > 200 &&
    rect.height > 300 &&
    rect.top < window.innerHeight &&
    rect.bottom > 0;

  // Additional check for shorts-specific selectors
  const shortsContainer =
    video.closest("ytd-shorts") ||
    video.closest("#shorts-player") ||
    video.closest("[is-shorts]");

  return isVisible && (shortsContainer !== null || isShortsPage);
}

function handleShortStart(video: HTMLVideoElement) {
  // End previous short tracking if any
  if (shortStartTime && currentShortElement) {
    handleShortEnd();
  }

  currentShortElement = video;
  shortStartTime = Date.now();

  console.log("Started tracking short");

  // Listen for when the video ends or user navigates away
  video.addEventListener("ended", handleShortEnd);
  video.addEventListener("pause", handleShortEnd);

  // Track when user scrolls away (common in shorts)
  const intersectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.target === video && !entry.isIntersecting && shortStartTime) {
          handleShortEnd();
          intersectionObserver.disconnect();
        }
      });
    },
    { threshold: 0.5 }
  );

  intersectionObserver.observe(video);
}

function handleShortEnd() {
  if (shortStartTime) {
    const duration = Math.round((Date.now() - shortStartTime) / 1000); // Convert to seconds

    // Only track if watched for at least 2 seconds (to avoid accidental scrolls)
    if (duration >= 2) {
      chrome.runtime.sendMessage({
        type: "TRACK_SHORT",
        duration: duration,
      });

      console.log(`Tracked short: ${duration} seconds`);
    }

    shortStartTime = null;
    currentShortElement = null;
  }
}

// Handle page navigation (YouTube is a SPA)
let youtubeCurrentUrl = window.location.href;
function checkYouTubeUrlChange() {
  if (youtubeCurrentUrl !== window.location.href) {
    youtubeCurrentUrl = window.location.href;

    // Reset tracking when navigating away from shorts
    if (shortStartTime && !window.location.pathname.includes("/shorts/")) {
      handleShortEnd();
    }

    // Re-initialize tracking on new page
    setTimeout(checkForShorts, 1000);
  }
}

// Check for URL changes every second (YouTube SPA navigation)
setInterval(checkYouTubeUrlChange, 1000);

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeYouTubeTracking);
} else {
  initializeYouTubeTracking();
}
