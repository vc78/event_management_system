package com.ems.event_management_system.controller;

import com.ems.event_management_system.entity.SessionPoll;
import com.ems.event_management_system.entity.PollResponse;
import com.ems.event_management_system.entity.SessionQna;
import com.ems.event_management_system.entity.SentimentWord;
import com.ems.event_management_system.repository.SessionPollRepository;
import com.ems.event_management_system.repository.PollResponseRepository;
import com.ems.event_management_system.repository.SessionQnaRepository;
import com.ems.event_management_system.repository.SentimentWordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
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
    private final SentimentWordRepository sentimentWordRepository;
    private final SimpMessagingTemplate messagingTemplate;

    // --- POLLS ---
    @GetMapping("/polls/{eventId}")
    public ResponseEntity<List<SessionPoll>> getPollsByEvent(@PathVariable Long eventId) {
        return ResponseEntity.ok(sessionPollRepository.findByEventId(eventId));
    }

    @PostMapping("/polls")
    public ResponseEntity<SessionPoll> createPoll(@RequestBody SessionPoll poll) {
        poll.setIsActive(true);
        SessionPoll saved = sessionPollRepository.save(poll);
        // Broadcast new poll
        messagingTemplate.convertAndSend("/topic/engagement/" + saved.getEventId() + "/polls", saved);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @PostMapping("/polls/submit")
    public ResponseEntity<?> submitPollResponse(@RequestBody PollResponse response) {
        if (pollResponseRepository.existsByPollIdAndUserId(response.getPollId(), response.getUserId())) {
            return ResponseEntity.badRequest().body(Map.of("message", "You have already voted on this poll"));
        }
        PollResponse saved = pollResponseRepository.save(response);
        
        // Find event ID to broadcast results
        SessionPoll poll = sessionPollRepository.findById(saved.getPollId())
                .orElseThrow(() -> new RuntimeException("Poll not found"));
        
        // Broadcast that poll results updated
        messagingTemplate.convertAndSend("/topic/engagement/" + poll.getEventId() + "/polls", poll);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
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
        // Broadcast closed poll
        messagingTemplate.convertAndSend("/topic/engagement/" + poll.getEventId() + "/polls", poll);
        return ResponseEntity.ok(Map.of("message", "Poll closed successfully"));
    }

    // --- Q&A ---
    @GetMapping("/qnas/{eventId}")
    public ResponseEntity<List<SessionQna>> getQnasByEvent(@PathVariable Long eventId) {
        return ResponseEntity.ok(sessionQnaRepository.findByEventIdOrderByIsPinnedDescUpvotesDesc(eventId));
    }

    @PostMapping("/qnas")
    public ResponseEntity<SessionQna> createQna(@RequestBody SessionQna qna) {
        qna.setUpvotes(0);
        qna.setIsAnswered(false);
        qna.setIsPinned(false);
        SessionQna saved = sessionQnaRepository.save(qna);
        // Broadcast new Q&A
        messagingTemplate.convertAndSend("/topic/engagement/" + saved.getEventId() + "/qnas", saved);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @PutMapping("/qnas/upvote/{qnaId}")
    public ResponseEntity<SessionQna> upvoteQna(@PathVariable Long qnaId) {
        SessionQna qna = sessionQnaRepository.findById(qnaId)
                .orElseThrow(() -> new RuntimeException("Question not found"));
        qna.setUpvotes(qna.getUpvotes() + 1);
        SessionQna saved = sessionQnaRepository.save(qna);
        // Broadcast updated upvotes
        messagingTemplate.convertAndSend("/topic/engagement/" + saved.getEventId() + "/qnas", saved);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/qnas/answer/{qnaId}")
    public ResponseEntity<SessionQna> answerQna(@PathVariable Long qnaId) {
        SessionQna qna = sessionQnaRepository.findById(qnaId)
                .orElseThrow(() -> new RuntimeException("Question not found"));
        qna.setIsAnswered(true);
        SessionQna saved = sessionQnaRepository.save(qna);
        // Broadcast answered Q&A
        messagingTemplate.convertAndSend("/topic/engagement/" + saved.getEventId() + "/qnas", saved);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/qnas/pin/{qnaId}")
    public ResponseEntity<SessionQna> pinQna(@PathVariable Long qnaId) {
        SessionQna qna = sessionQnaRepository.findById(qnaId)
                .orElseThrow(() -> new RuntimeException("Question not found"));
        qna.setIsPinned(!qna.getIsPinned());
        SessionQna saved = sessionQnaRepository.save(qna);
        // Broadcast pinned Q&A
        messagingTemplate.convertAndSend("/topic/engagement/" + saved.getEventId() + "/qnas", saved);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/qnas/{qnaId}")
    public ResponseEntity<?> deleteQna(@PathVariable Long qnaId) {
        SessionQna qna = sessionQnaRepository.findById(qnaId)
                .orElseThrow(() -> new RuntimeException("Question not found"));
        sessionQnaRepository.delete(qna);
        // Broadcast deletion event
        messagingTemplate.convertAndSend("/topic/engagement/" + qna.getEventId() + "/qnas", Map.of("deletedId", qnaId));
        return ResponseEntity.ok(Map.of("message", "Question deleted successfully"));
    }

    // --- WORD CLOUD ---
    @GetMapping("/words/{eventId}")
    public ResponseEntity<List<Map<String, Object>>> getWordCloud(@PathVariable Long eventId) {
        return ResponseEntity.ok(sentimentWordRepository.countWordsByEventId(eventId));
    }

    @PostMapping("/words")
    public ResponseEntity<?> submitWord(@RequestBody SentimentWord wordObj) {
        String word = wordObj.getWord();
        if (word == null || word.trim().length() > 15 || word.trim().contains(" ")) {
            return ResponseEntity.badRequest().body(Map.of("message", "Word must be non-empty, single word (no spaces) under 15 characters."));
        }
        wordObj.setWord(word.trim());
        wordObj.setSubmittedAt(LocalDateTime.now());
        sentimentWordRepository.save(wordObj);

        // Aggregate and broadcast word cloud
        List<Map<String, Object>> aggregated = sentimentWordRepository.countWordsByEventId(wordObj.getEventId());
        messagingTemplate.convertAndSend("/topic/engagement/" + wordObj.getEventId() + "/words", aggregated);

        return ResponseEntity.ok(aggregated);
    }
}
