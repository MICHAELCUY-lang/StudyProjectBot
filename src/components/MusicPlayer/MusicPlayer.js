import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { PreferencesModel } from "../../services/db";

// Fixed styled components with transient props (using $prefix)
const MusicPlayerContainer = styled.div`
  display: flex;
  flex-direction: column;
  background-color: ${(props) => (props.$isBreak ? "#4CAF50" : "#4A00E0")};
  color: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  transition: background-color 0.5s ease;
`;

const PlayerTitle = styled.h3`
  margin: 0 0 1rem 0;
  font-size: 1.2rem;
  font-weight: 600;
`;

const MusicControls = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 1rem 0;
`;

const PlayButton = styled.button`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${(props) => (props.$isBreak ? "#4CAF50" : "#4A00E0")};
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;

  &:hover {
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.98);
  }

  i {
    font-size: 2rem;
  }
`;

const ControlButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.2);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: rgba(255, 255, 255, 0.3);
  }

  i {
    font-size: 1.2rem;
  }
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 4px;
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
  margin: 0.5rem 0;
  cursor: pointer;
  position: relative;
`;

const Progress = styled.div`
  height: 100%;
  width: ${(props) => props.$percentage}%;
  background-color: white;
  border-radius: 2px;
  transition: width 0.2s ease;
`;

const TimeDisplay = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  margin-top: 0.5rem;
`;

const SearchContainer = styled.div`
  margin-top: 1rem;
  position: relative;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem;
  padding-right: 3rem;
  border-radius: 0.5rem;
  border: none;
  font-size: 0.9rem;
  background-color: rgba(255, 255, 255, 0.9);
  outline: none;

  &:focus {
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.5);
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
  color: #4a00e0;
`;

const ServiceTabs = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const ServiceTab = styled.button`
  padding: 0.5rem 1rem;
  background-color: ${(props) =>
    props.$active ? "white" : "rgba(255, 255, 255, 0.2)"};
  color: ${(props) =>
    props.$active ? (props.$isBreak ? "#4CAF50" : "#4A00E0") : "white"};
  border: none;
  border-radius: 0.5rem;
  font-weight: ${(props) => (props.$active ? "600" : "400")};
  cursor: pointer;
  transition: all 0.2s ease;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover {
    background-color: ${(props) =>
      props.$active ? "white" : "rgba(255, 255, 255, 0.3)"};
  }
`;

const ResultsList = styled.div`
  margin-top: 1rem;
  max-height: 200px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  padding: 0.5rem;
`;

const ResultItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  border-radius: 0.5rem;
  background-color: rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }
`;

const ResultThumbnail = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 0.25rem;
  object-fit: cover;
`;

const ResultInfo = styled.div`
  flex: 1;
  overflow: hidden;
`;

const ResultTitle = styled.div`
  font-weight: 500;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
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
  margin-top: 1rem;
  gap: 0.5rem;
`;

const VolumeSlider = styled.input`
  width: 100%;
  -webkit-appearance: none;
  height: 4px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.3);
  outline: none;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: white;
    cursor: pointer;
  }

  &::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: white;
    cursor: pointer;
    border: none;
  }
`;

const TrackInfo = styled.div`
  margin-top: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const TrackThumbnail = styled.img`
  width: 60px;
  height: 60px;
  border-radius: 0.25rem;
  object-fit: cover;
`;

const TrackDetails = styled.div`
  flex: 1;
`;

const TrackTitle = styled.h4`
  margin: 0;
  font-size: 1rem;
  font-weight: 500;
`;

const TrackArtist = styled.p`
  margin: 0.25rem 0 0 0;
  font-size: 0.8rem;
  opacity: 0.8;
`;

const NowPlayingBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.7rem;
  background-color: rgba(255, 255, 255, 0.2);
  padding: 0.2rem 0.5rem;
  border-radius: 1rem;
  margin-top: 0.25rem;
  width: fit-content;
`;

const PlayerViewContainer = styled.div`
  margin-top: 1rem;
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 0.5rem;
  overflow: hidden;
  position: relative;
  padding-top: 56.25%; // 16:9 aspect ratio
  display: ${(props) => (props.$visible ? "block" : "none")};
`;

const IframeContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
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

  // Handle volume change
  const handleVolumeChange = (e) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);

    // Save volume preference
    PreferencesModel.getMusicPreferences().then((prefs) => {
      PreferencesModel.updateMusicPreferences({
        ...prefs,
        volume: newVolume,
      });
    });
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

  return (
    <MusicPlayerContainer $isBreak={isBreak}>
      <PlayerTitle>{isBreak ? "Musik Relaksasi" : "Musik Fokus"}</PlayerTitle>

      <ServiceTabs>
        <ServiceTab
          $active={service === "youtube"}
          onClick={() => setService("youtube")}
          $isBreak={isBreak}
        >
          <i className="material-icons" style={{ fontSize: "1.2rem" }}>
            videocam
          </i>
          YouTube
        </ServiceTab>
        <ServiceTab
          $active={service === "spotify"}
          onClick={() => setService("spotify")}
          $isBreak={isBreak}
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

          <PlayerViewContainer $visible={showPlayer}>
            <IframeContainer>
              {currentTrack.service === "youtube" && (
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
              {currentTrack.service === "spotify" && (
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
        <i className="material-icons" style={{ fontSize: "1.2rem" }}>
          {volume === 0 ? "volume_off" : "volume_up"}
        </i>
        <VolumeSlider
          type="range"
          min="0"
          max="100"
          value={volume}
          onChange={handleVolumeChange}
        />
      </VolumeControl>
    </MusicPlayerContainer>
  );
};

export default MusicPlayer;
