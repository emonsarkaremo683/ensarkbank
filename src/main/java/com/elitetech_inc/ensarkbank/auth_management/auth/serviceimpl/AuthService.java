package com.elitetech_inc.ensarkbank.auth_management.auth.serviceimpl;

import com.elitetech_inc.ensarkbank.auth_management.auth.dto.request.ForgetPasswordRequest;
import com.elitetech_inc.ensarkbank.auth_management.auth.dto.request.LoginRequest;
import com.elitetech_inc.ensarkbank.auth_management.auth.dto.request.ResetPasswordRequest;
import com.elitetech_inc.ensarkbank.auth_management.auth.dto.response.LoginResponse;
import com.elitetech_inc.ensarkbank.auth_management.auth.security.EmailConfig;
import com.elitetech_inc.ensarkbank.auth_management.auth.security.JwtUtil;
import com.elitetech_inc.ensarkbank.auth_management.user.entity.User;
import com.elitetech_inc.ensarkbank.auth_management.user.repository.UserRepository;
import com.elitetech_inc.ensarkbank.common.enums.DocumentType;
import com.elitetech_inc.ensarkbank.common.enums.Role;
import com.elitetech_inc.ensarkbank.customer_management.customer.dto.mapper.CustomerMapper;
import com.elitetech_inc.ensarkbank.customer_management.customer.dto.request.CustomerRequest;
import com.elitetech_inc.ensarkbank.customer_management.customer.dto.response.CustomerResponse;
import com.elitetech_inc.ensarkbank.customer_management.customer.entity.Customer;
import com.elitetech_inc.ensarkbank.customer_management.customer.repository.CustomerRepository;
import com.elitetech_inc.ensarkbank.customer_management.customer.service.CustomerService;
import com.elitetech_inc.ensarkbank.human_resource_management.employee.dto.mapper.EmployeeMapper;
import com.elitetech_inc.ensarkbank.human_resource_management.employee.dto.response.EmployeeResponse;
import com.elitetech_inc.ensarkbank.human_resource_management.employee.entity.Employee;
import com.elitetech_inc.ensarkbank.human_resource_management.employee.repository.EmployeeRepository;
import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final CustomerMapper customerMapper;
    private final EmployeeMapper staffMapper;
    private final CustomerRepository customerRepository;
    private final EmployeeRepository staffRepository;
    private final EmailConfig emailService;
    private final PasswordEncoder encoder;
    private final CustomerService customerService;


    /**
     * Authenticates a user and returns login information
     * along with a JWT token.
     *
     * @param lr Login request containing email and password
     * @return LoginResponse containing token and user details
     */
    public LoginResponse<?> login(LoginRequest lr) {
        User user = getUser(lr);
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole());

        if (user.getRole() == Role.CUSTOMER) {
            return toCustomerLogin(user, token);
        } else {
            return toStaffLogin(user, token);
        }
    }

    private User getUser(LoginRequest lr){
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            lr.getEmail(),
                            lr.getPassword()
                    )
            );
        } catch (AuthenticationException e) {
            throw new BadCredentialsException("Invalid email or password");
        }

        return userRepository.findByEmail(lr.getEmail()).orElseThrow();
    }

    private LoginResponse<CustomerResponse> toCustomerLogin(User u, String token){
        Customer c = customerRepository.findCustomerByUser_Id(u.getId()).orElseThrow(
                ()-> new UsernameNotFoundException("Customer data not found")
        );
        LoginResponse<CustomerResponse> cus = new LoginResponse<>();
        cus.setToken(token);
        cus.setTokenType("Bearer");
        cus.setUser(customerMapper.toResponse(c));

        return cus;
    }

    private LoginResponse<EmployeeResponse> toStaffLogin(User u, String token){
        Employee s = staffRepository.findEmployeeByUser_Id(u.getId()).orElseThrow(
                ()-> new UsernameNotFoundException("Staff data not found")
        );
        return LoginResponse.<EmployeeResponse>builder()
                .token(token)
                .tokenType("Bearer")
                .user(staffMapper.toResponse(s))
                .build();
    }

    // ── Send / resend verification email ─────────────────────────
    public void sendVerificationEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

        if (user.isActive()) {
            throw new RuntimeException("Account is already verified");
        }

        String token = jwtUtil.generateVerificationToken(user.getEmail());

        try {
            emailService.sendVerificationEmail(user.getEmail(), getName(user), token);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send verification email: " + e.getMessage());
        }
    }

    // ── Confirm verification link ─────────────────────────────────
    public void verifyEmail(String token) {

        if (!jwtUtil.isValidForPurpose(token, "EMAIL_VERIFICATION")) {
            throw new RuntimeException("Invalid or expired verification link");
        }

        String email = jwtUtil.getEmail(token);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.isActive()) {
            throw new RuntimeException("Account is already verified");
        }

        user.setActive(true);
        user.setEmailVerified(true);
        userRepository.save(user);
    }

    // ── Forgot password — send reset link ────────────────────────
    public void forgotPassword(ForgetPasswordRequest dto) {

        User user = userRepository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new RuntimeException(
                        "No account found with email: " + dto.getEmail()));

        String token = jwtUtil.generateResetToken(user.getEmail());

        try {
            emailService.sendPasswordResetEmail(user.getEmail(), getName(user), token);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send reset email: " + e.getMessage());
        }
    }

    // ── Reset password using token ────────────────────────────────
    public void resetPassword(ResetPasswordRequest dto) {

        if (!jwtUtil.isValidForPurpose(dto.getToken(), "PASSWORD_RESET")) {
            throw new RuntimeException("Invalid or expired reset link");
        }

        if (dto.getNewPassword() == null || dto.getNewPassword().length() < 4) {
            throw new RuntimeException("Password must be at least 8 characters");
        }

        String email = jwtUtil.getEmail(dto.getToken());

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setPassword(encoder.encode(dto.getNewPassword()));
        userRepository.save(user);
    }


    // ── Register new customer ────────────────────────────────
    public LoginResponse<CustomerResponse> register(CustomerRequest dto,
                                                    MultipartFile profile,
                                                    Map<DocumentType, MultipartFile> documents) {
        if (userRepository.findByEmail(dto.getEmail()).isPresent()) {
            throw new RuntimeException("Email already registered");
        }

        CustomerResponse crs = customerService.saveData(dto, profile, documents);

        String token = jwtUtil.generateToken(dto.getEmail(), Role.CUSTOMER);

        try {
            User user = userRepository.findByEmail(dto.getEmail()).orElseThrow();
            emailService.sendVerificationEmail(user.getEmail(), crs.getName(),
                    jwtUtil.generateVerificationToken(user.getEmail()));
        } catch (Exception e) {
            log.warn("Failed to send verification email after registration: {}", e.getMessage());
        }

        return LoginResponse.<CustomerResponse>builder()
                .token(token)
                .tokenType("Bearer")
                .user(crs)
                .build();
    }

    private String getName(User user) {
        if(user.getRole() == Role.CUSTOMER) {
            Customer c = customerRepository.findCustomerByUser_Id(user.getId()).orElseThrow();
            return c.getName();
        }
        Employee s = staffRepository.findEmployeeByUser_Id(user.getId()).orElseThrow();
        return s.getName();
    }

}
