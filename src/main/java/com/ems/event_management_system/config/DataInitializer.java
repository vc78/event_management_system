package com.ems.event_management_system.config;

import com.ems.event_management_system.entity.Role;
import com.ems.event_management_system.entity.User;
import com.ems.event_management_system.entity.SponsorBooth;
import com.ems.event_management_system.entity.ReferralLink;
import com.ems.event_management_system.enums.RoleName;
import com.ems.event_management_system.repository.RoleRepository;
import com.ems.event_management_system.repository.UserRepository;
import com.ems.event_management_system.repository.SponsorBoothRepository;
import com.ems.event_management_system.repository.ReferralLinkRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final SponsorBoothRepository sponsorBoothRepository;
    private final ReferralLinkRepository referralLinkRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // Ensure roles are seeded
        Role adminRole = createRoleIfNotExists(RoleName.ADMIN);
        Role organizerRole = createRoleIfNotExists(RoleName.ORGANIZER);
        Role userRole = createRoleIfNotExists(RoleName.USER);

        // Seed Admin user
        User admin = userRepository.findByEmail("admin@ems.com").orElse(null);
        if (admin == null) {
            userRepository.save(
                    User.builder()
                            .fullName("System Admin")
                            .email("admin@ems.com")
                            .password(passwordEncoder.encode("admin"))
                            .phoneNumber("1234567890")
                            .roles(Set.of(adminRole))
                            .build()
            );
        } else {
            // Force reset password to ensure BCrypt encoding matches "admin"
            admin.setPassword(passwordEncoder.encode("admin"));
            admin.setRoles(Set.of(adminRole));
            userRepository.save(admin);
        }

        // Seed Organizer user
        User organizer = userRepository.findByEmail("organizer@ems.com").orElse(null);
        if (organizer == null) {
            userRepository.save(
                    User.builder()
                            .fullName("Event Organizer")
                            .email("organizer@ems.com")
                            .password(passwordEncoder.encode("organizer"))
                            .phoneNumber("1234567891")
                            .roles(Set.of(organizerRole))
                            .build()
            );
        } else {
            // Force reset password to ensure BCrypt encoding matches "organizer"
            organizer.setPassword(passwordEncoder.encode("organizer"));
            organizer.setRoles(Set.of(organizerRole));
            userRepository.save(organizer);
        }

        // Seed standard User
        User standardUser = userRepository.findByEmail("user@ems.com").orElse(null);
        if (standardUser == null) {
            userRepository.save(
                    User.builder()
                            .fullName("Jane Doe")
                            .email("user@ems.com")
                            .password(passwordEncoder.encode("user"))
                            .phoneNumber("1234567892")
                            .roles(Set.of(userRole))
                            .build()
            );
        } else {
            // Force reset password to ensure BCrypt encoding matches "user"
            standardUser.setPassword(passwordEncoder.encode("user"));
            standardUser.setRoles(Set.of(userRole));
            userRepository.save(standardUser);
        }

        // Seed Sponsor Booths
        if (sponsorBoothRepository.count() == 0) {
            sponsorBoothRepository.save(
                    SponsorBooth.builder()
                            .sponsorName("Google Cloud Platform")
                            .boothNumber("A-10")
                            .tier("PLATINUM")
                            .leadCount(148)
                            .boothTraffic(840)
                            .build()
            );
            sponsorBoothRepository.save(
                    SponsorBooth.builder()
                            .sponsorName("JetBrains IntelliJ")
                            .boothNumber("B-04")
                            .tier("GOLD")
                            .leadCount(89)
                            .boothTraffic(520)
                            .build()
            );
            sponsorBoothRepository.save(
                    SponsorBooth.builder()
                            .sponsorName("Github Copilot")
                            .boothNumber("C-12")
                            .tier("SILVER")
                            .leadCount(42)
                            .boothTraffic(290)
                            .build()
            );
        }

        // Seed Referral Links
        if (referralLinkRepository.count() == 0 && standardUser != null) {
            referralLinkRepository.save(
                    ReferralLink.builder()
                            .referrerId(standardUser.getId())
                            .referralCode("SAVE10")
                            .clicks(154)
                            .conversions(28)
                            .commissionEarned(new BigDecimal("5600.00"))
                            .build()
            );
            referralLinkRepository.save(
                    ReferralLink.builder()
                            .referrerId(standardUser.getId())
                            .referralCode("CONF2026")
                            .clicks(89)
                            .conversions(12)
                            .commissionEarned(new BigDecimal("2400.00"))
                            .build()
            );
        }
    }

    private Role createRoleIfNotExists(RoleName roleName) {
        return roleRepository.findByName(roleName)
                .orElseGet(() -> roleRepository.save(
                        Role.builder()
                                .name(roleName)
                                .build()
                ));
    }
}