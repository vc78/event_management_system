package com.ems.event_management_system.service;

import com.ems.event_management_system.dto.request.LoginRequest;
import com.ems.event_management_system.dto.request.RegisterRequest;
import com.ems.event_management_system.dto.response.AuthResponse;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);
}