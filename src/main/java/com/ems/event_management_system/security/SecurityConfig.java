package com.ems.event_management_system.security;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Configuration
@RequiredArgsConstructor
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final CustomUserDetailsService userDetailsService;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // Return a clean 401 JSON body for missing/invalid/expired tokens,
                // instead of Spring Security's default 403. The frontend's axios
                // interceptor specifically listens for 401 to clear the session
                // and redirect to /login.
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.setContentType("application/json");
                            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            response.getWriter().write("{\"message\":\"Unauthorized\"}");
                        })
                )

                .authorizeHttpRequests(auth -> auth
                        // ── Auth endpoints ─────────────────────────────────────────────
                        .requestMatchers("/api/auth/login", "/api/auth/register").permitAll()
                        .requestMatchers("/api/auth/**").authenticated()

                        // ── Public GET browsing: events, categories, venues ─────────────
                        // NOTE: /api/bookings/** intentionally NOT in this permitAll block —
                        // booking data is private (see matchers below).
                        .requestMatchers(HttpMethod.GET,
                                "/api/categories/**",
                                "/api/venues/**",
                                "/api/events/**"
                        ).permitAll()

                        // ── D01: Mutation of events/venues/categories → ADMIN or ORGANIZER
                        // These MUST sit before anyRequest().authenticated() or they are dead code.
                        .requestMatchers(HttpMethod.POST,
                                "/api/events/**", "/api/venues/**", "/api/categories/**")
                                .hasAnyRole("ADMIN", "ORGANIZER")
                        .requestMatchers(HttpMethod.PUT,
                                "/api/events/**", "/api/venues/**", "/api/categories/**")
                                .hasAnyRole("ADMIN", "ORGANIZER")
                        .requestMatchers(HttpMethod.DELETE,
                                "/api/events/**", "/api/venues/**", "/api/categories/**")
                                .hasAnyRole("ADMIN", "ORGANIZER")

                        // ── D02a: Booking read-access rules ────────────────────────────
                        // List ALL bookings or bookings by event = business intelligence → admin/org only
                        .requestMatchers(HttpMethod.GET, "/api/bookings", "/api/bookings/event/**")
                                .hasAnyRole("ADMIN", "ORGANIZER")
                        // A user's own booking list or a single booking → must be logged in;
                        // ownership check (does this userId match the JWT principal?) happens in
                        // BookingServiceImpl (D02b) — Spring Security path matching alone cannot
                        // compare a URL path segment to the authenticated user's id.
                        .requestMatchers(HttpMethod.GET, "/api/bookings/user/**", "/api/bookings/{id}")
                                .authenticated()

                        // ── D03 CONFIRM: Admin-only routes — declared BEFORE anyRequest() ─
                        // (This was previously correct; verified it still appears here after
                        // the D01/D02 additions above — matcher order is load-bearing.)
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")

                        // ── Razorpay Payment integration ──────────────────────────────
                        // Webhook is called directly by Razorpay (no JWT auth needed)
                        .requestMatchers(HttpMethod.POST, "/api/payments/webhook").permitAll()
                        // Order creation and verification require user authentication
                        .requestMatchers(HttpMethod.POST, "/api/payments/create-order", "/api/payments/verify").authenticated()

                        // ── Cancel a booking: must be logged in (ownership checked in service)
                        .requestMatchers(HttpMethod.PUT, "/api/bookings/cancel/**").authenticated()

                        // ── Check-in a booking: must be ADMIN or ORGANIZER
                        .requestMatchers(HttpMethod.PUT, "/api/bookings/*/check-in").hasAnyRole("ADMIN", "ORGANIZER")

                        // ── WebSocket/SockJS endpoints used by the frontend realtime layer ─
                        .requestMatchers("/ws/**").permitAll()

                        // ── Everything else requires a valid JWT ────────────────────────
                        .anyRequest().authenticated()
                )
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(List.of("http://localhost:*", "http://127.0.0.1:*"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        source.registerCorsConfiguration("/ws/**", config);
        source.registerCorsConfiguration("/ws", config);
        return source;
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}