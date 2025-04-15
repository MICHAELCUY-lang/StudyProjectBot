// YouTube API service
// This file handles API calls to the YouTube Data API v3

// Note: In a production application, you should never store API keys in client-side code
// Instead, implement a server that handles the API requests
// This is for demonstration purposes only

// YouTube API key
const YOUTUBE_API_KEY = "YOUR_API_KEY"; // Replace with your actual API key

// Storage keys
const RECENTLY_PLAYED_KEY = "youtube_recently_played";

/**
 * Search for YouTube videos
 * @param {string} query - The search query
 * @param {number} maxResults - The maximum number of results to return
 * @returns {Promise<Array>} The search results
 */
export const searchVideos = async (query, maxResults = 10) => {
  try {
    // In a real app, you should make this request from your backend
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=${maxResults}&q=${encodeURIComponent(
        query
      )}&type=video&key=${YOUTUBE_API_KEY}`
    );

    if (!response.ok) {
      throw new Error("Failed to search YouTube videos");
    }

    const data = await response.json();

    // Format the data for our app
    return data.items.map((item) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.high.url,
      channelTitle: item.snippet.channelTitle,
      publishedAt: new Date(item.snippet.publishedAt),
      embedUrl: `https://www.youtube.com/embed/${item.id.videoId}`,
      watchUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
    }));
  } catch (error) {
    console.error("Error searching YouTube videos:", error);

    // Return mock data if API call fails
    return getMockVideoResults(query);
  }
};

/**
 * Get video details by ID
 * @param {string} videoId - The YouTube video ID
 * @returns {Promise<Object>} The video details
 */
export const getVideoDetails = async (videoId) => {
  try {
    // In a real app, you should make this request from your backend
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoId}&key=${YOUTUBE_API_KEY}`
    );

    if (!response.ok) {
      throw new Error("Failed to get video details");
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      throw new Error("Video not found");
    }

    const video = data.items[0];

    // Format the data for our app
    return {
      id: video.id,
      title: video.snippet.title,
      description: video.snippet.description,
      thumbnail: video.snippet.thumbnails.high.url,
      channelTitle: video.snippet.channelTitle,
      publishedAt: new Date(video.snippet.publishedAt),
      duration: video.contentDetails.duration, // ISO 8601 duration format
      viewCount: parseInt(video.statistics.viewCount),
      likeCount: parseInt(video.statistics.likeCount),
      embedUrl: `https://www.youtube.com/embed/${video.id}`,
      watchUrl: `https://www.youtube.com/watch?v=${video.id}`,
    };
  } catch (error) {
    console.error("Error getting video details:", error);
    throw error;
  }
};

/**
 * Get popular study music videos or playlists
 * @param {boolean} isRelaxation - Whether to get relaxation videos (true) or study videos (false)
 * @returns {Promise<Array>} The recommended videos
 */
export const getRecommendedVideos = async (isRelaxation = false) => {
  // Define search terms based on the type of videos we want
  const searchTerm = isRelaxation
    ? "relaxation music meditation ambient calm sounds"
    : "focus study music concentration productivity lo-fi";

  return await searchVideos(searchTerm, 5);
};

/**
 * Save a video to recently played
 * @param {Object} video - The video to save
 */
export const saveToRecentlyPlayed = (video) => {
  try {
    // Get existing recently played videos
    const recentlyPlayed = JSON.parse(
      localStorage.getItem(RECENTLY_PLAYED_KEY) || "[]"
    );

    // Check if video already exists in list
    const existingIndex = recentlyPlayed.findIndex(
      (item) => item.id === video.id
    );
    if (existingIndex !== -1) {
      // Remove existing entry
      recentlyPlayed.splice(existingIndex, 1);
    }

    // Add video to beginning of list
    recentlyPlayed.unshift({
      ...video,
      lastPlayed: new Date().toISOString(),
    });

    // Limit list to 10 items
    const limitedList = recentlyPlayed.slice(0, 10);

    // Save back to localStorage
    localStorage.setItem(RECENTLY_PLAYED_KEY, JSON.stringify(limitedList));
  } catch (error) {
    console.error("Error saving to recently played:", error);
  }
};

/**
 * Get recently played videos
 * @returns {Array} The recently played videos
 */
export const getRecentlyPlayed = () => {
  try {
    return JSON.parse(localStorage.getItem(RECENTLY_PLAYED_KEY) || "[]");
  } catch (error) {
    console.error("Error getting recently played videos:", error);
    return [];
  }
};

/**
 * Generate mock video results when API fails
 * @param {string} query - The search query
 * @returns {Array} Mock search results
 */
const getMockVideoResults = (query) => {
  const isRelaxation =
    query.toLowerCase().includes("relax") ||
    query.toLowerCase().includes("ambient") ||
    query.toLowerCase().includes("calm");

  if (isRelaxation) {
    return [
      {
        id: "DWcJFNfaw9c",
        title: "Relaxing Piano Music for Stress Relief",
        description:
          "Beautiful relaxing piano music for stress relief and peaceful moments.",
        thumbnail: "https://i.ytimg.com/vi/DWcJFNfaw9c/hqdefault.jpg",
        channelTitle: "Meditation Music",
        publishedAt: new Date("2020-05-15"),
        embedUrl: "https://www.youtube.com/embed/DWcJFNfaw9c",
        watchUrl: "https://www.youtube.com/watch?v=DWcJFNfaw9c",
      },
      {
        id: "77ZozI0rw7w",
        title: "Relaxing Sleep Music with Rain Sounds",
        description:
          "Relaxing sleep music combined with rain sounds to help you fall asleep faster.",
        thumbnail: "https://i.ytimg.com/vi/77ZozI0rw7w/hqdefault.jpg",
        channelTitle: "Sleep Music",
        publishedAt: new Date("2021-03-20"),
        embedUrl: "https://www.youtube.com/embed/77ZozI0rw7w",
        watchUrl: "https://www.youtube.com/watch?v=77ZozI0rw7w",
      },
      {
        id: "hlWiI4xVXKY",
        title: "Relaxing Jazz Music and Rain Sounds",
        description:
          "Soft and relaxing jazz music combined with rain sounds for calm and peace.",
        thumbnail: "https://i.ytimg.com/vi/hlWiI4xVXKY/hqdefault.jpg",
        channelTitle: "Calm Music",
        publishedAt: new Date("2021-10-05"),
        embedUrl: "https://www.youtube.com/embed/hlWiI4xVXKY",
        watchUrl: "https://www.youtube.com/watch?v=hlWiI4xVXKY",
      },
    ];
  } else {
    return [
      {
        id: "jfKfPfyJRdk",
        title: "lofi hip hop radio - beats to study/relax to",
        description:
          "A 24/7 lofi hip hop livestream, with relaxing beats to study, work, or focus.",
        thumbnail: "https://i.ytimg.com/vi/jfKfPfyJRdk/hqdefault.jpg",
        channelTitle: "Lofi Girl",
        publishedAt: new Date("2022-02-18"),
        embedUrl: "https://www.youtube.com/embed/jfKfPfyJRdk",
        watchUrl: "https://www.youtube.com/watch?v=jfKfPfyJRdk",
      },
      {
        id: "5qap5aO4i9A",
        title: "lofi hip hop radio - beats to relax/study to",
        description:
          "Upbeat lofi hip hop - perfect music to boost your mood while studying or working.",
        thumbnail: "https://i.ytimg.com/vi/5qap5aO4i9A/hqdefault.jpg",
        channelTitle: "Lofi Girl",
        publishedAt: new Date("2020-02-22"),
        embedUrl: "https://www.youtube.com/embed/5qap5aO4i9A",
        watchUrl: "https://www.youtube.com/watch?v=5qap5aO4i9A",
      },
      {
        id: "n61ULEU7CO0",
        title: "Study Music Alpha Waves: Relaxing Studying Music",
        description:
          "Study music with alpha waves that helps you concentrate and focus on learning.",
        thumbnail: "https://i.ytimg.com/vi/n61ULEU7CO0/hqdefault.jpg",
        channelTitle: "YellowBrickCinema",
        publishedAt: new Date("2018-04-10"),
        embedUrl: "https://www.youtube.com/embed/n61ULEU7CO0",
        watchUrl: "https://www.youtube.com/watch?v=n61ULEU7CO0",
      },
    ];
  }
};

// Default export
export default {
  searchVideos,
  getVideoDetails,
  getRecommendedVideos,
  saveToRecentlyPlayed,
  getRecentlyPlayed,
};
