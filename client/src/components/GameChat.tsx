import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mic, Send, X } from "lucide-react";
import { Input } from "@/components/ui/input";

interface ChatMessage {
  id: string;
  sender: string;
  senderName: string;
  type: "text" | "voice";
  content: string;
  timestamp: Date;
  audioUrl?: string;
}

interface GameChatProps {
  isOpen: boolean;
  onClose: () => void;
  onSendMessage?: (message: { type: "text" | "voice"; content: string; duration?: number }) => void;
  currentPlayerId?: string;
  currentPlayerName?: string;
  messages?: ChatMessage[];
}

const EMOJI_LIST = ["😂", "🎉", "😢", "😡", "👍", "👎", "🔥", "💪", "🤔", "😎", "🤗", "❤️", "😘", "🙏", "💯"];

const QUICK_MESSAGES = [
  "Nice move!",
  "Good game!",
  "Lucky guess!",
  "Well played!",
  "Let's go!",
  "Gg wp",
];

export default function GameChat({ 
  isOpen, 
  onClose, 
  onSendMessage,
  currentPlayerId = "player1",
  currentPlayerName = "You",
  messages = []
}: GameChatProps) {
  const [inputText, setInputText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, messages.length]);

  const handleSendText = () => {
    if (inputText.trim()) {
      // Send to parent component via callback
      if (onSendMessage) {
        onSendMessage({ type: "text", content: inputText });
      }
      
      setInputText("");
    }
  };

  const addEmoji = (emoji: string) => {
    setInputText(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Use supported MIME type - browsers vary in support
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
        ? 'audio/webm;codecs=opus' 
        : MediaRecorder.isTypeSupported('audio/webm') 
          ? 'audio/webm'
          : 'audio/mp4';
      
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        
        // Convert audio blob to base64 for transmission
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          
          // Send to parent component via callback
          if (onSendMessage) {
            onSendMessage({ type: "voice", content: base64Audio, duration: recordingTime });
          }
        };
        reader.readAsDataURL(audioBlob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
        setRecordingTime(0);
      };

      mediaRecorder.start(100); // Record in 100ms chunks for better data availability
      setIsRecording(true);
      setRecordingTime(0);

      // Timer for recording duration
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Microphone access denied:", error);
      alert("Please allow microphone access to send voice messages");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 w-80 h-96 bg-card border-2 border-primary/50 rounded-lg shadow-2xl z-40 flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-primary/30 bg-gradient-to-r from-primary/20 to-transparent">
        <h3 className="text-lg font-bold text-primary">💬 Game Chat</h3>
        <Button
          size="icon"
          variant="ghost"
          onClick={onClose}
          className="h-6 w-6"
          data-testid="button-close-chat"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-black/20">
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <p className="text-sm">Start chatting with your opponent!</p>
          </div>
        ) : (
          messages.map(msg => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === currentPlayerId ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs rounded-lg px-3 py-2 ${
                  msg.sender === currentPlayerId
                    ? "bg-primary text-primary-foreground"
                    : "bg-white/10 text-foreground border border-primary/30"
                }`}
              >
                {msg.sender !== currentPlayerId && (
                  <p className="text-xs font-bold mb-1 opacity-70">{msg.senderName}</p>
                )}
                {msg.type === "text" ? (
                  <p className="text-sm break-words">{msg.content}</p>
                ) : (
                  <div className="flex flex-col gap-1">
                    <span className="text-xs flex items-center gap-1">🎤 Voice Message</span>
                    {msg.audioUrl && (
                      <audio
                        src={msg.audioUrl}
                        controls
                        className="h-8 w-full max-w-[180px]"
                        data-testid="audio-player"
                        preload="auto"
                      />
                    )}
                  </div>
                )}
                <span className="text-xs opacity-70 mt-1">
                  {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Messages */}
      <div className="px-3 pt-2 flex flex-wrap gap-1">
        {QUICK_MESSAGES.map((msg) => (
          <button
            key={msg}
            onClick={() => {
              if (onSendMessage) {
                onSendMessage({ type: "text", content: msg });
              }
            }}
            className="text-xs px-2 py-1 rounded-full bg-primary/20 hover:bg-primary/40 text-primary border border-primary/30 transition-colors"
            data-testid={`quick-msg-${msg.toLowerCase().replace(/\s+/g, "-")}`}
          >
            {msg}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div className="border-t border-primary/30 p-3 space-y-2">
        {isRecording && (
          <div className="bg-red-500/20 border border-red-500/50 rounded px-3 py-2 text-center text-sm text-red-400">
            Recording... {recordingTime}s
          </div>
        )}
        
        {showEmojiPicker && (
          <div className="bg-black/40 rounded p-2 border border-primary/30">
            <div className="grid grid-cols-5 gap-1">
              {EMOJI_LIST.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => addEmoji(emoji)}
                  className="text-2xl hover:bg-primary/20 rounded p-1 transition-colors"
                  data-testid={`emoji-${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Message..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendText()}
            disabled={isRecording}
            className="text-sm h-8"
            data-testid="input-chat-message"
          />
          <Button
            size="icon"
            variant="outline"
            className="h-8 w-8"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            data-testid="button-emoji-picker"
          >
            😊
          </Button>
          <Button
            size="icon"
            variant={isRecording ? "destructive" : "outline"}
            className="h-8 w-8"
            onClick={isRecording ? stopRecording : startRecording}
            data-testid="button-voice-record"
          >
            <Mic className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            className="h-8 w-8 bg-primary hover:bg-primary/80"
            onClick={handleSendText}
            disabled={!inputText.trim() || isRecording}
            data-testid="button-send-chat"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
