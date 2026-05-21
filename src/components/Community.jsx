import React, { useState } from 'react';
import { Users, Heart, Share2, PlusCircle, Calendar, CalendarDays, MapPin } from 'lucide-react';

const INITIAL_POSTS = [
  {
    id: 1,
    username: "EcoWarrior_Bengaluru",
    avatar: "🥬",
    content: "Just dropped off 4kg of old laptop chargers and broken copper cables at the Techno Park E-Waste Hub! Kept those toxins out of our landfills. (+40 XP) 🔌",
    likes: 12,
    hasLiked: false,
    time: "2 hours ago"
  },
  {
    id: 2,
    username: "CarbonCutter_42",
    avatar: "🌱",
    content: "Swapped out our family's plastic grocery bags for biodegradable mesh bags. A tiny habit shift, but it saves 0.05kg of carbon impact per bag! ♻️",
    likes: 24,
    hasLiked: false,
    time: "4 hours ago"
  },
  {
    id: 3,
    username: "CompostQueen",
    avatar: "🍊",
    content: "My home backyard compost bin finished its first batch today! Ready to feed the vegetable patches. Waste to rich organic food. 🥬",
    likes: 18,
    hasLiked: false,
    time: "Yesterday"
  }
];

const LOCAL_EVENTS = [
  {
    title: "Civic Park Cleanup & Plastic Drive",
    date: "Saturday, May 27 | 08:30 AM",
    location: "Civic Park Main Entrance",
    host: "Bengaluru Eco-Saviors",
    xpReward: 150
  },
  {
    title: "Neighborhood Battery Safe Disposal Camp",
    date: "Sunday, June 04 | 10:00 AM",
    location: "Community Center Block D",
    host: "SortiWise Volunteers",
    xpReward: 100
  }
];

export default function Community({ currentUser }) {
  const [posts, setPosts] = useState(() => {
    const saved = localStorage.getItem('sortiwise_community_posts');
    return saved ? JSON.parse(saved) : INITIAL_POSTS;
  });
  const [postInput, setPostInput] = useState('');
  const [joinedEvents, setJoinedEvents] = useState(() => {
    const saved = localStorage.getItem('sortiwise_joined_events');
    return saved ? JSON.parse(saved) : [];
  });

  const handleCreatePost = (e) => {
    e.preventDefault();
    if (!postInput.trim()) return;

    const newPost = {
      id: Date.now(),
      username: currentUser?.username || "EcoGuest_" + Math.floor(Math.random()*1000),
      avatar: "♻️",
      content: postInput,
      likes: 0,
      hasLiked: false,
      time: "Just now"
    };

    const updated = [newPost, ...posts];
    setPosts(updated);
    localStorage.setItem('sortiwise_community_posts', JSON.stringify(updated));
    setPostInput('');
  };

  const handleLike = (id) => {
    const updated = posts.map(p => {
      if (p.id === id) {
        return {
          ...p,
          likes: p.hasLiked ? p.likes - 1 : p.likes + 1,
          hasLiked: !p.hasLiked
        };
      }
      return p;
    });
    setPosts(updated);
    localStorage.setItem('sortiwise_community_posts', JSON.stringify(updated));
  };

  const handleJoinEvent = (title) => {
    if (joinedEvents.includes(title)) return;
    const updated = [...joinedEvents, title];
    setJoinedEvents(updated);
    localStorage.setItem('sortiwise_joined_events', JSON.stringify(updated));
  };

  return (
    <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
      
      {/* Feed Area */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* Create Post Card */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '12px' }}>Share Achievements</h3>
          <form onSubmit={handleCreatePost} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <textarea
              placeholder="Share your latest recycling action, upcycling success, or eco-tips with the community..."
              value={postInput}
              onChange={(e) => setPostInput(e.target.value)}
              style={{ width: '100%', height: '80px', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--card-border)', color: '#fff', fontSize: '0.88rem', resize: 'none' }}
            />
            <button type="submit" className="neon-glow-btn" style={{ padding: '8px 16px', alignSelf: 'flex-end', fontSize: '0.85rem' }}>
              <PlusCircle size={14} /> Broadcast Post
            </button>
          </form>
        </div>

        {/* Public Posts Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {posts.map(post => (
            <div key={post.id} className="glass-card animate-fade-in">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                <span style={{ fontSize: '1.6rem', padding: '6px', background: 'rgba(255,255,255,0.03)', borderRadius: '50%' }}>
                  {post.avatar}
                </span>
                <div>
                  <h4 style={{ fontSize: '0.92rem', fontWeight: '700', color: 'var(--text-primary)' }}>{post.username}</h4>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{post.time}</p>
                </div>
              </div>

              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '14px' }}>
                {post.content}
              </p>

              {/* Actions row */}
              <div style={{ display: 'flex', gap: '16px', borderTop: '1px solid var(--card-border)', paddingTop: '10px' }}>
                <button 
                  onClick={() => handleLike(post.id)}
                  style={{ background: 'none', border: 'none', color: post.hasLiked ? 'var(--hazardous)' : 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}
                >
                  <Heart size={14} fill={post.hasLiked ? 'var(--hazardous)' : 'none'} /> {post.likes} Likes
                </button>
                <button 
                  style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}
                  onClick={() => navigator.clipboard.writeText(post.content)}
                >
                  <Share2 size={14} /> Share
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Events Board */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Users size={18} color="var(--accent)" /> Local Cleanup Actions
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          Join local environmental cleanup drives, battery collections, or waste segregation events and earn extra XP.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {LOCAL_EVENTS.map((event, idx) => {
            const hasJoined = joinedEvents.includes(event.title);
            return (
              <div key={idx} className="glass-card" style={{ padding: '16px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--card-border)' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-primary)' }}>{event.title}</h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '10px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <p style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CalendarDays size={12} color="var(--accent)" /> {event.date}
                  </p>
                  <p style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={12} color="var(--accent)" /> {event.location}
                  </p>
                  <p style={{ color: 'var(--text-muted)' }}>Hosted by: {event.host}</p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: '600', color: 'var(--ewaste)' }}>
                    +{event.xpReward} XP Reward
                  </span>
                  <button 
                    disabled={hasJoined}
                    onClick={() => handleJoinEvent(event.title)}
                    className={hasJoined ? 'secondary-btn' : 'neon-glow-btn'}
                    style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                  >
                    {hasJoined ? 'Joined' : 'RSVP Join'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
