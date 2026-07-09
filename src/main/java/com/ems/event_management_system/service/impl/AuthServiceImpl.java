package com.ems.event_management_system.service.impl;

import com.ems.event_management_system.dto.request.LoginRequest;
import com.ems.event_management_system.dto.request.RegisterRequest;
import com.ems.event_management_system.dto.response.AuthResponse;
import com.ems.event_management_system.entity.Role;
import com.ems.event_management_system.entity.User;
import com.ems.event_management_system.enums.RoleName;
import com.ems.event_management_system.exception.BadRequestException;
import com.ems.event_management_system.repository.RoleRepository;
import com.ems.event_management_system.repository.UserRepository;
import com.ems.event_management_system.security.JwtService;
import com.ems.event_management_system.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Set;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Override
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already exists");
        }

        Role userRole = roleRepository.findByName(RoleName.USER)
                .orElseThrow(() -> new RuntimeException("Default USER role not found"));

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phoneNumber(request.getPhoneNumber())
                .roles(Set.of(userRole))
                .build();

        User savedUser = userRepository.save(user);
        String token = jwtService.generateToken(savedUser);

        String roleName = savedUser.getRoles()
                .stream()
                .findFirst()
                .map(role -> role.getName().name())
                .orElse("USER");

        return AuthResponse.builder()
                .id(savedUser.getId())
                .token(token)
                .role(roleName)
                .email(savedUser.getEmail())
                .fullName(savedUser.getFullName())
                .build();
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("Invalid email or password"));

        String token = jwtService.generateToken(user);

        String roleName = user.getRoles()
                .stream()
                .findFirst()
                .map(role -> role.getName().name())
                .orElse("USER");

        return AuthResponse.builder()
                .id(user.getId())
                .token(token)
                .role(roleName)
                .email(user.getEmail())
                .fullName(user.getFullName())
                .build();
    }
}