
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DismissedNotification {
  id: string;
  notification_type: string;
  context_id: string;
  context_data: any;
  dismissed_at: string;
}

export const useDismissedNotifications = () => {
  const [dismissedNotifications, setDismissedNotifications] = useState<DismissedNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDismissedNotifications = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('dismissed_notifications')
        .select('*')
        .order('dismissed_at', { ascending: false });

      if (error) throw error;
      setDismissedNotifications(data || []);
    } catch (error) {
      console.error('Erro ao buscar notificações dispensadas:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const dismissNotification = useCallback(async (
    notificationType: string,
    contextId: string,
    contextData: any = {}
  ) => {
    try {
      const { error } = await supabase
        .from('dismissed_notifications')
        .insert({
          notification_type: notificationType,
          context_id: contextId,
          context_data: contextData
        });

      if (error) throw error;
      
      // Atualizar lista local
      await fetchDismissedNotifications();
      return true;
    } catch (error) {
      console.error('Erro ao dispensar notificação:', error);
      return false;
    }
  }, [fetchDismissedNotifications]);

  const isNotificationDismissed = useCallback((
    notificationType: string,
    contextId: string
  ) => {
    return dismissedNotifications.some(
      dn => dn.notification_type === notificationType && dn.context_id === contextId
    );
  }, [dismissedNotifications]);

  useEffect(() => {
    fetchDismissedNotifications();
  }, [fetchDismissedNotifications]);

  return {
    dismissedNotifications,
    dismissNotification,
    isNotificationDismissed,
    loading
  };
};
