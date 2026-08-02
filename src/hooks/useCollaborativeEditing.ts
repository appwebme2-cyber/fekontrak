import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface EditingUser {
  userId: string;
  userName: string;
  fieldName: string;
  timestamp: number;
  avatar?: string;
}

interface ConflictResolution {
  recordId: string;
  fieldName: string;
  conflictType: 'concurrent_edit' | 'version_mismatch';
  localValue: any;
  remoteValue: any;
  timestamp: number;
}

export const useCollaborativeEditing = (recordType: string, recordId: string) => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [activeEditors, setActiveEditors] = useState<EditingUser[]>([]);
  const [conflicts, setConflicts] = useState<ConflictResolution[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const channelRef = useRef<any>(null);
  const editingTimeoutRef = useRef<NodeJS.Timeout>();

  // Channel name for the specific record
  const channelName = `collaborative_editing_${recordType}_${recordId}`;

  // Initialize real-time connection
  useEffect(() => {
    if (!recordId || !userProfile) return;

    const channel = supabase.channel(channelName);

    // Subscribe to presence for active editors
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const editors: EditingUser[] = [];
        
        Object.values(state).forEach((presenceArray: any) => {
          presenceArray.forEach((presence: any) => {
            if (presence.userId !== userProfile.id) {
              editors.push(presence);
            }
          });
        });
        
        setActiveEditors(editors);
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        console.log('New editors joined:', newPresences);
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        console.log('Editors left:', leftPresences);
      })
      // Listen for real-time field changes
      .on('broadcast', { event: 'field_change' }, ({ payload }) => {
        handleRemoteFieldChange(payload);
      })
      // Listen for conflict notifications
      .on('broadcast', { event: 'conflict_detected' }, ({ payload }) => {
        handleConflictDetected(payload);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          channelRef.current = channel;
        }
      });

    return () => {
      channel.unsubscribe();
      setIsConnected(false);
    };
  }, [recordType, recordId, userProfile]);

  // Announce field editing
  const announceFieldEditing = useCallback((fieldName: string) => {
    if (!channelRef.current || !userProfile) return;

    // Clear previous timeout
    if (editingTimeoutRef.current) {
      clearTimeout(editingTimeoutRef.current);
    }

    // Track user presence for this field
    channelRef.current.track({
      userId: userProfile.id,
      userName: userProfile.full_name || userProfile.email || 'Unknown User',
      fieldName,
      timestamp: Date.now(),
      avatar: userProfile.avatar_url
    });

    // Auto-remove presence after 30 seconds of inactivity
    editingTimeoutRef.current = setTimeout(() => {
      stopFieldEditing();
    }, 30000);
  }, [userProfile]);

  // Stop field editing announcement
  const stopFieldEditing = useCallback(() => {
    if (!channelRef.current) return;

    if (editingTimeoutRef.current) {
      clearTimeout(editingTimeoutRef.current);
    }

    channelRef.current.untrack();
  }, []);

  // Broadcast field changes
  const broadcastFieldChange = useCallback((fieldName: string, value: any, version?: string) => {
    if (!channelRef.current || !userProfile) return;

    channelRef.current.send({
      type: 'broadcast',
      event: 'field_change',
      payload: {
        userId: userProfile.id,
        userName: userProfile.full_name || userProfile.email,
        fieldName,
        value,
        version,
        timestamp: Date.now()
      }
    });
  }, [userProfile]);

  // Handle remote field changes
  const handleRemoteFieldChange = useCallback((payload: any) => {
    // Check if we're currently editing the same field
    const currentEditor = activeEditors.find(
      editor => editor.fieldName === payload.fieldName && editor.userId === payload.userId
    );

    if (currentEditor) {
      // Show real-time preview of changes
      console.log('Remote field change:', payload);
      
      // You can emit custom events here for form components to listen to
      window.dispatchEvent(new CustomEvent('collaborative_field_change', {
        detail: payload
      }));
    }
  }, [activeEditors]);

  // Handle conflict detection
  const handleConflictDetected = useCallback((payload: ConflictResolution) => {
    setConflicts(prev => [...prev, payload]);
    
    toast({
      title: "Konflik Terdeteksi",
      description: `Ada perubahan simultan pada field "${payload.fieldName}". Silakan review dan pilih versi yang benar.`,
      variant: "destructive"
    });
  }, [toast]);

  // Resolve conflict by choosing a version
  const resolveConflict = useCallback((conflictId: string, chosenValue: any) => {
    setConflicts(prev => prev.filter(c => 
      !(c.recordId === recordId && c.timestamp.toString() === conflictId)
    ));

    // Broadcast resolution
    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'conflict_resolved',
        payload: {
          conflictId,
          resolvedValue: chosenValue,
          resolvedBy: userProfile?.id,
          timestamp: Date.now()
        }
      });
    }
  }, [recordId, userProfile]);

  // Optimistic update with conflict detection
  const optimisticUpdate = useCallback(async (
    fieldName: string, 
    value: any, 
    updateFn: () => Promise<any>
  ) => {
    try {
      // Announce we're editing this field
      announceFieldEditing(fieldName);

      // Broadcast the change for real-time preview
      broadcastFieldChange(fieldName, value);

      // Perform the actual update
      const result = await updateFn();

      // Stop editing announcement
      stopFieldEditing();

      return result;
    } catch (error: any) {
      // Check if it's a version conflict
      if (error.message?.includes('version') || error.message?.includes('conflict')) {
        const conflict: ConflictResolution = {
          recordId,
          fieldName,
          conflictType: 'version_mismatch',
          localValue: value,
          remoteValue: error.remoteValue || 'Unknown',
          timestamp: Date.now()
        };

        handleConflictDetected(conflict);
      }

      stopFieldEditing();
      throw error;
    }
  }, [recordId, announceFieldEditing, broadcastFieldChange, stopFieldEditing, handleConflictDetected]);

  // Get editors for a specific field
  const getFieldEditors = useCallback((fieldName: string) => {
    return activeEditors.filter(editor => editor.fieldName === fieldName);
  }, [activeEditors]);

  // Check if field is being edited by others
  const isFieldBeingEdited = useCallback((fieldName: string) => {
    return getFieldEditors(fieldName).length > 0;
  }, [getFieldEditors]);

  return {
    // State
    activeEditors,
    conflicts,
    isConnected,
    
    // Field editing management
    announceFieldEditing,
    stopFieldEditing,
    isFieldBeingEdited,
    getFieldEditors,
    
    // Collaboration features
    optimisticUpdate,
    broadcastFieldChange,
    resolveConflict,
    
    // Utilities
    channelName,
    recordType,
    recordId
  };
};