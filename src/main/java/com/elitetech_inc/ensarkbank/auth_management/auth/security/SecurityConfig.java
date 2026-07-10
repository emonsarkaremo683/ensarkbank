package com.elitetech_inc.ensarkbank.auth_management.auth.security;


import com.elitetech_inc.ensarkbank.auth_management.auth.serviceimpl.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.http.HttpMethod;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final CustomUserDetails userDetailsService;


    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                .cors(cors -> cors.configurationSource(request -> {
                    var corsConfiguration = new org.springframework.web.cors.CorsConfiguration();
                    corsConfiguration.setAllowedOrigins(java.util.List.of("http://localhost:4200"));
                    corsConfiguration.setAllowedMethods(java.util.List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
                    corsConfiguration.setAllowedHeaders(java.util.List.of("*"));
                    corsConfiguration.setAllowCredentials(true);
                    return corsConfiguration;
                }))
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth

                        // ── Public endpoints (no token needed) ────────────
                        .requestMatchers(
                                "/api/auth/**"
                        ).permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/customer/").permitAll()

                        // ── Address master data (admin only) ─────────────
                        .requestMatchers(
                                "/api/division/**",
                                "/api/district/**",
                                "/api/policestation/**"
                        ).hasAnyRole("ADMIN", "SUPER_ADMIN")

                        // ── Branch management ────────────────────────────
                        .requestMatchers(
                                "/api/branches/**"
                        ).hasAnyRole("BRANCH_MANAGER", "ADMIN", "SUPER_ADMIN")

                        // ── Employee management ──────────────────────────
                        .requestMatchers(
                                "/api/employee/**"
                        ).hasAnyRole("BRANCH_MANAGER", "ADMIN", "SUPER_ADMIN")

                        // ── Customer management ──────────────────────────
                        .requestMatchers(
                                "/api/customer/**"
                        ).hasAnyRole("CUSTOMER_SERVICE", "CASHIER", "BRANCH_MANAGER", "ADMIN", "SUPER_ADMIN")

                        // ── Accounts ─────────────────────────────────────
                        .requestMatchers(
                                "/api/account/**"
                        ).hasAnyRole("ACCOUNTANT", "CASHIER", "BRANCH_MANAGER", "ADMIN", "SUPER_ADMIN")

                        // ── Transactions ─────────────────────────────────
                        .requestMatchers(
                                "/api/account-transaction/**",
                                "/api/cashier-transactions/**"
                        ).hasAnyRole("ACCOUNTANT", "CASHIER", "BRANCH_MANAGER", "ADMIN", "SUPER_ADMIN")

                        // ── Loans ────────────────────────────────────────
                        .requestMatchers(
                                "/api/loans/**"
                        ).hasAnyRole("LOAN_OFFICER", "BRANCH_MANAGER", "ADMIN", "SUPER_ADMIN")

                        // ── Cards ────────────────────────────────────────
                        .requestMatchers(
                                "/api/card/**"
                        ).hasAnyRole("CASHIER", "BRANCH_MANAGER", "ADMIN", "SUPER_ADMIN")

                        // ── ATMs ─────────────────────────────────────────
                        .requestMatchers(
                                "/api/atm/**",
                                "/api/atm-transactions/**"
                        ).hasAnyRole("ATM_MANAGER", "ADMIN", "SUPER_ADMIN")

                        // ── Reports & history ────────────────────────────
                        .requestMatchers(
                                "/api/reports/**",
                                "/api/history/**"
                        ).hasAnyRole("ACCOUNTANT", "AUDITOR", "BRANCH_MANAGER", "ADMIN", "SUPER_ADMIN")

                        // ── Beneficiaries ────────────────────────────────
                        .requestMatchers(
                                "/api/beneficiary/**"
                        ).hasAnyRole("CASHIER", "CUSTOMER_SERVICE", "BRANCH_MANAGER", "ADMIN", "SUPER_ADMIN")

                        // ── All other requests require authentication ────
                        .anyRequest().authenticated()


                )
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthFilter,
                        UsernamePasswordAuthenticationFilter.class);

        return http.build();


    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(userDetailsService);

        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

}