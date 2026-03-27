# Code Review: `ais-server` and `ais-site`

This document contains a code review of both the backend (`ais-server`) and frontend (`ais-site`) directories, focusing on performance and best practices.

---

## 🚀 Backend (`ais-server`)

### Performance

1.  **RabbitMQ & Async Processing (`src/rmq.ts`)**
    *   **Issue:** The code for the RabbitMQ consumer (`src/rmq.ts`) is currently commented out. This means message batch insertion is disabled.
    *   **Impact:** Without message batching, database writes (like inserting chat messages) are handled synchronously on the main thread inside the WebSocket loop. This will significantly degrade the server's throughput and responsiveness under heavy load.
    *   **Recommendation:** Enable RabbitMQ and offload database writes.

2.  **Database Indexing (`src/models/message-model.ts`)**
    *   **Issue:** The indexing on `MessageModel` is incorrect. The schema specifies `index({ roomId: 1, createdAt: -1 })`, but the actual field used to relate messages to channels is `channelId`, not `roomId`.
    *   **Impact:** This missing index will cause MongoDB to perform full collection scans whenever messages for a channel are queried. This is a major performance bottleneck that will worsen as the message table grows.
    *   **Recommendation:** Update the index definition to `MessageMongoSchema.index({ channelId: 1, createdAt: -1 })`.

3.  **Pagination in APIs (`src/routes/channel.ts`)**
    *   **Issue:** The `/:id/messages` and `/:id` endpoints fetch *all* messages for a channel without any limits (e.g., `MessageModel.find({ channelId: id })`).
    *   **Impact:** This will lead to slow API response times, high memory usage on the server, and large payload sizes over the network as chat history grows indefinitely.
    *   **Recommendation:** Implement pagination. Consider cursor-based pagination (using the `_id` field) for optimal performance in a chat application.

### Best Practices & Architecture

1.  **Consistency in Request Parsing**
    *   **Issue:** In `src/routes/auth.ts`, the `/register` endpoint uses `c.req.parseBody()` (which expects form data), while the `/login` endpoint uses `c.req.json()` (which expects a JSON body).
    *   **Recommendation:** Standardize on a single content type for API requests, typically JSON (`c.req.json()`) for modern web applications.

2.  **Hardcoded Secrets & Configurations**
    *   **Issue:** Several configurations are hardcoded instead of being injected via environment variables:
        *   CORS origin in `src/sockets.ts` is hardcoded to `http://localhost:5173` (with a `// TODO: CHANGE THIS!!!` comment).
        *   RabbitMQ connection strings in `src/utils.ts` and `src/rmq.ts` (`amqp://localhost`).
    *   **Recommendation:** Extract these values into environment variables (e.g., `Bun.env.CORS_ORIGIN`, `Bun.env.RABBITMQ_URL`) to allow different configurations for dev, staging, and production environments.

3.  **Error Handling in WebSocket Callbacks**
    *   **Issue:** In `src/sockets.ts` inside the `chat_message` event handler, if `MessageModel.create()` fails, it sends an immediate error callback. However, if the RabbitMQ batching approach is used (as intended in `src/utils.ts`), the database write happens asynchronously in the background.
    *   **Recommendation:** Design a robust acknowledgement pattern that handles asynchronous processing failures gracefully, perhaps using a separate event to notify clients of message delivery status.

4.  **Redundant API Endpoints**
    *   **Issue:** In `src/routes/channel.ts`, both the `/:id/messages` and `/:id` endpoints return the list of messages.
    *   **Recommendation:** To adhere to REST principles and minimize payload sizes, the `/:id` endpoint should likely only return channel metadata. Clients should fetch messages separately via the dedicated `/:id/messages` endpoint.

---

## 🎨 Frontend (`ais-site`)

### Performance

1.  **Excessive React Renders in Chat (`src/components/ChatArea.tsx`)**
    *   **Issue:** The `allMessages` variable uses `useMemo` to merge the initial `data?.messages` and the local `messages` state. Every time a new socket message arrives, the `messages` state updates, causing the entire component to re-render.
    *   **Impact:** Because the application is not using DOM virtualization, rendering thousands of message elements concurrently will eventually cause the UI thread to freeze.
    *   **Recommendation:** Implement a virtualized list (e.g., using `@tanstack/react-virtual`) to only render the message components that are currently visible in the viewport.

2.  **Hardcoded Socket URL**
    *   **Issue:** In `src/components/ChatArea.tsx`, the WebSocket connection URL is hardcoded as `ws://localhost:3000`.
    *   **Impact:** The application will fail to connect to the WebSocket server in production environments.
    *   **Recommendation:** Use an environment variable, similar to how `import.meta.env.VITE_API` is used for HTTP requests.

3.  **Missing Suspense / Loading States**
    *   **Issue:** TanStack Query is used for data fetching, but data loading states are handled manually using inline ternary operators (e.g., `isLoading ? ... : ...`).
    *   **Impact:** This can lead to layout shifts and a less cohesive user experience compared to using React Suspense boundaries, which allow for more declarative loading states and smoother transitions.

### Best Practices

1.  **Duplicate Socket Connections**
    *   **Issue:** The `useEffect` inside `ChatArea.tsx` establishes a brand new WebSocket connection whenever the `channelId` changes.
    *   **Recommendation:** Adopt a singleton pattern or use a global context/hook for the WebSocket connection. A single persistent connection should be established when the application loads, and components should emit or listen to events on that shared connection.

2.  **Date Processing During Render**
    *   **Issue:** Inside the `allMessages.map` rendering loop in `ChatArea.tsx`, `new Date()` is called multiple times per message on *every render* to determine if date separators should be shown and if messages are consecutive.
    *   **Impact:** This is computationally expensive and unnecessary during the render phase.
    *   **Recommendation:** Pre-process the `allMessages` array to group messages by day or add `showDateSeparator`/`isConsecutive` flags *before* passing the array to the render function.

3.  **Unreliable Typing Indicator State**
    *   **Issue:** In `ChatArea.tsx`, typing indicators are stored in a simple object state (`Record<string, string>`). This state is only updated when explicit `typing` socket events are received.
    *   **Impact:** If a user disconnects abruptly or a "stop typing" event is dropped due to network issues, the typing indicator will get stuck "on" indefinitely.
    *   **Recommendation:** Implement an auto-clear timeout mechanism. When a "start typing" event is received, set a timer (e.g., 3-5 seconds) that automatically removes the user from the `typingUsers` state if a subsequent "start typing" event is not received to refresh the timer.
