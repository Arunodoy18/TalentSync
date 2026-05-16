declare module "ai/react" {
  export type ChatMessage = {
    id: string;
    role: "system" | "user" | "assistant";
    content: string;
    createdAt?: Date;
  };

  export type UseChatOptions = {
    api?: string;
    initialMessages?: ChatMessage[];
  };

  export type UseChatReturn = {
    messages: ChatMessage[];
    input: string;
    handleInputChange: (event: import("react").ChangeEvent<HTMLTextAreaElement>) => void;
    handleSubmit: (event?: import("react").FormEvent<HTMLFormElement>) => void;
    append: (message: Omit<ChatMessage, "id"> & { id?: string }) => void;
    isLoading: boolean;
    error?: Error;
  };

  export function useChat(options?: UseChatOptions): UseChatReturn;
}
