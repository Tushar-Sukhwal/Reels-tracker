// Content script for tracking Instagram reels

let reelStartTime: number | null = null;
let currentReelElement: Element | null = null;
let instagramObserver: MutationObserver | null = null;

// Initialize tracking when the script loads
function initializeInstagramTracking() {
  console.log("Instagram Reels Tracker initialized on:", window.location.href);

  // Set up mutation observer to watch for reels
  instagramObserver = new MutationObserver((mutations) => {
    // Debounce the checks to avoid too frequent calls
    setTimeout(() => {
      checkForReels();
    }, 500);
  });

  instagramObserver.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // Initial check after a delay to ensure DOM is loaded
  setTimeout(() => {
    checkForReels();
  }, 2000);

  // Also check periodically in case we miss mutations
  setInterval(() => {
    if (
      window.location.pathname.includes("/reel") ||
      window.location.pathname.includes("/reels") ||
      window.location.pathname === "/reels" ||
      window.location.pathname === "/reels/"
    ) {
      console.log("Periodic check for reels on:", window.location.pathname);
      checkForReels();
    }
  }, 3000);
}

function checkForReels() {
  // Instagram reels are typically in video elements within specific containers
  // Look for video elements that are visible and playing
  const videoElements = document.querySelectorAll("video");

  console.log(`Found ${videoElements.length} video elements on Instagram`);

  // Find the video that's most likely the current reel being watched
  let activeVideo: HTMLVideoElement | null = null;
  let bestScore = 0;

  videoElements.forEach((video, index) => {
    const htmlVideo = video as HTMLVideoElement;
    const rect = htmlVideo.getBoundingClientRect();

    // Calculate a score for how likely this video is the active one
    let score = 0;

    // Playing videos get higher priority
    if (!htmlVideo.paused) score += 100;

    // Videos with current time > 0 are more likely active
    if (htmlVideo.currentTime > 0) score += 50;

    // Videos that are more centered and visible get higher priority
    const centerDistance = Math.abs(
      (rect.top + rect.bottom) / 2 - window.innerHeight / 2
    );
    score += Math.max(0, 100 - centerDistance / 10);

    // Bigger videos are more likely to be the main one
    score += (rect.width * rect.height) / 10000;

    console.log(`Video ${index} score: ${score}:`, {
      src: htmlVideo.src,
      paused: htmlVideo.paused,
      dimensions: `${htmlVideo.videoWidth}x${htmlVideo.videoHeight}`,
      currentTime: htmlVideo.currentTime,
      centerDistance: centerDistance,
      rect: `${Math.round(rect.width)}x${Math.round(rect.height)}`,
      score: score,
    });

    if (score > bestScore && isReelVideo(htmlVideo)) {
      bestScore = score;
      activeVideo = htmlVideo;
    }
  });

  // Only track the most likely active video
  if (activeVideo && activeVideo !== currentReelElement && bestScore > 50) {
    console.log("Detected Instagram reel (best candidate), starting tracking");
    handleReelStart(activeVideo);
  }
}

function isReelVideo(video: HTMLVideoElement): boolean {
  // Check if the video is visible and has reasonable dimensions
  const rect = video.getBoundingClientRect();
  const isVisible =
    rect.width > 150 && // Reduced threshold
    rect.height > 200 &&
    rect.top < window.innerHeight &&
    rect.bottom > 0;

  if (!isVisible) return false;

  // More flexible URL detection for Instagram reels
  const isOnReelsPage =
    window.location.pathname === "/reels" ||
    window.location.pathname === "/reels/";
  const isOnSpecificReel = window.location.pathname.includes("/reel/");
  const isOnHomeFeed = window.location.pathname === "/";

  // Look for Instagram-specific indicators that this is a reel
  const videoParent =
    video.closest("article") ||
    video.closest('[role="button"]') ||
    video.parentElement;

  // Special handling for the dedicated reels page (/reels)
  if (isOnReelsPage) {
    // On the reels page, any video element is likely a reel
    console.log("On reels page - treating video as reel:", {
      url: window.location.pathname,
      dimensions: `${rect.width}x${rect.height}`,
      videoSrc: video.src,
    });
    return true;
  }

  // Special handling for individual reel URLs (/reel/...)
  if (isOnSpecificReel) {
    console.log("On specific reel page - treating video as reel:", {
      url: window.location.pathname,
      dimensions: `${rect.width}x${rect.height}`,
      videoSrc: video.src,
    });
    return true;
  }

  // For home feed and other pages, use more specific detection
  if (!videoParent) return false;

  // Check for reel-specific selectors and patterns
  const hasReelIndicators =
    // Video is in an article (typical Instagram post structure)
    video.closest("article") !== null ||
    // Video has Instagram-specific classes or attributes
    video.getAttribute("playsinline") !== null ||
    // Parent has specific patterns
    videoParent.querySelector('svg[aria-label*="Audio"]') !== null ||
    videoParent.querySelector('button[aria-label*="Like"]') !== null ||
    videoParent.querySelector('[aria-label*="Play"]') !== null ||
    videoParent.querySelector('[aria-label*="Pause"]') !== null ||
    // Check for vertical video aspect ratio (typical for reels)
    (rect.height > rect.width && rect.height > 300) ||
    // Look for reels-specific classes (Instagram sometimes uses these)
    video.closest('[class*="reel"]') !== null ||
    video.closest('[class*="Reel"]') !== null;

  console.log("Instagram video check:", {
    url: window.location.pathname,
    dimensions: `${rect.width}x${rect.height}`,
    hasReelIndicators,
    videoSrc: video.src,
    videoParent: videoParent?.tagName,
    isOnReelsPage,
    isOnSpecificReel,
    isOnHomeFeed,
  });

  return hasReelIndicators;
}

function handleReelStart(video: HTMLVideoElement) {
  // End previous reel tracking if any
  if (reelStartTime && currentReelElement) {
    handleReelEnd();
  }

  currentReelElement = video;
  reelStartTime = Date.now();

  console.log("Started tracking Instagram reel", {
    src: video.src,
    dimensions: `${video.videoWidth}x${video.videoHeight}`,
    url: window.location.pathname,
  });

  // Create a cleanup function to avoid memory leaks
  const cleanup = () => {
    video.removeEventListener("ended", handleReelEnd);
    video.removeEventListener("pause", handleReelEnd);
  };

  // Listen for when the video ends or user navigates away
  video.addEventListener("ended", handleReelEnd);

  // For Instagram, don't track pause events as aggressively since users often pause/unpause
  // Only track when the video actually ends or becomes invisible

  // Track when user scrolls away (common in reels)
  const intersectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.target === video && !entry.isIntersecting && reelStartTime) {
          // Add a delay before ending tracking to avoid false positives
          setTimeout(() => {
            // Double-check that we're still not intersecting and tracking this video
            if (
              !entry.isIntersecting &&
              currentReelElement === video &&
              reelStartTime
            ) {
              console.log(
                "Instagram reel went out of view (confirmed), ending tracking"
              );
              handleReelEnd();
              cleanup();
              intersectionObserver.disconnect();
            }
          }, 1000); // Wait 1 second before confirming it's really out of view
        }
      });
    },
    {
      threshold: 0.1, // Very low threshold - just needs to be partially visible
      rootMargin: "50px", // Give some margin for Instagram's layout
    }
  );

  intersectionObserver.observe(video);

  // Store cleanup function for later use
  (video as any)._reelCleanup = cleanup;
}

function handleReelEnd() {
  if (reelStartTime) {
    const duration = Math.round((Date.now() - reelStartTime) / 1000); // Convert to seconds

    console.log(`Ending reel tracking after ${duration} seconds`);

    // Only track if watched for at least 2 seconds (to avoid accidental scrolls)
    if (duration >= 2) {
      chrome.runtime.sendMessage({
        type: "TRACK_REEL",
        duration: duration,
      });

      console.log(
        `✅ Successfully tracked Instagram reel: ${duration} seconds`
      );
    } else {
      console.log(`❌ Reel too short (${duration}s), not tracking`);
    }

    reelStartTime = null;
    currentReelElement = null;
  }
}

// Handle page navigation (Instagram is a SPA)
let instagramCurrentUrl = window.location.href;
function checkInstagramUrlChange() {
  if (instagramCurrentUrl !== window.location.href) {
    const oldUrl = instagramCurrentUrl;
    instagramCurrentUrl = window.location.href;

    console.log("Instagram URL changed:", {
      from: oldUrl,
      to: instagramCurrentUrl,
    });

    // Reset tracking when navigating away from reels
    if (
      reelStartTime &&
      !window.location.pathname.includes("/reel") &&
      window.location.pathname !== "/reels"
    ) {
      console.log("Navigated away from reels, ending current tracking");
      handleReelEnd();
    }

    // Re-initialize tracking on new page with longer delay for /reels page
    const delay = window.location.pathname === "/reels" ? 2000 : 1000;
    setTimeout(() => {
      console.log("Re-checking for reels after navigation");
      checkForReels();
    }, delay);
  }
}

// Check for URL changes every second (Instagram SPA navigation)
setInterval(checkInstagramUrlChange, 1000);

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeInstagramTracking);
} else {
  initializeInstagramTracking();
}
