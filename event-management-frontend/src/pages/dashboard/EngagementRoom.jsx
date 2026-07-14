import { useEffect, useState, useMemo } from 'react';
import useAuth from '../../hooks/useAuth.js';
import * as engagementApi from '../../api/engagementApi.js';
import * as eventApi from '../../api/eventApi.js';
import { useToast } from '../../hooks/useToast.js';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import { socketService } from '../../realtime/socket.js';
import { Send, ThumbsUp, Check, Play, Award, BarChart2 } from 'lucide-react';

export default function EngagementRoom() {
  const { user } = useAuth();
  const toast = useToast();
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [attendingCount, setAttendingCount] = useState(1);
  
  // Data lists
  const [polls, setPolls] = useState([]);
  const [qnas, setQnas] = useState([]);
  const [userVotedPolls, setUserVotedPolls] = useState(new Set());
  const [pollResults, setPollResults] = useState({}); // pollId -> { option: count }
  
  // Form states
  const [newQuestion, setNewQuestion] = useState('');
  const [newPollQuestion, setNewPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  
  // Word cloud states
  const [words, setWords] = useState([]);
  const [newWord, setNewWord] = useState('');

  // Fetch initial events
  useEffect(() => {
    eventApi.getEvents()
      .then(data => {
        setEvents(data);
        if (data.length > 0) {
          setSelectedEventId(data[0].id.toString());
        }
      })
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, []);

  const selectedEvent = useMemo(() => {
    return events.find(ev => ev.id.toString() === selectedEventId.toString());
  }, [events, selectedEventId]);

  // Fetch engagement telemetry for selected event
  const fetchEngagementData = async () => {
    if (!selectedEventId) return;
    try {
      const [p, q] = await Promise.all([
        engagementApi.getPolls(selectedEventId),
        engagementApi.getQnas(selectedEventId)
      ]);
      setPolls(p);
      setQnas(q);
      
      // Fetch results for all polls
      p.forEach(poll => fetchPollResults(poll.id));
    } catch (err) {
      toast.error('Failed to load engagement records');
    }
  };

  const fetchPollResults = async (pollId) => {
    try {
      const votes = await engagementApi.getPollResults(pollId);
      const counts = {};
      votes.forEach(v => {
        counts[v.selectedOption] = (counts[v.selectedOption] || 0) + 1;
      });
      setPollResults(prev => ({ ...prev, [pollId]: counts }));
    } catch (err) {}
  };

  // HLS stream support via dynamic script loading
  useEffect(() => {
    if (selectedEvent?.streamUrl && selectedEvent.streamUrl.endsWith('.m3u8')) {
      const video = document.getElementById('live-stream-player');
      if (video) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = selectedEvent.streamUrl;
        } else if (window.Hls) {
          const hls = new window.Hls();
          hls.loadSource(selectedEvent.streamUrl);
          hls.attachMedia(video);
        } else {
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
          script.onload = () => {
            if (window.Hls) {
              const hls = new window.Hls();
              hls.loadSource(selectedEvent.streamUrl);
              hls.attachMedia(video);
            }
          };
          document.body.appendChild(script);
        }
      }
    }
  }, [selectedEvent?.streamUrl]);

  // WebSockets Subscriptions
  useEffect(() => {
    if (!selectedEventId) return;

    fetchEngagementData();
    
    // Fetch initial word cloud
    engagementApi.getWordCloud(selectedEventId)
      .then(data => {
        const formatted = data.map(item => ({ text: item.text, value: Number(item.count) * 4 }));
        setWords(formatted);
      })
      .catch(() => {});

    // Subscribe to events via SocketService
    const unsubRoom = socketService.subscribe(`/topic/engagement/${selectedEventId}/room`, () => {});
    
    const unsubAttending = socketService.subscribe(`/topic/engagement/${selectedEventId}/attending`, (payload) => {
      if (payload && typeof payload.count === 'number') {
        setAttendingCount(payload.count > 0 ? payload.count : 1);
      }
    });

    const unsubPolls = socketService.subscribe(`/topic/engagement/${selectedEventId}/polls`, (updatedPoll) => {
      fetchPollResults(updatedPoll.id);
      setPolls(prev => {
        const idx = prev.findIndex(p => p.id === updatedPoll.id);
        if (idx !== -1) {
          const next = [...prev];
          next[idx] = updatedPoll;
          return next;
        }
        return [updatedPoll, ...prev];
      });
    });

    const unsubQnas = socketService.subscribe(`/topic/engagement/${selectedEventId}/qnas`, (payload) => {
      if (payload && payload.deletedId) {
        setQnas(prev => prev.filter(q => q.id !== payload.deletedId));
      } else {
        setQnas(prev => {
          const idx = prev.findIndex(q => q.id === payload.id);
          let nextList = [];
          if (idx !== -1) {
            const next = [...prev];
            next[idx] = payload;
            nextList = next;
          } else {
            nextList = [payload, ...prev];
          }
          return nextList.sort((a, b) => {
            if (a.isPinned !== b.isPinned) return b.isPinned ? -1 : 1;
            return b.upvotes - a.upvotes;
          });
        });
      }
    });

    const unsubWords = socketService.subscribe(`/topic/engagement/${selectedEventId}/words`, (aggregatedList) => {
      const formatted = aggregatedList.map(item => ({ text: item.text, value: Number(item.count) * 4 }));
      setWords(formatted);
    });

    return () => {
      unsubRoom();
      unsubAttending();
      unsubPolls();
      unsubQnas();
      unsubWords();
    };
  }, [selectedEventId]);

  // Submit Q&A Question
  const handleAskQuestion = async (e) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;
    try {
      setSubmitting(true);
      await engagementApi.createQna({
        eventId: selectedEventId,
        userId: user?.id || 1,
        questionText: newQuestion
      });
      setNewQuestion('');
      toast.success('Question posted to board');
    } catch (err) {
      toast.error('Failed to post question');
    } finally {
      setSubmitting(false);
    }
  };

  // Upvote Question
  const handleUpvote = async (qnaId) => {
    try {
      await engagementApi.upvoteQna(qnaId);
    } catch (err) {
      toast.error('Could not register vote');
    }
  };

  // Answer Question
  const handleAnswerQuestion = async (qnaId) => {
    try {
      await engagementApi.answerQna(qnaId);
      toast.success('Question marked as answered');
    } catch (err) {
      toast.error('Could not mark as answered');
    }
  };

  // Pin Question
  const handlePinQuestion = async (qnaId) => {
    try {
      await engagementApi.pinQna(qnaId);
      toast.success('Pin status toggled');
    } catch (err) {
      toast.error('Failed to toggle pin');
    }
  };

  // Delete Question
  const handleDeleteQuestion = async (qnaId) => {
    if (!window.confirm('Delete this question permanently?')) return;
    try {
      await engagementApi.deleteQna(qnaId);
      toast.success('Question removed');
    } catch (err) {
      toast.error('Failed to delete question');
    }
  };

  // Submit Poll Response
  const handleVotePoll = async (pollId, option) => {
    if (userVotedPolls.has(pollId)) {
      toast.error('You already voted on this poll');
      return;
    }
    try {
      await engagementApi.submitPollResponse({
        pollId,
        userId: user?.id || 1,
        selectedOption: option
      });
      setUserVotedPolls(prev => new Set([...prev, pollId]));
      toast.success('Vote recorded');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Vote failed');
    }
  };

  // Create Poll
  const handleCreatePoll = async (e) => {
    e.preventDefault();
    const filteredOptions = pollOptions.filter(o => o.trim() !== '');
    if (!newPollQuestion.trim() || filteredOptions.length < 2) {
      toast.error('Poll needs a question and at least 2 options');
      return;
    }

    try {
      setSubmitting(true);
      await engagementApi.createPoll({
        eventId: selectedEventId,
        question: newPollQuestion,
        optionsJson: JSON.stringify(filteredOptions)
      });
      setNewPollQuestion('');
      setPollOptions(['', '']);
      toast.success('New poll published');
    } catch (err) {
      toast.error('Failed to create poll');
    } finally {
      setSubmitting(false);
    }
  };

  // Close Poll
  const handleClosePoll = async (pollId) => {
    try {
      await engagementApi.closePoll(pollId);
      toast.success('Poll closed');
    } catch (err) {
      toast.error('Failed to close poll');
    }
  };

  // Word Cloud submit
  const handleAddWord = async (e) => {
    e.preventDefault();
    if (!newWord.trim()) return;
    const cleanWord = newWord.trim();
    if (cleanWord.includes(' ') || cleanWord.length > 15) {
      toast.error('Submit a single word (no spaces) under 15 characters.');
      return;
    }
    try {
      await engagementApi.submitWord({
        eventId: selectedEventId,
        word: cleanWord
      });
      setNewWord('');
      toast.success('Keyword added to cloud');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Word submission failed');
    }
  };

  if (loading) return <LoadingSpinner label="Entering session feed..." />;
  if (events.length === 0) return <EmptyState title="No Sessions Found" description="Please create an event first to initialize engagement." />;

  return (
    <div>
      <div className="header-actions">
        <div>
          <p className="eyebrow">Engagement console</p>
          <h1 className="page-title-main">Live Control Room</h1>
        </div>
        
        <div>
          <label className="label-text">Select Active Session</label>
          <select 
            className="select-field" 
            style={{ width: '280px' }}
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
          >
            {events.map(ev => (
              <option key={ev.id} value={ev.id}>{ev.eventTitle}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="two-col-grid" style={{ marginTop: '20px' }}>
        
        {/* Left Side: Video Player & Q&A */}
        <div className="stack">
          {/* Real-time Video Stream Container */}
          <div className="card overflow-hidden" style={{ position: 'relative', background: '#000', borderRadius: '24px', aspectRatio: '16/9' }}>
            {selectedEvent?.streamUrl ? (
              <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                <video
                  id="live-stream-player"
                  src={selectedEvent.streamUrl}
                  controls
                  autoPlay
                  muted
                  playsInline
                  poster="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1000&auto=format&fit=crop&q=60"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <span className="badge live" style={{ position: 'absolute', top: '20px', left: '20px', background: '#EF4444' }}>
                  🔴 LIVE
                </span>
                <span className="clock" style={{ position: 'absolute', bottom: '20px', right: '20px', color: '#fff', background: 'rgba(0,0,0,0.65)', padding: '4px 10px', borderRadius: '4px' }}>
                  LIVE • {attendingCount} Attending
                </span>
              </div>
            ) : (
              <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', background: '#111', color: 'var(--ash)', textAlign: 'center', padding: '20px' }}>
                <div>
                  <p style={{ fontSize: '32px', margin: '0 0 10px 0' }}>📺</p>
                  <p style={{ fontWeight: 600, color: '#fff', margin: '0 0 5px 0' }}>No live feed configured</p>
                  <p className="text-xs muted" style={{ margin: 0 }}>Choose a session with an active video stream</p>
                </div>
              </div>
            )}
          </div>

          {/* Q&A Board */}
          <div className="card p-6">
            <h3 className="section-title" style={{ fontFamily: 'Poppins', fontSize: '20px', textTransform: 'uppercase' }}>
              Attendee Q&A Board
            </h3>
            
            <form onSubmit={handleAskQuestion} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <input 
                className="input-field" 
                placeholder="Ask something anonymously..." 
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
              />
              <button className="cta" type="submit" disabled={submitting} style={{ padding: '12px 18px' }}>
                <Send size={16} />
              </button>
            </form>

            <div className="stack" style={{ maxHeight: '350px', overflowY: 'auto', gap: '10px', paddingRight: '4px' }}>
              {qnas.length === 0 ? (
                <p className="muted text-sm text-center py-6">No questions posted yet. Be the first to ask!</p>
              ) : (
                qnas.map(q => (
                  <div key={q.id} className="stat-card" style={{ background: q.isAnswered ? 'rgba(16, 185, 129, 0.05)' : 'var(--stage-2)', border: q.isPinned ? '1px solid var(--amber)' : '1px solid var(--line)', flexDirection: 'row', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ flex: 1, marginRight: '16px' }}>
                      <p className="text-sm" style={{ margin: 0, fontWeight: 500 }}>
                        {q.isPinned && <span style={{ marginRight: '6px' }}>📌</span>}
                        {q.questionText}
                      </p>
                      <div className="flex gap-3 mt-2 text-xs muted" style={{ alignItems: 'center' }}>
                        <span>▲ {q.upvotes} upvotes</span>
                        {q.isAnswered && (
                          <span className="badge" style={{ background: '#d1fae5', color: '#065f46', fontSize: '10px' }}>
                            Answered Live
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2" style={{ alignItems: 'center' }}>
                      {!q.isAnswered && (
                        <button className="btn-icon" onClick={() => handleUpvote(q.id)} title="Upvote question">
                          <ThumbsUp size={16} />
                        </button>
                      )}
                      
                      {(user?.role === 'ADMIN' || user?.role === 'ORGANIZER') && (
                        <>
                          <button 
                            className="btn-icon" 
                            onClick={() => handlePinQuestion(q.id)} 
                            title={q.isPinned ? 'Unpin question' : 'Pin question'}
                            style={{ color: q.isPinned ? 'var(--amber)' : 'var(--ash)' }}
                          >
                            📌
                          </button>
                          {!q.isAnswered && (
                            <button className="btn-icon" onClick={() => handleAnswerQuestion(q.id)} title="Mark as Answered" style={{ color: 'var(--success)' }}>
                              <Check size={16} />
                            </button>
                          )}
                          <button 
                            className="btn-icon" 
                            onClick={() => handleDeleteQuestion(q.id)} 
                            title="Delete question" 
                            style={{ color: '#EF4444' }}
                          >
                            🗑️
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Polls & Sentiment */}
        <div className="stack">
          {/* Live Polling */}
          <div className="card p-6">
            <div className="flex row-between mb-4">
              <h3 className="section-title" style={{ fontFamily: 'Poppins', fontSize: '20px', textTransform: 'uppercase', margin: 0 }}>
                Live Session Polls
              </h3>
              <span className="badge live">Active</span>
            </div>

            {/* Poll Creation (Admins/Organizers) */}
            {(user?.role === 'ADMIN' || user?.role === 'ORGANIZER') && (
              <details className="mb-6" style={{ cursor: 'pointer' }}>
                <summary className="label-text" style={{ color: 'var(--amber)', fontWeight: 600 }}>
                  [+] Broadcast New Poll
                </summary>
                <form onSubmit={handleCreatePoll} className="stack mt-3" style={{ cursor: 'default' }}>
                  <input 
                    className="input-field" 
                    placeholder="Enter poll question..." 
                    value={newPollQuestion}
                    onChange={(e) => setNewPollQuestion(e.target.value)}
                  />
                  {pollOptions.map((opt, i) => (
                    <input 
                      key={i}
                      className="input-field" 
                      placeholder={`Option ${i + 1}`} 
                      value={opt}
                      onChange={(e) => {
                        const copy = [...pollOptions];
                        copy[i] = e.target.value;
                        setPollOptions(copy);
                      }}
                    />
                  ))}
                  <button 
                    type="button" 
                    className="btn-secondary text-xs" 
                    onClick={() => setPollOptions([...pollOptions, ''])}
                    style={{ padding: '8px' }}
                  >
                    + Add option field
                  </button>
                  <button className="cta" type="submit" disabled={submitting}>
                    Publish Poll
                  </button>
                </form>
              </details>
            )}

            {/* Poll Listing */}
            <div className="stack" style={{ maxHeight: '350px', overflowY: 'auto' }}>
              {polls.length === 0 ? (
                <p className="muted text-sm text-center py-6">No polls broadcasted yet.</p>
              ) : (
                polls.map(p => {
                  const opts = JSON.parse(p.optionsJson || '[]');
                  const hasVoted = userVotedPolls.has(p.id);
                  
                  return (
                    <div key={p.id} className="stat-card" style={{ background: 'var(--stage)', border: '1px solid var(--line)', marginBottom: '10px' }}>
                      <div className="flex row-between mb-2">
                        <span className="eyebrow" style={{ fontSize: '10px' }}>Poll #{p.id}</span>
                        {!p.isActive && <span className="muted text-xs">Closed</span>}
                      </div>
                      <p className="text-sm font-semibold mb-3">{p.question}</p>
                      
                      <div className="stack" style={{ gap: '8px' }}>
                        {opts.map(opt => {
                          const votes = pollResults[p.id] || {};
                          const count = votes[opt] || 0;
                          const totalVotes = Object.values(votes).reduce((a, b) => a + b, 0);
                          const percent = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
                          
                          return (
                            <div key={opt} style={{ position: 'relative', width: '100%' }}>
                              <button 
                                className={`select-field text-left flex row-between`}
                                style={{ 
                                  background: 'transparent',
                                  position: 'relative',
                                  zIndex: 2,
                                  cursor: hasVoted || !p.isActive ? 'default' : 'pointer',
                                  border: '1px solid var(--line)',
                                  padding: '10px 14px',
                                  width: '100%'
                                }}
                                onClick={() => p.isActive && handleVotePoll(p.id, opt)}
                              >
                                <span style={{ fontWeight: 500 }}>{opt}</span>
                                <span className="muted text-xs">
                                  {hasVoted || !p.isActive ? `${count} votes (${percent}%)` : 'Vote'}
                                </span>
                              </button>
                              
                              {(hasVoted || !p.isActive) && (
                                <div 
                                  style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    bottom: 0,
                                    width: `${percent}%`,
                                    background: 'rgba(79, 70, 229, 0.15)',
                                    transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                                    borderRadius: '12px',
                                    pointerEvents: 'none',
                                    zIndex: 1
                                  }} 
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Organizer Close Poll */}
                      {(user?.role === 'ADMIN' || user?.role === 'ORGANIZER') && p.isActive && (
                        <button 
                          className="btn-danger text-xs mt-3 w-full"
                          onClick={() => handleClosePoll(p.id)}
                        >
                          Close Voting
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Sentiment Word Cloud */}
          <div className="card p-6">
            <h3 className="section-title" style={{ fontFamily: 'Poppins', fontSize: '20px', textTransform: 'uppercase' }}>
              Sentiment Word Cloud
            </h3>
            
            <form onSubmit={handleAddWord} style={{ display: 'flex', gap: '8px', marginBottom: '18px' }}>
              <input 
                className="input-field" 
                placeholder="Submit session feedback word..." 
                value={newWord}
                onChange={(e) => setNewWord(e.target.value)}
              />
              <button className="btn-secondary" type="submit" style={{ borderRadius: '12px', padding: '10px 14px' }}>
                Add
              </button>
            </form>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 14px', justifyContent: 'center', alignItems: 'center', background: 'var(--stage)', padding: '20px', borderRadius: '16px', border: '1px solid var(--line)' }}>
              {words.length === 0 ? (
                <p className="muted text-xs">No feedback keywords submitted yet.</p>
              ) : (
                words.map((w) => {
                  const fontSize = Math.min(32, Math.max(12, 10 + w.value / 2));
                  const color = w.value > 25 ? 'var(--amber)' : (w.value > 15 ? 'var(--paper)' : 'var(--ash)');
                  
                  return (
                    <span 
                      key={w.text} 
                      style={{ 
                        fontSize: `${fontSize}px`, 
                        color: color, 
                        fontWeight: w.value > 20 ? 700 : 500,
                        fontFamily: w.value > 25 ? 'Poppins, sans-serif' : 'inherit',
                        transition: 'font-size 0.3s ease',
                        cursor: 'pointer'
                      }}
                      onClick={() => {
                        setNewWord(w.text);
                        toast.info(`Feedback keyword: "${w.text}"`);
                      }}
                    >
                      {w.text}
                    </span>
                  );
                })
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
