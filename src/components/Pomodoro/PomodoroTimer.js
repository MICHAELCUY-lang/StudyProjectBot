import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import {
  PomodoroSessionsModel,
  StatisticsModel,
  PreferencesModel,
} from "../../services/db";

// Styled components
const TimerContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  background-color: ${(props) => (props.isBreak ? "#4CAF50" : "#25AA60")};
  color: white;
  border-radius: 1rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  transition: background-color 0.5s ease;
`;

const TimerDisplay = styled.div`
  font-size: 6rem;
  font-weight: bold;
  margin: 1.5rem 0;
  font-family: "Roboto Mono", monospace;
`;

const TimerLabel = styled.div`
  font-size: 1.5rem;
  font-weight: 500;
  margin-bottom: 1rem;
`;

const ControlsContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  background-color: white;
  color: ${(props) => (props.isBreak ? "#4CAF50" : "#F44336")};
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 0.6rem;
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 1rem;
  margin: 1.5rem 0;
  overflow: hidden;
`;

const Progress = styled.div`
  height: 100%;
  width: ${(props) => props.percentage}%;
  background-color: white;
  transition: width 1s linear;
`;

const SessionInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  font-size: 0.9rem;
`;

const SessionCounter = styled.div`
  display: flex;
  gap: 0.3rem;
  margin-top: 0.5rem;
`;

const SessionDot = styled.div`
  width: 0.8rem;
  height: 0.8rem;
  border-radius: 50%;
  background-color: ${(props) =>
    props.active ? "white" : "rgba(255, 255, 255, 0.3)"};
`;

const TaskSelection = styled.div`
  margin-bottom: 1.5rem;
  width: 100%;
`;

const TaskSelect = styled.select`
  width: 100%;
  padding: 0.75rem;
  border-radius: 0.5rem;
  border: none;
  font-size: 1rem;
  background-color: rgba(255, 255, 255, 0.9);
  color: #333;
`;

// Component utama
const PomodoroTimer = ({ tasks = [], onSessionComplete }) => {
  // State untuk timer
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [currentSession, setCurrentSession] = useState(1);
  const [maxSessions, setMaxSessions] = useState(4);
  const [progress, setProgress] = useState(0);
  const [selectedTaskId, setSelectedTaskId] = useState("");
  const [settings, setSettings] = useState({
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    longBreakAfter: 4,
  });

  // Refs
  const timerRef = useRef(null);
  const sessionRef = useRef(null);
  const totalSeconds = useRef(0);
  const elapsedSeconds = useRef(0);
  const audioRef = useRef(null);

  // Mengambil pengaturan Pomodoro dari database
  useEffect(() => {
    PreferencesModel.getPomodoroSettings().then((pomodoroSettings) => {
      setSettings(pomodoroSettings);
      setMinutes(pomodoroSettings.workDuration);
      setMaxSessions(pomodoroSettings.longBreakAfter);
    });

    // Inisialisasi audio untuk notifikasi
    audioRef.current = new Audio("/notification.mp3");

    // Meminta izin notifikasi
    if (
      "Notification" in window &&
      Notification.permission !== "granted" &&
      Notification.permission !== "denied"
    ) {
      Notification.requestPermission();
    }

    return () => {
      // Cleanup timer saat unmount
      if (timerRef.current) clearInterval(timerRef.current);
      if (sessionRef.current) {
        // Simpan data sesi yang belum selesai
        PomodoroSessionsModel.completeSession(sessionRef.current);
      }
    };
  }, []);

  // Effect untuk menghitung total dan elapsed seconds
  useEffect(() => {
    if (isBreak) {
      const breakDuration =
        currentSession % settings.longBreakAfter === 0
          ? settings.longBreakDuration
          : settings.shortBreakDuration;
      totalSeconds.current = breakDuration * 60;
    } else {
      totalSeconds.current = settings.workDuration * 60;
    }
    elapsedSeconds.current = 0;
  }, [isBreak, currentSession, settings]);

  // Effect untuk update progress bar
  useEffect(() => {
    if (totalSeconds.current > 0) {
      const secondsLeft = minutes * 60 + seconds;
      elapsedSeconds.current = totalSeconds.current - secondsLeft;
      setProgress((elapsedSeconds.current / totalSeconds.current) * 100);
    }
  }, [minutes, seconds]);

  // Timer logic
  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            // Timer selesai
            clearInterval(timerRef.current);
            playNotification();
            handleTimerComplete();
          } else {
            // Kurangi menit, set detik ke 59
            setMinutes((prev) => prev - 1);
            setSeconds(59);
          }
        } else {
          // Kurangi detik
          setSeconds((prev) => prev - 1);
        }
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, minutes, seconds]);

  // Fungsi helper untuk format waktu
  const formatTime = (mins, secs) => {
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Fungsi untuk memulai timer
  const startTimer = () => {
    if (!isActive) {
      setIsActive(true);

      // Jika memulai sesi fokus (bukan istirahat), simpan ke database
      if (!isBreak && selectedTaskId) {
        PomodoroSessionsModel.addSession({
          taskId: selectedTaskId !== "none" ? parseInt(selectedTaskId) : null,
          startTime: new Date(),
          type: "work",
        }).then((id) => {
          sessionRef.current = id;
        });
      }
    }
  };

  // Fungsi untuk menjeda timer
  const pauseTimer = () => {
    setIsActive(false);
  };

  // Fungsi untuk reset timer
  const resetTimer = () => {
    setIsActive(false);

    if (isBreak) {
      setMinutes(
        currentSession % settings.longBreakAfter === 0
          ? settings.longBreakDuration
          : settings.shortBreakDuration
      );
    } else {
      setMinutes(settings.workDuration);
    }

    setSeconds(0);
    setProgress(0);
    elapsedSeconds.current = 0;

    // Jika ada sesi aktif, batalkan
    if (sessionRef.current) {
      PomodoroSessionsModel.deleteSession(sessionRef.current);
      sessionRef.current = null;
    }
  };

  // Fungsi untuk melewati timer saat ini
  const skipTimer = () => {
    handleTimerComplete();
  };

  // Fungsi untuk memutar notifikasi
  const playNotification = () => {
    if (audioRef.current) {
      audioRef.current.play();
    }

    // Tampilkan browser notification jika diizinkan
    if ("Notification" in window && Notification.permission === "granted") {
      const title = isBreak ? "Istirahat Selesai!" : "Waktu untuk Istirahat!";
      const body = isBreak
        ? "Saatnya kembali bekerja!"
        : "Waktu istirahat, ambil jeda sejenak.";

      new Notification(title, {
        body,
        icon: "/logo192.png",
      });
    }
  };

  // Fungsi yang dijalankan ketika timer selesai
  const handleTimerComplete = () => {
    setIsActive(false);

    if (!isBreak) {
      // Sesi fokus selesai
      if (sessionRef.current) {
        PomodoroSessionsModel.completeSession(sessionRef.current);
        sessionRef.current = null;

        // Update statistik
        StatisticsModel.incrementPomodoroCount();
        StatisticsModel.addFocusTime(settings.workDuration);
      }

      // Tentukan jenis istirahat
      const isLongBreak = currentSession % settings.longBreakAfter === 0;
      const breakDuration = isLongBreak
        ? settings.longBreakDuration
        : settings.shortBreakDuration;

      // Set ke mode istirahat
      setIsBreak(true);
      setMinutes(breakDuration);
      setSeconds(0);

      // Callback untuk komponen induk
      if (onSessionComplete) {
        onSessionComplete({
          type: "work",
          duration: settings.workDuration,
          taskId: selectedTaskId !== "none" ? parseInt(selectedTaskId) : null,
        });
      }
    } else {
      // Istirahat selesai
      setIsBreak(false);
      setMinutes(settings.workDuration);
      setSeconds(0);

      // Tambah sesi jika bukan long break
      if (currentSession % settings.longBreakAfter !== 0) {
        setCurrentSession((prev) => prev + 1);
      } else {
        // Reset sesi counter setelah long break
        setCurrentSession(1);
      }

      // Callback untuk komponen induk
      if (onSessionComplete) {
        onSessionComplete({
          type: "break",
          duration:
            currentSession % settings.longBreakAfter === 0
              ? settings.longBreakDuration
              : settings.shortBreakDuration,
        });
      }
    }
  };

  // Handler untuk perubahan task yang dipilih
  const handleTaskChange = (e) => {
    setSelectedTaskId(e.target.value);
  };

  return (
    <TimerContainer isBreak={isBreak}>
      <TimerLabel>
        {isBreak
          ? currentSession % settings.longBreakAfter === 0
            ? "Istirahat Panjang"
            : "Istirahat Pendek"
          : "Fokus"}
      </TimerLabel>

      {!isBreak && !isActive && (
        <TaskSelection>
          <TaskSelect value={selectedTaskId} onChange={handleTaskChange}>
            <option value="none">-- Pilih Tugas --</option>
            {tasks.map((task) => (
              <option key={task.id} value={task.id}>
                {task.title}
              </option>
            ))}
          </TaskSelect>
        </TaskSelection>
      )}

      <TimerDisplay>{formatTime(minutes, seconds)}</TimerDisplay>

      <ProgressBar>
        <Progress percentage={progress} />
      </ProgressBar>

      <SessionInfo>
        Sesi {currentSession} dari {settings.longBreakAfter}
      </SessionInfo>

      <SessionCounter>
        {[...Array(settings.longBreakAfter)].map((_, i) => (
          <SessionDot key={i} active={i < currentSession} />
        ))}
      </SessionCounter>

      <ControlsContainer>
        {!isActive ? (
          <Button
            onClick={startTimer}
            isBreak={isBreak}
            disabled={!isBreak && selectedTaskId === ""}
          >
            Mulai
          </Button>
        ) : (
          <Button onClick={pauseTimer} isBreak={isBreak}>
            Jeda
          </Button>
        )}

        <Button onClick={resetTimer} isBreak={isBreak}>
          Reset
        </Button>

        <Button onClick={skipTimer} isBreak={isBreak}>
          Lewati
        </Button>
      </ControlsContainer>
    </TimerContainer>
  );
};

export default PomodoroTimer;
