# Event Management System (EMS) — Technical Viva Questions & Answers

This document contains a comprehensive bank of technical viva/interview questions along with detailed explanations, tailored specifically to the codebase, architectures, and design patterns used in the Event Management System.

---

## 📖 Table of Contents
1. [Architecture & Full-Stack Design](#1-architecture--full-stack-design)
2. [Backend, Security & JWT](#2-backend-security--jwt)
3. [Spring Data JPA & Database Schema](#3-spring-data-jpa--database-schema)
4. [WebSockets & Real-Time Events](#4-websockets--real-time-events)
5. [Frontend (React, Vite, Routing, State)](#5-frontend-react-vite-routing-state)
6. [Project-Specific Domain Logic](#6-project-specific-domain-logic)

---

## 1. Architecture & Full-Stack Design

### Q1.1: Describe the high-level architecture of your project.
*   **Answer**: The system uses a **decoupled Client-Server Architecture**.
    *   **Frontend**: React (Vite-powered SPA) handles the rendering, routing, state management, and real-time STOMP socket subscription.
    *   **Backend**: Spring Boot 3 provides a RESTful API and WebSocket messaging broker.
    *   **Database**: MySQL stores relational entities with JPA/Hibernate acting as the ORM layer.
    *   **Authentication**: Security is stateless, validated via JSON Web Tokens (JWT) passed in the HTTP headers or socket connection handshake.

### Q1.2: Why did you choose Vite over Create React App (CRA)?
*   **Answer**: Vite uses **esbuild** (written in Go) to pre-bundle dependencies, which is significantly faster (10-100x) than Webpack-based CRA. For development, Vite serves source code over native ES Modules, meaning it loads pages instantly regardless of the project's size, and has faster Hot Module Replacement (HMR).

### Q1.3: How does the communication happen between your React client and Spring Boot server?
*   **Answer**: Communication happens in two ways:
    1.  **Stateless HTTP REST Endpoints**: For CRUD operations, login, registration, and bookings. React calls endpoints using **Axios**.
    2.  **Stateful WebSocket Broker**: For real-time updates (seat count, booking statuses, admin stats). React uses **SockJS** and **STOMP** client to subscribe to topics like `/topic/events` and `/topic/admin/dashboard`.

---

## 2. Backend, Security & JWT

### Q2.1: How is Spring Security configured in this application?
*   **Answer**: We configure Spring Security statelessly using a Custom Filter Chain in `SecurityConfig`. 
    *   We disable CSRF because JWTs are stored client-side and not in browser cookies (which are vulnerable to CSRF).
    *   We set `SessionCreationPolicy.STATELESS` since we don't use server-side HTTP sessions (`HttpSession`).
    *   We add a custom `JwtAuthenticationFilter` before the standard `UsernamePasswordAuthenticationFilter`.

### Q2.2: How does your `JwtAuthenticationFilter` process a request?
*   **Answer**: 
    1.  It intercepts incoming HTTP requests and looks for the `Authorization` header.
    2.  If the header starts with `"Bearer "`, it extracts the token.
    3.  It calls `JwtService` to extract the username (email) and validate the signature/expiration.
    4.  If valid and no security context is set, it loads `UserDetails` via `CustomUserDetailsService`.
    5.  It constructs a `UsernamePasswordAuthenticationToken` and sets it in the `SecurityContextHolder`.

### Q2.3: How are roles configured, and how does role authorization work on REST endpoints?
*   **Answer**: 
    *   Roles are stored as entities (`Role`) mapping to an enum `RoleName` (`ADMIN`, `ORGANIZER`, `USER`).
    *   In `User.java`, `getAuthorities()` maps the roles to `ROLE_ADMIN`, `ROLE_ORGANIZER`, etc.
    *   In `SecurityConfig.java`, path matchers restrict endpoint methods:
        *   `hasAnyRole("ADMIN", "ORGANIZER")` restricts mutations (POST/PUT/DELETE on events/venues).
        *   `hasRole("ADMIN")` restricts `/api/admin/**`.

### Q2.4: How do you handle expired or invalid JWT tokens on both the backend and frontend?
*   **Answer**:
    *   **Backend**: `SecurityConfig` defines a custom `AuthenticationEntryPoint` that sends an HTTP 401 (Unauthorized) status and a JSON body `{"message":"Unauthorized"}` instead of Spring's default HTML/403 page.
    *   **Frontend**: An Axios interceptor checks response errors. If it catches a 401 response, it clears local storage (`ems_token`, `ems_user`) and redirects the window to `/login`.

---

## 3. Spring Data JPA & Database Schema

### Q3.1: How is the database schema synchronized with your Java classes?
*   **Answer**: We use Hibernate's Object-Relational Mapping (ORM). The models are annotated with `@Entity` and `@Table`. In `application.properties`, `spring.jpa.hibernate.ddl-auto=update` is configured to automatically synchronize the schema during local development, but we also maintain `schema_seed.sql` for structured initialization.

### Q3.2: Explain the relationship between User, Role, Event, and Booking.
*   **Answer**:
    *   `User` has a `@ManyToMany` relationship with `Role` through the join table `user_roles`.
    *   `Event` has a `@ManyToOne` relationship with `Category` and `Venue`.
    *   `Event` also has a `@ManyToOne` relationship with `User` (the organizer).
    *   `Booking` has `@ManyToOne` relationships with `User` (who booked) and `Event` (the booked event).

### Q3.3: How does the seat decrement logic prevent oversells or negative available seats?
*   **Answer**: 
    *   **Database Constraints**: The `events` table has a check constraint: `CONSTRAINT chk_event_seats CHECK (available_seats >= 0 AND available_seats <= total_seats)`.
    *   **Backend Logic**: Inside `BookingServiceImpl.java`, seat availability is checked before saving. If the seats requested exceed `availableSeats`, it throws an exception.
    *   The database update reduces the `available_seats` column, and transaction failure rolls back the seat allocation if the booking fails.

---

## 4. WebSockets & Real-Time Events

### Q4.1: Explain your WebSocket messaging setup.
*   **Answer**: We use Spring's WebSocket broker enabled via `@EnableWebSocketMessageBroker`.
    *   In `WebSocketConfig`, we configure `/topic` as the message broker prefix and `/app` for incoming application-destination messages.
    *   The WebSocket endpoint is registered at `/ws` with SockJS fallback support.
    *   We also write a Channel Interceptor (`configureClientInboundChannel`) to authenticate client connections by verifying the JWT token passed in the connection header when first connecting to the socket.

### Q4.2: What is the "Phase A6 — Transactional Events" problem, and how did you solve it?
*   **Answer**:
    *   **Problem**: If we broadcast a booking update to the WebSocket broker *during* a `@Transactional` service execution, the WebSocket message is sent immediately. However, if the database transaction fails and rolls back right after the broadcast, clients will have already received a stale/incorrect status update (e.g. they see seats decremented when they actually weren't).
    *   **Solution**: We decouple the broadcast. Instead of broadcasting directly from the service, we publish domain events (e.g. `BookingCommittedEvent`) using Spring's `ApplicationEventPublisher`. We then intercept these events using `@TransactionalEventListener` with `phase = TransactionPhase.AFTER_COMMIT`. This guarantees the WebSocket message is sent **only** after the transaction successfully commits to the database.

---

## 5. Frontend (React, Vite, Routing, State)

### Q5.1: How do you handle protected routing in your React application?
*   **Answer**: We use custom wrapper components:
    *   `ProtectedRoute`: Reads the authentication state from `useAuth()`. If authenticated, it renders the child routes via `<Outlet />`. Otherwise, it redirects to `/login`.
    *   `RoleProtectedRoute`: Takes an array of `allowedRoles` (e.g., `['ADMIN', 'ORGANIZER']`). If the user's role is not included in the list, it redirects them to `/dashboard` (index) or unauthorized message, preserving security on the client side.

### Q5.2: What is the purpose of the `RootLanding` component at route `/`?
*   **Answer**: It acts as a router dispatcher. It checks the logged-in user's role:
    *   If not authenticated, it redirects to `/register`.
    *   If authenticated, it redirects to `/dashboard` which handles role-based panel rendering.
    *   It uses a fallback to `localStorage` to prevent race conditions during React batch state updates when navigating immediately after authentication.

### Q5.3: How does your React frontend manage socket subscriptions?
*   **Answer**: We implement a Singleton client wrapper (`SocketService` in `socket.js`) using `@stomp/stompjs` and `sockjs-client`.
    *   It establishes a connection using the JWT token stored in `localStorage`.
    *   It maintains a subscriber map (`Map<topic, callbacks[]>`).
    *   Components subscribe to topics (like `/topic/events` or `/topic/admin/dashboard`) during mount and receive an unsubscribe teardown function to clean up when the component unmounts.

---

## 6. Project-Specific Domain Logic

### Q6.1: How does the Referral & Affiliate Commission system work?
*   **Answer**:
    *   Users can generate a unique referral link containing a code.
    *   When someone clicks the link, the frontend calls `PUT /api/referrals/click/{code}` to increment the click counter in the database.
    *   If a booking is completed via that link, the system calls `PUT /api/referrals/convert/{code}` passing the ticket price.
    *   The backend increments the conversions counter and calculates a 10% commission rate on the ticket price, adding it to the referrer's `commission_earned` balance.

### Q6.2: How is booking check-in verified?
*   **Answer**:
    *   Each booking has a unique, secure `tokenId` generated at creation time.
    *   In the **Check-In Console** page, an administrator/organizer can search for attendees by their token ID.
    *   The server endpoint `PUT /api/bookings/{id}/check-in` updates `checked_in = true` and logs the current `check_in_time`.

### Q6.3: How are live session Polls and Q&As managed?
*   **Answer**:
    *   Organizers can create polls for an event (`SessionPoll`). Active polls are broadcasted/made queryable. Attendees vote, creating a `PollResponse`. The server blocks duplicate voting via `existsByPollIdAndUserId`.
    *   Attendees submit questions in `SessionQna`. Other attendees can upvote questions. The Q&A endpoint returns questions ordered by the upvote count (`findByEventIdOrderByUpvotesDesc`) so organizers see popular questions first.
