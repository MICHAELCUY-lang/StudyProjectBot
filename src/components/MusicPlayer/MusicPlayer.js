import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { PreferencesModel } from "../../services/db";

// Styled components with new design
const MusicPlayerContainer = styled.div`
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #25aa60 0%, #1d8549 100%);
  color: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 8px 20px rgba(29, 133, 73, 0.25);
  transition: all 0.5s ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 6px;
    background: linear-gradient(90deg, #67c694, #8fdcb4, #67c694);
    opacity: 0.8;
  }
`;

const WaveBackground = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 40px;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120' preserveAspectRatio='none'%3E%3Cpath d='M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z' opacity='0.1' fill='%23FFFFFF'%3E%3C/path%3E%3Cpath d='M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z' opacity='0.15' fill='%23FFFFFF'%3E%3C/path%3E%3C/svg%3E");
  background-size: cover;
  background-repeat: no-repeat;
  z-index: 0;
  opacity: 0.5;
`;

const PlayerTitle = styled.h3`
  margin: 0 0 1.5rem 0;
  font-size: 1.3rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  z-index: 1;

  i {
    font-size: 1.5rem;
  }
`;

const MusicControls = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 1.5rem 0;
  z-index: 1;
`;

const PlayButton = styled.button`
  width: 65px;
  height: 65px;
  border-radius: 50%;
  background: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #25aa60;
  cursor: pointer;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  position: relative;
  z-index: 1;

  &:hover {
    transform: scale(1.08);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  }

  &:active {
    transform: scale(0.98);
  }

  i {
    font-size: 2.2rem;
  }

  &::after {
    content: "";
    position: absolute;
    top: -5px;
    left: -5px;
    right: -5px;
    bottom: -5px;
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.3);
    z-index: -1;
  }
`;

const ControlButton = styled.button`
  width: 45px;
  height: 45px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  margin: 0 0.8rem;

  &:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: translateY(-2px);
  }

  i {
    font-size: 1.2rem;
  }
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 6px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  margin: 0.5rem 0;
  cursor: pointer;
  position: relative;
  z-index: 1;
  overflow: hidden;
`;

const Progress = styled.div`
  height: 100%;
  width: ${(props) => props.$percentage}%;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.8) 0%,
    rgba(255, 255, 255, 1) 100%
  );
  border-radius: 3px;
  transition: width 0.2s ease;
  position: relative;

  &::after {
    content: "";
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    width: 5px;
    background: white;
    border-radius: 50%;
    box-shadow: 0 0 5px rgba(255, 255, 255, 0.8);
  }
`;

const TimeDisplay = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  margin-top: 0.5rem;
  opacity: 0.8;
  z-index: 1;
`;

const SearchContainer = styled.div`
  margin-top: 1.5rem;
  position: relative;
  z-index: 1;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.85rem;
  padding-right: 3rem;
  border-radius: 2rem;
  border: none;
  font-size: 0.95rem;
  background-color: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  outline: none;
  transition: all 0.3s ease;

  &::placeholder {
    color: rgba(255, 255, 255, 0.7);
  }

  &:focus {
    background-color: rgba(255, 255, 255, 0.2);
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.3);
  }
`;

const SearchButton = styled.button`
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  height: 2.5rem;
  width: 2.5rem;
  border-radius: 50%;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }

  i {
    font-size: 1.2rem;
  }
`;

const ServiceTabs = styled.div`
  display: flex;
  gap: 0.8rem;
  margin-bottom: 1.5rem;
  z-index: 1;
`;

const ServiceTab = styled.button`
  padding: 0.6rem 1.2rem;
  background-color: ${(props) =>
    props.$active ? "rgba(255, 255, 255, 0.25)" : "rgba(255, 255, 255, 0.1)"};
  color: white;
  border: 1px solid
    ${(props) =>
      props.$active ? "rgba(255, 255, 255, 0.5)" : "rgba(255, 255, 255, 0.2)"};
  border-radius: 2rem;
  font-weight: ${(props) => (props.$active ? "600" : "400")};
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  backdrop-filter: blur(4px);

  &:hover {
    background-color: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }

  ${(props) =>
    props.$active &&
    `
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  `}
`;

const ResultsList = styled.div`
  margin-top: 1.5rem;
  max-height: 300px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  background-color: rgba(255, 255, 255, 0.08);
  border-radius: 1rem;
  padding: 0.8rem;
  border: 1px solid rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(4px);
  z-index: 1;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 3px;
  }
`;

const ResultItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.8rem;
  border-radius: 0.8rem;
  background-color: rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);

  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
    border-color: rgba(255, 255, 255, 0.3);
  }
`;

const ResultThumbnail = styled.img`
  width: 55px;
  height: 55px;
  border-radius: 0.5rem;
  object-fit: cover;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
`;

const ResultInfo = styled.div`
  flex: 1;
  overflow: hidden;
`;

const ResultTitle = styled.div`
  font-weight: 600;
  font-size: 0.95rem;
  margin-bottom: 0.3rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ResultArtist = styled.div`
  font-size: 0.8rem;
  opacity: 0.8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const VolumeControl = styled.div`
  display: flex;
  align-items: center;
  margin-top: 1.5rem;
  gap: 0.8rem;
  z-index: 1;
  background: transparent;
  padding: 0.8rem 0;
  transition: all 0.3s ease;
`;

const VolumeIconButton = styled.button`
  background: transparent;
  border: none;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  cursor: pointer;
  padding: 0;

  &:hover {
    opacity: 0.8;
  }

  &:active {
    transform: scale(0.95);
  }
`;

const VolumeIcon = styled.i`
  font-size: 1.3rem;
  opacity: 0.9;
`;

const VolumeSlider = styled.input`
  flex: 1;
  -webkit-appearance: none;
  appearance: none;
  height: 3px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.3);
  outline: none;
  cursor: pointer;
  margin: 0 4px;

  /* This creates the filled part of the slider */
  &::-webkit-slider-runnable-track {
    height: 3px;
    border-radius: 2px;
    background: rgba(255, 255, 255, 0.3);
  }

  /* Remove the default thumb */
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 0px;
    height: 0px;
    background: transparent;
    margin-top: 0px;
    box-shadow: none;
    border: none;
    opacity: 0;
  }

  &::-moz-range-track {
    height: 3px;
    border-radius: 2px;
    background: rgba(255, 255, 255, 0.3);
  }

  &::-moz-range-thumb {
    width: 0px;
    height: 0px;
    background: transparent;
    border: none;
    box-shadow: none;
    opacity: 0;
  }

  &::-moz-range-progress {
    height: 3px;
    border-radius: 2px;
    background-color: white;
  }

  /* Use a pseudo-element to create the fill effect for webkit browsers */
  background: linear-gradient(
    to right,
    white 0%,
    white ${(props) => props.$percentage}%,
    rgba(255, 255, 255, 0.3) ${(props) => props.$percentage}%,
    rgba(255, 255, 255, 0.3) 100%
  );

  /* Add hover effect */
  &:hover {
    &::-webkit-slider-runnable-track {
      background: rgba(255, 255, 255, 0.4);
    }
    &::-moz-range-track {
      background: rgba(255, 255, 255, 0.4);
    }
    background: linear-gradient(
      to right,
      white 0%,
      white ${(props) => props.$percentage}%,
      rgba(255, 255, 255, 0.4) ${(props) => props.$percentage}%,
      rgba(255, 255, 255, 0.4) 100%
    );
  }
`;

const VolumeValue = styled.span`
  font-size: 0.85rem;
  min-width: 36px;
  text-align: right;
  opacity: 0.9;
`;

const VolumeBadge = styled.div`
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%) scale(${(props) => (props.$show ? 1 : 0)});
  background: rgba(0, 0, 0, 0.5);
  color: white;
  font-size: 0.75rem;
  padding: 0.15rem 0.4rem;
  border-radius: 2px;
  opacity: ${(props) => (props.$show ? 1 : 0)};
  transition: all 0.2s ease;
  pointer-events: none;
`;

const VolumeWrapper = styled.div`
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
`;

const TrackInfo = styled.div`
  margin-top: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  padding: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(4px);
  z-index: 1;
`;

const TrackThumbnail = styled.img`
  width: 65px;
  height: 65px;
  border-radius: 0.5rem;
  object-fit: cover;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
`;

const TrackDetails = styled.div`
  flex: 1;
`;

const TrackTitle = styled.h4`
  margin: 0;
  font-size: 1.05rem;
  font-weight: 600;
`;

const TrackArtist = styled.p`
  margin: 0.25rem 0 0 0;
  font-size: 0.9rem;
  opacity: 0.8;
`;

const NowPlayingBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.7rem;
  background-color: rgba(255, 255, 255, 0.2);
  padding: 0.2rem 0.6rem;
  border-radius: 1rem;
  margin-top: 0.5rem;
  width: fit-content;

  i {
    font-size: 0.8rem;
  }
`;

const PlayerViewContainer = styled.div`
  margin-top: 1.5rem;
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 1rem;
  overflow: hidden;
  position: relative;
  padding-top: 56.25%; // 16:9 aspect ratio
  display: ${(props) => (props.$visible ? "block" : "none")};
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.15);
  z-index: 1;
`;

const IframeContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
`;

const EqualizerBars = styled.div`
  display: ${(props) => (props.$isPlaying ? "flex" : "none")};
  align-items: flex-end;
  height: 20px;
  gap: 2px;
  margin-left: 0.8rem;
`;

const Bar = styled.span`
  display: inline-block;
  width: 3px;
  height: ${(props) => props.$height}px;
  background-color: white;
  border-radius: 1px;
  animation: ${(props) => `equalizer ${props.$duration}s ease-in-out infinite`};
  animation-delay: ${(props) => props.$delay}s;
  opacity: 0.9;

  @keyframes equalizer {
    0%,
    100% {
      height: ${(props) => props.$minHeight}px;
    }
    50% {
      height: ${(props) => props.$height}px;
    }
  }
`;

// Main component
const MusicPlayer = ({ isBreak }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(70);
  const [currentTime, setCurrentTime] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [service, setService] = useState("youtube"); // youtube or spotify
  const [showPlayer, setShowPlayer] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [showVolumeBadge, setShowVolumeBadge] = useState(false);
  const volumeBadgeTimeoutRef = useRef(null);

  // References
  const audioRef = useRef(null);
  const youtubePlayerRef = useRef(null);
  const progressTimerRef = useRef(null);
  const spotifyTokenRef = useRef(null);

  // Load preferences on mount
  useEffect(() => {
    PreferencesModel.getMusicPreferences().then((prefs) => {
      setVolume(prefs.volume);
    });
  }, []);

  // Handle service change
  useEffect(() => {
    // Reset when changing service
    setSearchResults([]);
    setCurrentTrack(null);
    setIsPlaying(false);
    setShowPlayer(false);
  }, [service]);

  // Effect to simulate progress updates
  useEffect(() => {
    if (isPlaying && currentTrack) {
      // Clear any existing timer
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
      }

      // Create new timer to update progress
      progressTimerRef.current = setInterval(() => {
        setCurrentTime((prevTime) => {
          const newTime = prevTime + 1;
          // Assuming a track length of 4:32 (272 seconds)
          const percentage = (newTime / 272) * 100;
          setProgress(percentage > 100 ? 100 : percentage);
          return newTime;
        });
      }, 1000);
    } else if (progressTimerRef.current) {
      // If not playing, clear the timer
      clearInterval(progressTimerRef.current);
    }

    // Cleanup on unmount
    return () => {
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
      }
    };
  }, [isPlaying, currentTrack]);

  // Function to search YouTube
  const searchYouTube = async (query) => {
    if (!query) return;

    setIsSearching(true);

    try {
      // For security reasons, we're using mock data instead of actual API calls
      // In a real app, you'd make these requests through your backend
      setSearchResults(getMockYouTubeResults(query));
    } catch (error) {
      console.error("Error searching YouTube:", error);
      // Show mock data if there's an error
      setSearchResults(getMockYouTubeResults(query));
    } finally {
      setIsSearching(false);
    }
  };

  // Function to search Spotify
  const searchSpotify = async (query) => {
    if (!query) return;

    setIsSearching(true);

    try {
      // For security reasons, we're using mock data instead of actual API calls
      // In a real app, you'd make these requests through your backend
      setSearchResults(getMockSpotifyResults(query));
    } catch (error) {
      console.error("Error searching Spotify:", error);
      // Show mock data if there's an error
      setSearchResults(getMockSpotifyResults(query));
    } finally {
      setIsSearching(false);
    }
  };

  // Handle search
  const handleSearch = () => {
    if (service === "youtube") {
      searchYouTube(searchQuery);
    } else {
      searchSpotify(searchQuery);
    }
  };

  // Handle search input
  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle search input key press
  const handleSearchKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Play track
  const playTrack = (track) => {
    setCurrentTrack(track);
    setShowPlayer(true);
    setIsPlaying(true);

    // Reset progress
    setProgress(0);
    setCurrentTime(0);
  };

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Handle volume change with smoother animation
  const handleVolumeChange = (e) => {
    const newVolume = parseInt(e.target.value);

    // Animate the volume change for smoother visual effect
    const startVolume = volume;
    const endVolume = newVolume;
    const duration = 200; // milliseconds
    const startTime = performance.now();

    const animateVolume = (currentTime) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);

      // Smooth easing function
      const easing = (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);
      const easedProgress = easing(progress);

      // Calculate current volume in animation
      const currentVolume = Math.round(
        startVolume + (endVolume - startVolume) * easedProgress
      );
      setVolume(currentVolume);

      if (progress < 1) {
        requestAnimationFrame(animateVolume);
      } else {
        // When animation completes, ensure we have the exact target volume
        setVolume(endVolume);

        // Save volume preference when animation completes
        PreferencesModel.getMusicPreferences().then((prefs) => {
          PreferencesModel.updateMusicPreferences({
            ...prefs,
            volume: endVolume,
          });
        });
      }
    };

    // Start the animation
    requestAnimationFrame(animateVolume);

    // Show volume badge
    setShowVolumeBadge(true);

    // Clear existing timeout
    if (volumeBadgeTimeoutRef.current) {
      clearTimeout(volumeBadgeTimeoutRef.current);
    }

    // Hide badge after 1.5 seconds
    volumeBadgeTimeoutRef.current = setTimeout(() => {
      setShowVolumeBadge(false);
    }, 1500);
  };

  // Toggle mute function
  const toggleMute = () => {
    if (volume === 0) {
      // If currently muted, restore to last non-zero volume or default 70%
      const lastVolume = localStorage.getItem("lastVolume") || 70;
      setVolume(parseInt(lastVolume));
    } else {
      // Store current volume before muting
      localStorage.setItem("lastVolume", volume.toString());
      setVolume(0);
    }

    // Show badge
    setShowVolumeBadge(true);

    // Clear existing timeout
    if (volumeBadgeTimeoutRef.current) {
      clearTimeout(volumeBadgeTimeoutRef.current);
    }

    // Hide badge after 1.5 seconds
    volumeBadgeTimeoutRef.current = setTimeout(() => {
      setShowVolumeBadge(false);
    }, 1500);
  };

  // Mock data for YouTube results
  const getMockYouTubeResults = (query) => {
    const isRelaxQuery =
      isBreak ||
      query.toLowerCase().includes("relax") ||
      query.toLowerCase().includes("ambient") ||
      query.toLowerCase().includes("calm");

    if (isRelaxQuery) {
      return [
        {
          id: "DWcJFNfaw9c",
          title: "Relaxing Piano Music for Stress Relief",
          thumbnail: "https://i.ytimg.com/vi/DWcJFNfaw9c/hqdefault.jpg",
          artist: "Meditation Music",
          service: "youtube",
        },
        {
          id: "77ZozI0rw7w",
          title: "Relaxing Sleep Music with Rain Sounds",
          thumbnail: "https://i.ytimg.com/vi/77ZozI0rw7w/hqdefault.jpg",
          artist: "Sleep Music",
          service: "youtube",
        },
        {
          id: "hlWiI4xVXKY",
          title: "Relaxing Jazz Music and Rain Sounds",
          thumbnail: "https://i.ytimg.com/vi/hlWiI4xVXKY/hqdefault.jpg",
          artist: "Calm Music",
          service: "youtube",
        },
      ];
    } else {
      return [
        {
          id: "jfKfPfyJRdk",
          title: "lofi hip hop radio - beats to study/relax to",
          thumbnail: "https://i.ytimg.com/vi/jfKfPfyJRdk/hqdefault.jpg",
          artist: "Lofi Girl",
          service: "youtube",
        },
        {
          id: "5qap5aO4i9A",
          title: "lofi hip hop radio - beats to relax/study to",
          thumbnail: "https://i.ytimg.com/vi/5qap5aO4i9A/hqdefault.jpg",
          artist: "Lofi Girl",
          service: "youtube",
        },
        {
          id: "n61ULEU7CO0",
          title: "Study Music Alpha Waves: Relaxing Studying Music",
          thumbnail: "https://i.ytimg.com/vi/n61ULEU7CO0/hqdefault.jpg",
          artist: "YellowBrickCinema",
          service: "youtube",
        },
      ];
    }
  };

  // Mock data for Spotify results
  const getMockSpotifyResults = (query) => {
    const isRelaxQuery =
      isBreak ||
      query.toLowerCase().includes("relax") ||
      query.toLowerCase().includes("ambient") ||
      query.toLowerCase().includes("calm");

    if (isRelaxQuery) {
      return [
        {
          id: "1",
          title: "Peaceful Piano",
          thumbnail:
            "https://i.scdn.co/image/ab67706f00000002ca5a7517156021292e5663a4",
          artist: "Spotify",
          service: "spotify",
        },
        {
          id: "2",
          title: "Deep Sleep",
          thumbnail:
            "https://i.scdn.co/image/ab67706f000000025249a34bd5c54d12ae7a8613",
          artist: "Spotify",
          service: "spotify",
        },
        {
          id: "3",
          title: "Relaxing Jazz",
          thumbnail:
            "https://i.scdn.co/image/ab67706f0000000278b4745cb9ce8ffe32daaf7e",
          artist: "Spotify",
          service: "spotify",
        },
      ];
    } else {
      return [
        {
          id: "4",
          title: "Focus Flow",
          thumbnail:
            "https://i.scdn.co/image/ab67706f000000022d4195adee3c41dabd718435",
          artist: "Spotify",
          service: "spotify",
        },
        {
          id: "5",
          title: "Brain Food",
          thumbnail:
            "https://i.scdn.co/image/ab67706f000000026e849349fc0a57e606644442",
          artist: "Spotify",
          service: "spotify",
        },
        {
          id: "6",
          title: "Instrumental Study",
          thumbnail:
            "https://i.scdn.co/image/ab67706f00000002fe24d7084be472288cd6ee6c",
          artist: "Spotify",
          service: "spotify",
        },
      ];
    }
  };

  // Render equalizer bars
  const renderEqualizerBars = () => {
    return (
      <EqualizerBars $isPlaying={isPlaying}>
        {[...Array(5)].map((_, i) => (
          <Bar
            key={i}
            $height={12 + Math.random() * 8}
            $minHeight={4 + Math.random() * 4}
            $duration={0.8 + Math.random() * 0.4}
            $delay={Math.random() * 0.5}
          />
        ))}
      </EqualizerBars>
    );
  };

  return (
    <MusicPlayerContainer>
      <WaveBackground />
      <PlayerTitle>
        <i className="material-icons">{isBreak ? "spa" : "headphones"}</i>
        {isBreak ? "Musik Relaksasi" : "Musik Fokus"}
        {renderEqualizerBars()}
      </PlayerTitle>

      <ServiceTabs>
        <ServiceTab
          $active={service === "youtube"}
          onClick={() => setService("youtube")}
        >
          <i className="material-icons" style={{ fontSize: "1.2rem" }}>
            videocam
          </i>
          YouTube
        </ServiceTab>
        <ServiceTab
          $active={service === "spotify"}
          onClick={() => setService("spotify")}
        >
          <i className="material-icons" style={{ fontSize: "1.2rem" }}>
            audiotrack
          </i>
          Spotify
        </ServiceTab>
      </ServiceTabs>

      <SearchContainer>
        <SearchInput
          type="text"
          placeholder={`Cari ${service === "youtube" ? "video" : "lagu"}...`}
          value={searchQuery}
          onChange={handleSearchInputChange}
          onKeyPress={handleSearchKeyPress}
        />
        <SearchButton onClick={handleSearch}>
          <i className="material-icons">search</i>
        </SearchButton>
      </SearchContainer>

      {searchResults.length > 0 && (
        <ResultsList>
          {searchResults.map((result) => (
            <ResultItem key={result.id} onClick={() => playTrack(result)}>
              <ResultThumbnail src={result.thumbnail} alt={result.title} />
              <ResultInfo>
                <ResultTitle>{result.title}</ResultTitle>
                <ResultArtist>{result.artist}</ResultArtist>
              </ResultInfo>
            </ResultItem>
          ))}
        </ResultsList>
      )}

      {currentTrack && (
        <>
          <TrackInfo>
            <TrackThumbnail
              src={currentTrack.thumbnail}
              alt={currentTrack.title}
            />
            <TrackDetails>
              <TrackTitle>{currentTrack.title}</TrackTitle>
              <TrackArtist>{currentTrack.artist}</TrackArtist>
              <NowPlayingBadge>
                <i className="material-icons" style={{ fontSize: "0.8rem" }}>
                  {currentTrack.service === "youtube"
                    ? "videocam"
                    : "audiotrack"}
                </i>
                {currentTrack.service === "youtube" ? "YouTube" : "Spotify"}
              </NowPlayingBadge>
            </TrackDetails>
          </TrackInfo>

          <MusicControls>
            <ControlButton title="Previous">
              <i className="material-icons">skip_previous</i>
            </ControlButton>
            <PlayButton onClick={() => setIsPlaying(!isPlaying)}>
              <i className="material-icons">
                {isPlaying ? "pause" : "play_arrow"}
              </i>
            </PlayButton>
            <ControlButton title="Next">
              <i className="material-icons">skip_next</i>
            </ControlButton>
          </MusicControls>

          <ProgressBar>
            <Progress $percentage={progress} />
          </ProgressBar>
          <TimeDisplay>
            <span>{formatTime(currentTime)}</span>
            <span>4:32</span>
          </TimeDisplay>

          <PlayerViewContainer $visible={showPlayer}>
            <IframeContainer>
              {currentTrack && currentTrack.service === "youtube" && (
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${currentTrack.id}?autoplay=1&rel=0`}
                  title="YouTube player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              )}
              {currentTrack && currentTrack.service === "spotify" && (
                <iframe
                  src={`https://open.spotify.com/embed/track/${currentTrack.id}`}
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  allowTransparency="true"
                  allow="encrypted-media"
                  title="Spotify player"
                ></iframe>
              )}
            </IframeContainer>
          </PlayerViewContainer>
        </>
      )}

      <VolumeControl>
        <VolumeIconButton
          onClick={toggleMute}
          title={volume === 0 ? "Unmute" : "Mute"}
        >
          <VolumeIcon className="material-icons">
            {volume === 0
              ? "volume_off"
              : volume < 30
              ? "volume_down"
              : "volume_up"}
          </VolumeIcon>
        </VolumeIconButton>
        <VolumeWrapper>
          <VolumeSlider
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={handleVolumeChange}
            $percentage={volume}
          />
        </VolumeWrapper>
      </VolumeControl>
    </MusicPlayerContainer>
  );
};

export default MusicPlayer;
