import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AlertType {
  id: string;
  name: string;
  condition_description: string;
  target_role: string;
  channel: string;
  priority: string;
  is_active: boolean;
  metadata: any;
  created_at: string;
  updated_at: string;
}

export interface EscalationContact {
  id: string;
  name: string;
  role: string;
  escalation_level: number;
  whatsapp_number: string;
  email: string;
  work_schedule: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AlertConfiguration {
  id: string;
  name: string;
  description?: string;
  trigger_conditions: any;
  notification_channels: string[];
  escalation_levels: number[];
  cooldown_minutes: number;
  is_active: boolean;
  metadata: any;
  created_at: string;
  updated_at: string;
}

export interface AlertHistory {
  id: string;
  alert_configuration_id?: string;
  triggered_by_user_id?: string;
  triggered_by_conversation_id?: string;
  message: string;
  channels_sent: string[];
  recipients: any;
  status: string;
  response_time_minutes?: number;
  resolved_at?: string;
  resolved_by?: string;
  metadata: any;
  created_at: string;
}

export const useAlertsSystem = () => {
  const [alertTypes, setAlertTypes] = useState<AlertType[]>([]);
  const [escalationContacts, setEscalationContacts] = useState<EscalationContact[]>([]);
  const [alertConfigurations, setAlertConfigurations] = useState<AlertConfiguration[]>([]);
  const [alertHistory, setAlertHistory] = useState<AlertHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadAlertTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('alert_types')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAlertTypes(data || []);
    } catch (error) {
      console.error('Error loading alert types:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar tipos de alerta",
        variant: "destructive",
      });
    }
  };

  const loadEscalationContacts = async () => {
    try {
      const { data, error } = await supabase
        .from('escalation_contacts')
        .select('*')
        .eq('is_active', true)
        .order('escalation_level', { ascending: true });

      if (error) throw error;
      setEscalationContacts(data || []);
    } catch (error) {
      console.error('Error loading escalation contacts:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar contatos de escalação",
        variant: "destructive",
      });
    }
  };

  const loadAlertConfigurations = async () => {
    try {
      const { data, error } = await supabase
        .from('alert_configurations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAlertConfigurations(data || []);
    } catch (error) {
      console.error('Error loading alert configurations:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar configurações de alertas",
        variant: "destructive",
      });
    }
  };

  const loadAlertHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('alert_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setAlertHistory(data || []);
    } catch (error) {
      console.error('Error loading alert history:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar histórico de alertas",
        variant: "destructive",
      });
    }
  };

  const loadAll = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadAlertTypes(),
        loadEscalationContacts(),
        loadAlertConfigurations(),
        loadAlertHistory()
      ]);
    } finally {
      setLoading(false);
    }
  };

  const toggleAlertType = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('alert_types')
        .update({ is_active: isActive })
        .eq('id', id);

      if (error) throw error;

      setAlertTypes(prev => 
        prev.map(alert => 
          alert.id === id ? { ...alert, is_active: isActive } : alert
        )
      );

      toast({
        title: "Sucesso",
        description: `Alerta ${isActive ? 'ativado' : 'desativado'} com sucesso`,
        className: "bg-green-500 text-white",
      });
    } catch (error) {
      console.error('Error toggling alert type:', error);
      toast({
        title: "Erro",
        description: "Falha ao atualizar alerta",
        variant: "destructive",
      });
    }
  };

  const addEscalationContact = async (contact: Omit<EscalationContact, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('escalation_contacts')
        .insert([contact])
        .select()
        .single();

      if (error) throw error;

      setEscalationContacts(prev => [...prev, data]);

      toast({
        title: "Sucesso",
        description: "Contato de escalação adicionado com sucesso",
        className: "bg-green-500 text-white",
      });

      return data;
    } catch (error) {
      console.error('Error adding escalation contact:', error);
      toast({
        title: "Erro",
        description: "Falha ao adicionar contato",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateEscalationContact = async (id: string, contact: Omit<EscalationContact, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('escalation_contacts')
        .update(contact)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setEscalationContacts(prev => 
        prev.map(c => c.id === id ? data : c)
      );

      toast({
        title: "Sucesso",
        description: "Contato atualizado com sucesso",
        className: "bg-green-500 text-white",
      });

      return data;
    } catch (error) {
      console.error('Error updating escalation contact:', error);
      toast({
        title: "Erro",
        description: "Falha ao atualizar contato",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteEscalationContact = async (id: string) => {
    try {
      const { error } = await supabase
        .from('escalation_contacts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setEscalationContacts(prev => prev.filter(c => c.id !== id));

      toast({
        title: "Sucesso",
        description: "Contato removido com sucesso",
        className: "bg-green-500 text-white",
      });
    } catch (error) {
      console.error('Error deleting escalation contact:', error);
      toast({
        title: "Erro",
        description: "Falha ao remover contato",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  return {
    alertTypes,
    escalationContacts,
    alertConfigurations,
    alertHistory,
    loading,
    loadAll,
    toggleAlertType,
    addEscalationContact,
    updateEscalationContact,
    deleteEscalationContact
  };
};