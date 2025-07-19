"use strict";
// Background service worker for the Reels & Shorts Tracker extension
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// Initialize storage with default values
chrome.runtime.onInstalled.addListener(() => __awaiter(void 0, void 0, void 0, function* () {
    const defaultData = {
        reels: { count: 0, totalTime: 0 },
        shorts: { count: 0, totalTime: 0 },
        dailyStats: {},
    };
    const existingData = yield chrome.storage.local.get();
    if (Object.keys(existingData).length === 0) {
        yield chrome.storage.local.set(defaultData);
        updateBadge(defaultData);
    }
    else {
        // Update badge on startup with existing data
        updateBadge(existingData);
    }
}));
// Update badge periodically (every 30 seconds)
setInterval(() => __awaiter(void 0, void 0, void 0, function* () {
    const data = (yield chrome.storage.local.get());
    updateBadge(data);
}), 30000);
// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "TRACK_REEL" || message.type === "TRACK_SHORT") {
        handleTracking(message);
    }
    else if (message.type === "GET_STATS") {
        getStats().then(sendResponse);
        return true; // Indicates we will send a response asynchronously
    }
});
function handleTracking(message) {
    return __awaiter(this, void 0, void 0, function* () {
        const today = new Date().toISOString().split("T")[0];
        const data = (yield chrome.storage.local.get());
        if (message.type === "TRACK_REEL") {
            data.reels.count += 1;
            data.reels.totalTime += message.duration;
            // Update daily stats
            if (!data.dailyStats[today]) {
                data.dailyStats[today] = {
                    reels: { count: 0, totalTime: 0 },
                    shorts: { count: 0, totalTime: 0 },
                };
            }
            data.dailyStats[today].reels.count += 1;
            data.dailyStats[today].reels.totalTime += message.duration;
        }
        else if (message.type === "TRACK_SHORT") {
            data.shorts.count += 1;
            data.shorts.totalTime += message.duration;
            // Update daily stats
            if (!data.dailyStats[today]) {
                data.dailyStats[today] = {
                    reels: { count: 0, totalTime: 0 },
                    shorts: { count: 0, totalTime: 0 },
                };
            }
            data.dailyStats[today].shorts.count += 1;
            data.dailyStats[today].shorts.totalTime += message.duration;
        }
        yield chrome.storage.local.set(data);
        // Update the badge with shame-inducing stats
        updateBadge(data);
    });
}
function updateBadge(data) {
    const totalTime = data.reels.totalTime + data.shorts.totalTime;
    const totalVideos = data.reels.count + data.shorts.count;
    // Get today's stats for extra shame
    const today = new Date().toISOString().split("T")[0];
    const todayData = data.dailyStats[today];
    const todayTime = todayData
        ? todayData.reels.totalTime + todayData.shorts.totalTime
        : 0;
    let badgeText = "";
    let badgeColor = "#ff4444"; // Red for shame
    if (todayTime > 0) {
        // Show today's time in minutes if we watched something today
        const todayMinutes = Math.round(todayTime / 60);
        badgeText = `${todayMinutes}m`;
        // Color gets more shameful as time increases
        if (todayMinutes > 60)
            badgeColor = "#cc0000"; // Dark red for 1+ hour
        else if (todayMinutes > 30)
            badgeColor = "#ff2222"; // Medium red for 30+ min
    }
    else if (totalVideos > 0) {
        // Show total videos if no activity today
        badgeText = `${totalVideos}`;
    }
    // Update the badge
    chrome.action.setBadgeText({ text: badgeText });
    chrome.action.setBadgeBackgroundColor({ color: badgeColor });
    // Update tooltip with shame message
    const hours = Math.floor(totalTime / 3600);
    const minutes = Math.floor((totalTime % 3600) / 60);
    let tooltipText = `${totalVideos} videos watched`;
    if (hours > 0) {
        tooltipText += ` • ${hours}h ${minutes}m wasted`;
    }
    else if (minutes > 0) {
        tooltipText += ` • ${minutes}m of your life`;
    }
    chrome.action.setTitle({ title: tooltipText });
}
function getStats() {
    return __awaiter(this, void 0, void 0, function* () {
        const data = (yield chrome.storage.local.get());
        // Update badge when stats are requested
        updateBadge(data);
        return data;
    });
}
