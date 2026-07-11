import { useEffect, useState, useMemo } from 'react';
import useAuth from '../../hooks/useAuth.js';
import * as engagementApi from '../../api/engagementApi.js';
import * as eventApi from '../../api/eventApi.js';
import { useToast } from '../../hooks/useToast.js';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import { Send, ThumbsUp, Check, Play, Award, BarChart2 } from 'lucide-react';

export default function EngagementRoom() {
  const { user } = useAuth();
  const toast = useToast();
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Data lists
  const [polls, setPolls] = useState([]);
  const [qnas, setQnas] = useState([]);
  const [userVotedPolls, setUserVotedPolls] = useState(new Set());
  
  // Form states
  const [newQuestion, setNewQuestion] = useState('');
  const [newPollQuestion, setNewPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  
  // Word cloud states
  const [words, setWords] = useState([
    { text: 'Insightful', value: 24 },
    { text: 'Inspiring', value: 18 },
    { text: 'Innovative', value: 32 },
    { text: 'Fast-paced', value: 10 },
    { text: 'Bespoke', value: 15 },
    { text: 'Engaging', value: 28 },
    { text: 'Educational', value: 20 }
  ]);
  const [newWord, setNewWord] = useState('');

  // Fetch initial events
  useEffect(() => {
    eventApi.getEvents()
      .then(data => {
        setEvents(data);
        if (data.length > 0) {
          setSelectedEventId(data[0].id);
        }
      })
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, []);

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
    } catch (err) {
      toast.error('Failed to load engagement records');
    }
  };

  useEffect(() => {
    if (selectedEventId) {
      fetchEngagementData();
    }
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
      fetchEngagementData();
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
      fetchEngagementData();
    } catch (err) {
      toast.error('Could not register vote');
    }
  };

  // Answer Question (Host/Speaker Action)
  const handleAnswerQuestion = async (qnaId) => {
    try {
      await engagementApi.answerQna(qnaId);
      toast.success('Question marked as answered');
      fetchEngagementData();
    } catch (err) {
      toast.error('Could not mark as answered');
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
      fetchEngagementData();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Vote failed');
    }
  };

  // Create Poll (Speaker/Admin Action)
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
      fetchEngagementData();
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
      fetchEngagementData();
    } catch (err) {
      toast.error('Failed to close poll');
    }
  };

  // Word Cloud submit
  const handleAddWord = (e) => {
    e.preventDefault();
    if (!newWord.trim()) return;
    const wordClean = newWord.trim().substring(0, 15);
    setWords(prev => {
      const idx = prev.findIndex(w => w.text.toLowerCase() === wordClean.toLowerCase());
      if (idx !== -1) {
        const updated = [...prev];
        updated[idx].value += 5;
        return updated;
      }
      return [...prev, { text: wordClean, value: 8 }];
    });
    setNewWord('');
    toast.success('Keyword added to cloud');
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
        
        {/* Left Side: Mock Video & Q&A */}
        <div className="stack">
          {/* Mock Video Stream */}
          <div className="card overflow-hidden" style={{ position: 'relative', background: '#000', borderRadius: '24px', aspectRatio: '16/9' }}>
            <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
              <div className="avatar" style={{ width: '80px', height: '80px', borderRadius: '50%', cursor: 'pointer', boxShadow: '0 0 30px rgba(255,184,77,0.3)' }}>
                <Play size={32} style={{ marginLeft: '4px' }} />
              </div>
              <span className="badge live" style={{ position: 'absolute', top: '20px', left: '20px' }}>Simulcast Feed</span>
              <span className="clock" style={{ position: 'absolute', bottom: '20px', right: '20px', color: '#fff' }}>
                LIVE • 248 Attending
              </span>
            </div>
            <img 
              src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.0.3" 
              alt="Stream placeholder" 
              style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.4, pointerEvents: 'none' }}
            />
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
                  <div key={q.id} className="stat-card" style={{ background: q.isAnswered ? 'rgba(16, 185, 129, 0.05)' : 'var(--stage-2)', border: '1px solid var(--line)', flexDirection: 'row', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ flex: 1, marginRight: '16px' }}>
                      <p className="text-sm" style={{ margin: 0, fontWeight: 500 }}>{q.questionText}</p>
                      <div className="flex gap-3 mt-2 text-xs muted" style={{ alignItems: 'center' }}>
                        <span>▲ {q.upvotes} upvotes</span>
                        {q.isAnswered && (
                          <span className="badge" style={{ background: '#d1fae5', color: '#065f46', fontSize: '10px' }}>
                            Answered Live
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      {!q.isAnswered && (
                        <button className="btn-icon" onClick={() => handleUpvote(q.id)} title="Upvote question">
                          <ThumbsUp size={16} />
                        </button>
                      )}
                      {(user?.role === 'ADMIN' || user?.role === 'ORGANIZER') && !q.isAnswered && (
                        <button className="btn-icon" onClick={() => handleAnswerQuestion(q.id)} title="Mark as Answered" style={{ color: 'var(--success)' }}>
                          <Check size={16} />
                        </button>
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
                        {opts.map(opt => (
                          <button 
                            key={opt}
                            className={`select-field text-left flex row-between`}
                            style={{ 
                              background: hasVoted ? 'rgba(255,255,255,0.02)' : 'var(--stage-2)', 
                              cursor: hasVoted || !p.isActive ? 'default' : 'pointer',
                              border: '1px solid var(--line)',
                              padding: '10px 14px'
                            }}
                            onClick={() => p.isActive && handleVotePoll(p.id, opt)}
                          >
                            <span>{opt}</span>
                            {!hasVoted && p.isActive && <span className="muted text-xs">Vote</span>}
                          </button>
                        ))}
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
              {words.map((w) => {
                // Map values to font sizes
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
                      toast.info(`Voted word: "${w.text}"`);
                    }}
                  >
                    {w.text}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
