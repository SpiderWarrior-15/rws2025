import React, { useState } from 'react';
import { Calendar, MapPin, Clock, Plus, Edit, Trash2, Users } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { AnimatedButton } from '../components/AnimatedButton';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAuth } from '../hooks/useAuth';
import { useSounds } from '../hooks/useSounds';
import { Event } from '../types';
import { initialEvents } from '../utils/initialData';

export const Events: React.FC = () => {
  const { user } = useAuth();
  const { playSound } = useSounds();
  const [events, setEvents] = useLocalStorage<Event[]>('rws-events', initialEvents);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [newEvent, setNewEvent] = useState({ 
    title: '', 
    description: '', 
    date: '', 
    place: '', 
    time: '' 
  });

  const isAdmin = user?.accountType === 'admin';

  const handleAddEvent = () => {
    if (newEvent.title && newEvent.description && newEvent.date && newEvent.place) {
      const event: Event = {
        id: Date.now().toString(),
        ...newEvent
      };
      setEvents([...events, event]);
      setNewEvent({ title: '', description: '', date: '', place: '', time: '' });
      setIsAddingNew(false);
      playSound('success');
    }
  };

  const handleEditEvent = (event: Event) => {
    if (editingEvent?.id === event.id) {
      const updatedEvents = events.map(e => 
        e.id === event.id ? { ...event, ...newEvent } : e
      );
      setEvents(updatedEvents);
      setEditingEvent(null);
      setNewEvent({ title: '', description: '', date: '', place: '', time: '' });
      playSound('success');
    } else {
      setEditingEvent(event);
      setNewEvent({ 
        title: event.title, 
        description: event.description, 
        date: event.date, 
        place: event.place,
        time: event.time || ''
      });
    }
  };

  const handleDeleteEvent = (id: string) => {
    setEvents(events.filter(event => event.id !== id));
    playSound('error');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const isUpcoming = (dateString: string) => {
    return new Date(dateString) >= new Date();
  };

  const sortedEvents = [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-md border border-purple-500/30 mb-6">
            <Calendar className="w-5 h-5 text-purple-400 mr-2" />
            <span className="text-sm font-medium text-purple-400">Warriors Unite</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Upcoming Events
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Join us at exciting events where passion meets purpose and warriors come together
          </p>
        </div>

        {/* Add New Event Button - Admin Only */}
        {isAdmin && (
          <div className="flex justify-center mb-8">
            <AnimatedButton
              variant="primary"
              icon={Plus}
              onClick={() => setIsAddingNew(true)}
              soundType="click"
            >
              Add New Event
            </AnimatedButton>
          </div>
        )}

        {/* Add/Edit Event Form - Admin Only */}
        {isAdmin && (isAddingNew || editingEvent) && (
          <GlassCard className="p-6 mb-8 max-w-2xl mx-auto">
            <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
              {editingEvent ? 'Edit Event' : 'Add New Event'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Event Title
                </label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white"
                  placeholder="Enter event title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white resize-none"
                  rows={4}
                  placeholder="Describe your event..."
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                    className="w-full px-4 py-2 bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Time
                  </label>
                  <input
                    type="time"
                    value={newEvent.time}
                    onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                    className="w-full px-4 py-2 bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={newEvent.place}
                  onChange={(e) => setNewEvent({ ...newEvent, place: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white"
                  placeholder="Enter event location"
                />
              </div>
              <div className="flex space-x-4">
                <AnimatedButton
                  variant="primary"
                  onClick={editingEvent ? () => handleEditEvent(editingEvent) : handleAddEvent}
                  soundType="success"
                >
                  {editingEvent ? 'Update Event' : 'Add Event'}
                </AnimatedButton>
                <AnimatedButton
                  variant="ghost"
                  onClick={() => {
                    setIsAddingNew(false);
                    setEditingEvent(null);
                    setNewEvent({ title: '', description: '', date: '', place: '', time: '' });
                  }}
                  soundType="click"
                >
                  Cancel
                </AnimatedButton>
              </div>
            </div>
          </GlassCard>
        )}

        {/* Events Timeline */}
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-600 to-blue-600 hidden md:block"></div>

          <div className="space-y-8">
            {sortedEvents.map((event, index) => (
              <div key={event.id} className="relative group">
                {/* Timeline Dot */}
                <div className="absolute left-6 w-4 h-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full border-4 border-white dark:border-gray-900 hidden md:block"></div>

                {/* Event Card */}
                <div className="md:ml-16">
                  <GlassCard className="p-6 relative overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-600/10 to-blue-600/10 rounded-full blur-2xl"></div>
                    
                    <div className="relative">
                      {/* Event Status Badge */}
                      <div className="flex items-center justify-between mb-4">
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          isUpcoming(event.date) 
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                        }`}>
                          <Calendar className="w-3 h-3 mr-1" />
                          {isUpcoming(event.date) ? 'Upcoming' : 'Past'}
                        </div>

                        {/* Admin Controls */}
                        {isAdmin && (
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex space-x-2">
                            <button
                              onClick={() => handleEditEvent(event)}
                              className="p-2 bg-blue-500/80 hover:bg-blue-600/80 text-white rounded-lg transition-colors duration-300"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteEvent(event.id)}
                              className="p-2 bg-red-500/80 hover:bg-red-600/80 text-white rounded-lg transition-colors duration-300"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Event Content */}
                      <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">
                        {event.title}
                      </h3>
                      
                      <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                        {event.description}
                      </p>

                      {/* Event Details */}
                      <div className="grid md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                          <Calendar className="w-4 h-4 text-purple-500" />
                          <span>{formatDate(event.date)}</span>
                        </div>
                        {event.time && (
                          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                            <Clock className="w-4 h-4 text-blue-500" />
                            <span>{event.time}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                          <MapPin className="w-4 h-4 text-teal-500" />
                          <span>{event.place}</span>
                        </div>
                      </div>

                      {/* RSVP Button */}
                      {isUpcoming(event.date) && (
                        <div className="mt-6">
                          <AnimatedButton
                            variant="primary"
                            size="sm"
                            icon={Users}
                            soundType="success"
                          >
                            RSVP Now
                          </AnimatedButton>
                        </div>
                      )}
                    </div>
                  </GlassCard>
                </div>
              </div>
            ))}
          </div>
        </div>

        {events.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-600 dark:text-gray-400 mb-2">
              No events scheduled
            </h3>
            <p className="text-gray-500 dark:text-gray-500">
              {isAdmin ? 'Add your first event to get the community excited!' : 'Events will appear here when scheduled by commanders.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};