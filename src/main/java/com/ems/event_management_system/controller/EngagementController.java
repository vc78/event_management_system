package com.ems.event_management_system.controller;

import com.ems.event_management_system.entity.SessionPoll;
import com.ems.event_management_system.entity.PollResponse;
import com.ems.event_management_system.entity.SessionQna;
import com.ems.event_management_system.repository.SessionPollRepository;
import com.ems.event_management_system.repository.PollResponseRepository;
import com.ems.event_management_system.repository.SessionQnaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/engagement")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class EngagementController {

    private final SessionPollRepository sessionPollRepository;
    private final PollResponseRepository pollResponseRepository;
    private final SessionQnaRepository sessionQnaRepository;

    // --- POLLS ---
    @GetMapping("/polls/{eventId}")
    public ResponseEntity<List<SessionPoll>> getPollsByEvent(@PathVariable Long eventId) {
        return ResponseEntity.ok(sessionPollRepository.findByEventId(eventId));
    }

    @PostMapping("/polls")
    public ResponseEntity<SessionPoll> createPoll(@RequestBody SessionPoll poll) {
        poll.setIsActive(true);
        return new ResponseEntity<>(sessionPollRepository.save(poll), HttpStatus.CREATED);
    }

    @PostMapping("/polls/submit")
    public ResponseEntity<?> submitPollResponse(@RequestBody PollResponse response) {
        if (pollResponseRepository.existsByPollIdAndUserId(response.getPollId(), response.getUserId())) {
            return ResponseEntity.badRequest().body(Map.of("message", "You have already voted on this poll"));
        }
        return new ResponseEntity<>(pollResponseRepository.save(response), HttpStatus.CREATED);
    }

    @GetMapping("/polls/results/{pollId}")
    public ResponseEntity<List<PollResponse>> getPollResults(@PathVariable Long pollId) {
        return ResponseEntity.ok(pollResponseRepository.findByPollId(pollId));
    }

    @PutMapping("/polls/close/{pollId}")
    public ResponseEntity<?> closePoll(@PathVariable Long pollId) {
        SessionPoll poll = sessionPollRepository.findById(pollId)
                .orElseThrow(() -> new RuntimeException("Poll not found"));
        poll.setIsActive(false);
        sessionPollRepository.save(poll);
        return ResponseEntity.ok(Map.of("message", "Poll closed successfully"));
    }

    // --- Q&A ---
    @GetMapping("/qnas/{eventId}")
    public ResponseEntity<List<SessionQna>> getQnasByEvent(@PathVariable Long eventId) {
        return ResponseEntity.ok(sessionQnaRepository.findByEventIdOrderByUpvotesDesc(eventId));
    }

    @PostMapping("/qnas")
    public ResponseEntity<SessionQna> createQna(@RequestBody SessionQna qna) {
        qna.setUpvotes(0);
        qna.setIsAnswered(false);
        return new ResponseEntity<>(sessionQnaRepository.save(qna), HttpStatus.CREATED);
    }

    @PutMapping("/qnas/upvote/{qnaId}")
    public ResponseEntity<SessionQna> upvoteQna(@PathVariable Long qnaId) {
        SessionQna qna = sessionQnaRepository.findById(qnaId)
                .orElseThrow(() -> new RuntimeException("Question not found"));
        qna.setUpvotes(qna.getUpvotes() + 1);
        return ResponseEntity.ok(sessionQnaRepository.save(qna));
    }

    @PutMapping("/qnas/answer/{qnaId}")
    public ResponseEntity<SessionQna> answerQna(@PathVariable Long qnaId) {
        SessionQna qna = sessionQnaRepository.findById(qnaId)
                .orElseThrow(() -> new RuntimeException("Question not found"));
        qna.setIsAnswered(true);
        return ResponseEntity.ok(sessionQnaRepository.save(qna));
    }
}
