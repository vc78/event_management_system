package com.ems.event_management_system.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "poll_responses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PollResponse extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "poll_id", nullable = false)
    private Long pollId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "selected_option", nullable = false)
    private String selectedOption;
}
