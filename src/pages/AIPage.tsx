import { useState, useRef, useEffect } from "react";
import { useTheme }                    from "../context/ThemeContext";
import { Send, Sparkles }              from "lucide-react";

type Message = { role: "user" | "ai"; text: string };

const SUGGESTIONS = [
  "Что можно съесть на 400 ккал?",
  "Сколько белка мне нужно в день?",
  "Составь план питания на завтра",
];

export const AIPage = () => {
  const theme = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = (text: string) => {
    if (!text.trim()) return;
    setMessages((prev) => [
      ...prev,
      { role: "user", text },
      { role: "ai", text: "Это демо-ответ ИИ. Подключи реальный API для полноценной работы." },
    ]);
    setInput("");
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-5 pb-3 flex items-center gap-2">
        <div
          className="size-8 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${theme.button_color}20` }}
        >
          <Sparkles size={16} style={{ color: theme.button_color }} />
        </div>
        <h1 className="text-xl font-bold" style={{ color: theme.text_color }}>
          Calora AI
        </h1>
      </div>

      {/* Messages / empty state */}
      <div className="flex-1 overflow-y-auto px-4 flex flex-col gap-3">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center flex-1 gap-5 py-12">
            <div
              className="size-16 rounded-3xl flex items-center justify-center"
              style={{ backgroundColor: `${theme.button_color}15` }}
            >
              <Sparkles size={28} style={{ color: theme.button_color }} />
            </div>
            <div className="text-center">
              <p className="font-semibold text-base" style={{ color: theme.text_color }}>
                Спроси меня о питании
              </p>
              <p className="text-sm mt-1" style={{ color: theme.hint_color }}>
                Я помогу с калориями, рационом и целями
              </p>
            </div>
            <div className="flex flex-col gap-2 w-full">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="w-full text-left rounded-2xl px-4 py-3 text-sm"
                  style={{
                    backgroundColor: theme.section_bg_color,
                    border: `1px solid ${theme.section_separator_color}`,
                    color: theme.text_color,
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className="max-w-[80%] rounded-2xl px-4 py-2.5 text-sm"
                  style={
                    msg.role === "user"
                      ? { backgroundColor: theme.button_color, color: theme.button_text_color }
                      : { backgroundColor: theme.section_bg_color, color: theme.text_color, border: `1px solid ${theme.section_separator_color}` }
                  }
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div
        className="px-4 pt-3 pb-4.5 flex gap-2"
        style={{ borderTop: `1px solid ${theme.section_separator_color}` }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send(input)}
          placeholder="Напиши сообщение…"
          className="flex-1 rounded-2xl px-4 py-2.5 text-sm outline-none"
          style={{
            backgroundColor: theme.secondary_bg_color,
            color: theme.text_color,
            border: `1px solid ${theme.section_separator_color}`,
          }}
        />
        <button
          onClick={() => send(input)}
          disabled={!input.trim()}
          className="size-10 rounded-2xl flex items-center justify-center shrink-0"
          style={{
            backgroundColor: input.trim() ? theme.button_color : theme.secondary_bg_color,
            color: input.trim() ? theme.button_text_color : theme.hint_color,
            transition: "all 0.2s",
          }}
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
};
