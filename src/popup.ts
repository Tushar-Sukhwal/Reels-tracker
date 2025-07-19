// Popup script for the Reels & Shorts Tracker extension

interface StorageData {
  reels: {
    count: number;
    totalTime: number;
  };
  shorts: {
    count: number;
    totalTime: number;
  };
  dailyStats: {
    [date: string]: {
      reels: { count: number; totalTime: number };
      shorts: { count: number; totalTime: number };
    };
  };
}

// DOM elements
const reelsCountEl = document.getElementById("reels-count") as HTMLElement;
const reelsTimeEl = document.getElementById("reels-time") as HTMLElement;
const shortsCountEl = document.getElementById("shorts-count") as HTMLElement;
const shortsTimeEl = document.getElementById("shorts-time") as HTMLElement;
const todayReelsEl = document.getElementById("today-reels") as HTMLElement;
const todayShortsEl = document.getElementById("today-shorts") as HTMLElement;
const totalVideosEl = document.getElementById("total-videos") as HTMLElement;
const totalTimeEl = document.getElementById("total-time") as HTMLElement;
const refreshBtn = document.getElementById("refresh-btn") as HTMLButtonElement;
const resetBtn = document.getElementById("reset-btn") as HTMLButtonElement;
const loadingEl = document.getElementById("loading") as HTMLElement;
const shameQuoteEl = document.getElementById("shame-quote") as HTMLElement;

// Utility functions
function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  } else {
    return `${remainingSeconds}s`;
  }
}

function formatTimeShort(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  if (minutes > 0) {
    return `${minutes}m`;
  } else {
    return `${seconds}s`;
  }
}

function showLoading(show: boolean) {
  if (show) {
    loadingEl.classList.add("show");
  } else {
    loadingEl.classList.remove("show");
  }
}

function animateNumber(
  element: HTMLElement,
  newValue: number,
  suffix: string = ""
) {
  const currentValue = parseInt(element.textContent || "0");
  const increment = (newValue - currentValue) / 20;
  let current = currentValue;

  const animate = () => {
    current += increment;
    if (
      (increment > 0 && current >= newValue) ||
      (increment < 0 && current <= newValue)
    ) {
      element.textContent = newValue + suffix;
      return;
    }
    element.textContent = Math.round(current) + suffix;
    requestAnimationFrame(animate);
  };

  if (increment !== 0) {
    animate();
  }
}

// Get today's date string
function getTodayString(): string {
  return new Date().toISOString().split("T")[0];
}

// Shame-inducing quotes to promote awareness
const shameQuotes = [
  "Time is the most valuable thing we have... 🕐",
  "Every scroll is a choice you made 📱",
  "Your future self is watching you right now ⏰",
  "This moment will never come back 🌅",
  "What could you have learned instead? 📚",
  "Your dreams are waiting for your attention 💭",
  "Mindless scrolling = mindless living 🧠",
  "You are what you repeatedly do 🔄",
  "Time wasted is life wasted ⚰️",
  "Your goals miss you when you're scrolling 🎯",
  "Every minute here is a minute not building yourself 🏗️",
  "The algorithm knows you better than you know yourself 🤖",
  "You're training your brain for instant gratification 🧠⚡",
  "Real life is happening while you watch others live 🌍",
  "Your attention is your most precious resource 💎",
];

function updateShameQuote(data: StorageData) {
  const totalTime = data.reels.totalTime + data.shorts.totalTime;
  const totalVideos = data.reels.count + data.shorts.count;

  // Get today's stats
  const today = getTodayString();
  const todayData = data.dailyStats[today];
  const todayTime = todayData
    ? todayData.reels.totalTime + todayData.shorts.totalTime
    : 0;
  const todayVideos = todayData
    ? todayData.reels.count + todayData.shorts.count
    : 0;

  let quote = shameQuotes[Math.floor(Math.random() * shameQuotes.length)];

  // Extra shameful quotes based on usage
  if (todayTime > 3600) {
    // 1+ hour today
    quote = "You've spent over an hour today feeding the algorithm 🤖";
  } else if (todayVideos > 50) {
    quote = `${todayVideos} videos today... Really? 😤`;
  } else if (totalTime > 36000) {
    // 10+ hours total
    quote = "You've watched 10+ hours of short videos total 😱";
  } else if (todayTime > 1800) {
    // 30+ minutes today
    quote = "30+ minutes gone today... Time flies when you're scrolling ⏰";
  }

  shameQuoteEl.textContent = quote;

  // Add visual shame based on usage
  if (todayTime > 3600 || todayVideos > 100) {
    shameQuoteEl.style.color = "#ff6b6b";
    shameQuoteEl.style.fontWeight = "500";
  } else if (todayTime > 1800 || todayVideos > 50) {
    shameQuoteEl.style.color = "#ffa726";
    shameQuoteEl.style.fontWeight = "400";
  } else {
    shameQuoteEl.style.color = "rgba(255, 255, 255, 0.9)";
    shameQuoteEl.style.fontWeight = "300";
  }
}

// Load and display statistics
async function loadStats() {
  showLoading(true);

  try {
    // Get data from background script
    const data = await new Promise<StorageData>((resolve) => {
      chrome.runtime.sendMessage({ type: "GET_STATS" }, (response) => {
        resolve(response);
      });
    });

    if (!data) {
      console.error("No data received from background script");
      return;
    }

    // Update overall stats
    animateNumber(reelsCountEl, data.reels.count);
    reelsTimeEl.textContent = formatTime(data.reels.totalTime);

    animateNumber(shortsCountEl, data.shorts.count);
    shortsTimeEl.textContent = formatTime(data.shorts.totalTime);

    // Update today's stats
    const today = getTodayString();
    const todayData = data.dailyStats[today];

    if (todayData) {
      todayReelsEl.textContent = `${
        todayData.reels.count
      } videos, ${formatTimeShort(todayData.reels.totalTime)}`;
      todayShortsEl.textContent = `${
        todayData.shorts.count
      } videos, ${formatTimeShort(todayData.shorts.totalTime)}`;
    } else {
      todayReelsEl.textContent = "0 videos, 0s";
      todayShortsEl.textContent = "0 videos, 0s";
    }

    // Update combined stats
    const totalVideos = data.reels.count + data.shorts.count;
    const totalTime = data.reels.totalTime + data.shorts.totalTime;

    animateNumber(totalVideosEl, totalVideos);
    totalTimeEl.textContent = formatTime(totalTime);

    // Update the shame quote
    updateShameQuote(data);

    // Add some visual feedback
    document.querySelectorAll(".stat-card").forEach((card, index) => {
      setTimeout(() => {
        card.classList.add("updated");
      }, index * 100);
    });

    // Remove the updated class after animation
    setTimeout(() => {
      document.querySelectorAll(".stat-card").forEach((card) => {
        card.classList.remove("updated");
      });
    }, 1000);
  } catch (error) {
    console.error("Error loading stats:", error);
  } finally {
    showLoading(false);
  }
}

// Reset all data
async function resetData() {
  const confirmed = confirm(
    "Are you sure you want to reset all tracking data? This action cannot be undone."
  );

  if (confirmed) {
    showLoading(true);

    try {
      await chrome.storage.local.clear();

      // Initialize with default data
      const defaultData: StorageData = {
        reels: { count: 0, totalTime: 0 },
        shorts: { count: 0, totalTime: 0 },
        dailyStats: {},
      };

      await chrome.storage.local.set(defaultData);

      // Refresh the display
      await loadStats();

      // Show success feedback
      showNotification("Data reset successfully!", "success");
    } catch (error) {
      console.error("Error resetting data:", error);
      showNotification("Error resetting data", "error");
    } finally {
      showLoading(false);
    }
  }
}

// Show notification
function showNotification(message: string, type: "success" | "error") {
  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  notification.textContent = message;

  notification.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    padding: 12px 20px;
    border-radius: 8px;
    color: white;
    font-weight: 600;
    z-index: 1001;
    animation: slideDown 0.3s ease;
    background: ${type === "success" ? "#4caf50" : "#f44336"};
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = "slideUp 0.3s ease";
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 2000);
}

// Add CSS for notifications
const style = document.createElement("style");
style.textContent = `
  @keyframes slideDown {
    from { transform: translateX(-50%) translateY(-100%); opacity: 0; }
    to { transform: translateX(-50%) translateY(0); opacity: 1; }
  }
  
  @keyframes slideUp {
    from { transform: translateX(-50%) translateY(0); opacity: 1; }
    to { transform: translateX(-50%) translateY(-100%); opacity: 0; }
  }
  
  .stat-card.updated {
    animation: cardPulse 0.6s ease;
  }
  
  @keyframes cardPulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
`;
document.head.appendChild(style);

// Event listeners
refreshBtn.addEventListener("click", loadStats);
resetBtn.addEventListener("click", resetData);

// Auto-refresh stats every 30 seconds
setInterval(loadStats, 30000);

// Load stats when popup opens
document.addEventListener("DOMContentLoaded", loadStats);

// Handle keyboard shortcuts
document.addEventListener("keydown", (event) => {
  if (event.key === "r" && (event.metaKey || event.ctrlKey)) {
    event.preventDefault();
    loadStats();
  }
});

// Add hover effects for better UX
document.querySelectorAll(".stat-card").forEach((card) => {
  const cardElement = card as HTMLElement;
  card.addEventListener("mouseenter", () => {
    cardElement.style.transform = "translateY(-2px) scale(1.02)";
  });

  card.addEventListener("mouseleave", () => {
    cardElement.style.transform = "";
  });
});
