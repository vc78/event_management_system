import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { socketService } from '../realtime/socket.js';
import toast from 'react-hot-toast';

export function useRealtimeEvent(eventId) {
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!eventId) return;

        const unsubscribe = socketService.subscribe(`/topic/events/${eventId}`, (payload) => {
            // payload: { eventId, availableSeats, eventStatus }
            queryClient.setQueryData(['events', eventId.toString()], (oldData) => {
                if (!oldData) return oldData;
                return {
                    ...oldData,
                    availableSeats: payload.availableSeats,
                    eventStatus: payload.eventStatus
                };
            });
            
            // Also optionally invalidate to ensure fully fresh data, but setting it inline is faster
            // queryClient.invalidateQueries(['events', eventId.toString()]);
        });

        return () => {
            unsubscribe();
        };
    }, [eventId, queryClient]);
}

export function useRealtimeEventsList() {
    const queryClient = useQueryClient();

    useEffect(() => {
        const unsubscribe = socketService.subscribe(`/topic/events`, (payload) => {
            // Update any list that might contain this event
            queryClient.setQueryData(['events'], (oldData) => {
                if (!oldData) return oldData;
                if (Array.isArray(oldData)) {
                    return oldData.map(event => 
                        event.id === payload.eventId 
                            ? { ...event, availableSeats: payload.availableSeats, eventStatus: payload.eventStatus }
                            : event
                    );
                } else if (oldData.content && Array.isArray(oldData.content)) { // If paginated
                    return {
                        ...oldData,
                        content: oldData.content.map(event =>
                            event.id === payload.eventId 
                                ? { ...event, availableSeats: payload.availableSeats, eventStatus: payload.eventStatus }
                                : event
                        )
                    };
                }
                return oldData;
            });
        });

        return () => {
            unsubscribe();
        };
    }, [queryClient]);
}

export function useRealtimeBookings(userId) {
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!userId) return;

        const unsubscribe = socketService.subscribe(`/topic/bookings/${userId}`, (payload) => {
            // payload: { bookingId, status }
            if (payload.status === 'CANCELLED') {
                toast(`Your booking #${payload.bookingId} has been cancelled by an administrator.`, { icon: 'ℹ️' });
            }

            queryClient.setQueryData(['bookings', 'mine'], (oldData) => {
                if (!oldData || !Array.isArray(oldData)) return oldData;
                return oldData.map(booking => 
                    booking.id === payload.bookingId 
                        ? { ...booking, bookingStatus: payload.status }
                        : booking
                );
            });
        });

        return () => {
            unsubscribe();
        };
    }, [userId, queryClient]);
}

export function useRealtimeDashboard() {
    const queryClient = useQueryClient();

    useEffect(() => {
        const unsubscribe = socketService.subscribe(`/topic/admin/dashboard`, (payload) => {
            // payload: { totalBookings, totalRevenue, confirmedBookings, cancelledBookings }
            queryClient.setQueryData(['admin', 'dashboard'], (oldData) => {
                if (!oldData) return payload; // Use directly if none
                return {
                    ...oldData,
                    ...payload
                };
            });
        });

        return () => {
            unsubscribe();
        };
    }, [queryClient]);
}
