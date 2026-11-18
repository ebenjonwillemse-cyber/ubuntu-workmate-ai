import { createFileRoute } from "@tanstack/react-router";
import { Copy, MessageSquarePlus, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { BrandLogo } from "@/components/app/brand-logo";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageAction,
  MessageActions,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";
import { Button } from "@/components/ui/button";
import { addActivity } from "@/lib/activity";
import { CHAT_ERROR_MARKER } from "@/lib/chat-protocol";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "AI Chatbot — AI Workplace Assistant" },
      {
        name: "description",
        content:
          "Chat with an AI workplace assistant for writing, planning, summarising and practical next steps.",
      },
      { property: "og:title", content: "AI Chatbot — AI Workplace Assistant" },
      {
        property: "og:description",
        content: "Your on-demand workplace assistant for everyday tasks.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ChatPage,
});

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  parts: { type: "text"; text: string }[];
};
type Status = "ready" | "submitted" | "streaming" | "error";

const STORAGE_KEY = "wpa-chat-v1";
const SUGGESTIONS = [
  "Help me write a polite reminder for an overdue invoice",
  "How do I run a productive 15-minute stand-up?",
  "Turn these bullet points into a short project update",
  "Give me tips for managing load-shedding around deadlines",
  "Explain the basics of POPIA for my team",
];

const textOf = (m: ChatMessage) => m.parts.map((p) => p.text).join("");
const msg = (role: ChatMessage["role"], text: string): ChatMessage => ({
  id: crypto.randomUUID(),
  role,
  parts: [{ type: "text", text }],
});

function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<Status>("ready");
  const [loaded, setLoaded] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Restore after hydration so server and client render the same first frame.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setMessages(JSON.parse(raw) as ChatMessage[]);
    } catch {
      /* ignore corrupt history */
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded || status === "streaming" || status === "submitted") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      /* storage full */
    }
  }, [messages, status, loaded]);

  useEffect(() => {
    if (status === "ready" || status === "error") inputRef.current?.focus();
  }, [status]);

  const send = useCallback(async (history: ChatMessage[]) => {
    const controller = new AbortController();
    abortRef.current = controller;
    setMessages(history);
    setStatus("submitted");
    const assistant = msg("assistant", "");
    let text = "";
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          messages: history
            .slice(-30)
            .map((m) => ({ role: m.role, content: textOf(m).slice(0, 8000) })),
        }),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) throw new Error(`Request failed (${res.status})`);
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        text += decoder.decode(value, { stream: true });
        const errAt = text.indexOf(CHAT_ERROR_MARKER);
        if (errAt !== -1) {
          toast.error("Assistant error", {
            description: text.slice(errAt + CHAT_ERROR_MARKER.length),
          });
          text = text.slice(0, errAt);
          break;
        }
        setStatus("streaming");
        setMessages([...history, { ...assistant, parts: [{ type: "text", text }] }]);
      }
      if (!text.trim()) {
        setMessages(history);
        setStatus("error");
        return;
      }
      setMessages([...history, { ...assistant, parts: [{ type: "text", text }] }]);
      setStatus("ready");
    } catch (err) {
      if (controller.signal.aborted) {
        setMessages(
          text ? [...history, { ...assistant, parts: [{ type: "text", text }] }] : history,
        );
        setStatus("ready");
        return;
      }
      console.error(err);
      toast.error("Couldn't reach the assistant", {
        description: "Check your connection and try again.",
      });
      setStatus("error");
    } finally {
      abortRef.current = null;
    }
  }, []);

  const submitText = (raw: string) => {
    const text = raw.trim();
    if (!text || status === "submitted" || status === "streaming") return;
    if (messages.length === 0) addActivity("chat", `Chat: ${text}`);
    void send([...messages, msg("user", text)]);
  };

  const handleSubmit = (m: PromptInputMessage) => submitText(m.text ?? "");

  const regenerate = () => {
    const lastUser = messages.map((m) => m.role).lastIndexOf("user");
    if (lastUser === -1) return;
    void send(messages.slice(0, lastUser + 1));
  };

  const newChat = () => {
    abortRef.current?.abort();
    setMessages([]);
    setStatus("ready");
    toast.success("Started a new chat");
  };

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Couldn't copy");
    }
  };

  const busy = status === "submitted" || status === "streaming";
  const lastAssistantId = [...messages].reverse().find((m) => m.role === "assistant")?.id;

  return (
    <div className="mx-auto flex h-[calc(100dvh-3.5rem-3rem)] w-full max-w-4xl flex-col px-4 pt-4 md:px-8">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <BrandLogo />
          <div>
            <h1 className="text-lg font-semibold text-foreground md:text-xl">AI Chatbot</h1>
            <p className="text-xs text-muted-foreground">
              Your workplace assistant · history saved in this browser
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={newChat}
          disabled={messages.length === 0 && !busy}
        >
          <MessageSquarePlus /> New chat
        </Button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border bg-card shadow-card">
        <Conversation className="min-h-0 flex-1">
          <ConversationContent className="gap-6 p-4 md:p-6">
            {messages.length === 0 && loaded && (
              <div className="flex flex-col items-center py-10 text-center animate-fade-up">
                <BrandLogo className="size-14 rounded-2xl [&_svg]:size-7" />
                <h2 className="mt-4 text-xl font-semibold text-foreground">
                  How can I help at work today?
                </h2>
                <p className="mt-1 max-w-md text-sm text-muted-foreground">
                  Ask me to draft, reword, plan or explain. Please don't share confidential or
                  personal information.
                </p>
              </div>
            )}
            {messages.map((m) => (
              <Message from={m.role} key={m.id}>
                <MessageContent className="group-[.is-user]:bg-primary group-[.is-user]:text-primary-foreground">
                  {m.role === "assistant" ? (
                    <MessageResponse
                      isAnimating={status === "streaming" && m.id === lastAssistantId}
                    >
                      {textOf(m)}
                    </MessageResponse>
                  ) : (
                    <p className="whitespace-pre-wrap">{textOf(m)}</p>
                  )}
                </MessageContent>
                {m.role === "assistant" && !(busy && m.id === lastAssistantId) && (
                  <MessageActions>
                    <MessageAction tooltip="Copy" label="Copy" onClick={() => copy(textOf(m))}>
                      <Copy className="size-3.5" />
                    </MessageAction>
                    {m.id === lastAssistantId && (
                      <MessageAction tooltip="Regenerate" label="Regenerate" onClick={regenerate}>
                        <RefreshCw className="size-3.5" />
                      </MessageAction>
                    )}
                  </MessageActions>
                )}
              </Message>
            ))}
            {status === "submitted" && (
              <Message from="assistant">
                <MessageContent>
                  <Shimmer>Thinking…</Shimmer>
                </MessageContent>
              </Message>
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        <div className="space-y-3 border-t bg-muted/40 p-3 md:p-4">
          {messages.length === 0 && (
            <Suggestions>
              {SUGGESTIONS.map((s) => (
                <Suggestion key={s} suggestion={s} onClick={submitText} className="bg-card" />
              ))}
            </Suggestions>
          )}
          <PromptInput onSubmit={handleSubmit} className="bg-card">
            <PromptInputTextarea
              ref={inputRef}
              placeholder="Ask your workplace assistant…"
              autoFocus
            />
            <PromptInputFooter className="justify-end">
              <PromptInputSubmit
                status={busy ? status : "ready"}
                onStop={() => abortRef.current?.abort()}
              />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>
    </div>
  );
}
