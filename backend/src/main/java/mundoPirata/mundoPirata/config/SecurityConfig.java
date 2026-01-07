package mundoPirata.mundoPirata.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final CustomUserDetailsService userDetailsService;
    private final JwtAuthenticationFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authenticationProvider(authenticationProvider())
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
            .authorizeHttpRequests(auth -> auth
                // Swagger UI
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/swagger-ui.html").permitAll()
                // Endpoints públicos
                .requestMatchers("/api/auth/**", "/api/users/register").permitAll()
                .requestMatchers("/api/news/public/**").permitAll()
                .requestMatchers("/api/news-types/**").permitAll()
                .requestMatchers("/api/event-types/**").permitAll()
                .requestMatchers("/api/calendar/public/**").permitAll()
                .requestMatchers("/api/map-locations/public/**").permitAll()
                .requestMatchers("/api/tickets/public/**").permitAll()
                .requestMatchers("/api/donations/public/**").permitAll()
                .requestMatchers("/api/destinations/public/**").permitAll()
                .requestMatchers("/api/payments/webhook").permitAll()
                .requestMatchers("/api/checkout-pro/**").permitAll()
                .requestMatchers("/api/orders/process-purchase").permitAll()
                .requestMatchers("/api/test/**").permitAll()
                // Endpoints que requieren autenticación
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/users/**").hasAnyRole("ADMIN", "USER")
                .requestMatchers("/api/news/**").hasRole("ADMIN")
                .requestMatchers("/api/calendar/**").hasRole("ADMIN")
                .requestMatchers("/api/map-locations/**").hasRole("ADMIN")
                .requestMatchers("/api/tickets/**").hasRole("ADMIN")
                .requestMatchers("/api/orders/**").hasRole("ADMIN")
                // Donaciones: crear y procesar donaciones para usuarios autenticados, gestión solo para admin
                .requestMatchers("/api/donations", "/api/donations/process-donation").hasAnyRole("ADMIN", "USER")
                .requestMatchers("/api/donations/**").hasRole("ADMIN")
                // Destinos: ver destinos públicos sin auth, gestión solo para admin
                .requestMatchers("/api/destinations/**").hasRole("ADMIN")
                .requestMatchers("/api/payments/**").hasAnyRole("ADMIN", "USER")
                .anyRequest().authenticated()
            );

        return http.build();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
} 