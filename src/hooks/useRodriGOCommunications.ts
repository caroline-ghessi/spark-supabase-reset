import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CommunicationLog {
  id: string;
  sender_id: string;
  sender_name: string;
  recipient_number: string;
  message_content: string;
  message_type: string;
  context_type: string;
  whapi_message_id?: string;
  status: string;
  metadata: any;
  created_at: string;
  updated_at: string;
}

export interface AlertRule {
  id: string;
  name: string;
  rule_type: string;
  conditions: any;
  actions: any;
  is_active: boolean;
  cooldown_minutes: number;
  metadata: any;
  created_at: string;
  updated_at: string;
}

export const useRodriGOCommunications = () => {
  const [communicationLogs, setCommunicationLogs] = useState<CommunicationLog[]>([]);
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  // Carregar logs de comunicação
  const loadCommunicationLogs = useCallback(async (limit = 100) => {
    try {
      const { data, error } = await supabase
        .from('communication_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      setCommunicationLogs(data || []);
    } catch (error) {
      console.error('Erro ao carregar logs de comunicação:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar logs de comunicação",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Carregar regras de alerta
  const loadAlertRules = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('alert_rules')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAlertRules(data || []);
    } catch (error) {
      console.error('Erro ao carregar regras de alerta:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar regras de alerta",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Carregar dados iniciais
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          loadCommunicationLogs(),
          loadAlertRules()
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [loadCommunicationLogs, loadAlertRules]);

  // Enviar mensagem via Rodri.GO
  const sendMessage = useCallback(async (
    toNumber: string,
    message: string,
    contextType: CommunicationLog['context_type'] = 'general',
    metadata: any = {}
  ) => {
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('rodrigo-send-message', {
        body: {
          to_number: toNumber,
          message: message,
          context_type: contextType,
          metadata: metadata
        }
      });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Mensagem enviada via Rodri.GO",
        className: "bg-green-500 text-white",
      });

      // Recarregar logs
      await loadCommunicationLogs();
      
      return data;
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast({
        title: "Erro",
        description: "Falha ao enviar mensagem via Rodri.GO",
        variant: "destructive",
      });
      throw error;
    } finally {
      setSending(false);
    }
  }, [toast, loadCommunicationLogs]);

  // Enviar alerta para gerência
  const sendManagementAlert = useCallback(async (
    alertType: string,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium',
    conversationId?: string,
    sellerId?: string,
    customMessage?: string,
    metadata: any = {}
  ) => {
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-management-alert', {
        body: {
          alert_type: alertType,
          severity: severity,
          conversation_id: conversationId,
          seller_id: sellerId,
          custom_message: customMessage,
          metadata: metadata
        }
      });

      if (error) throw error;

      toast({
        title: "Alerta Enviado",
        description: `Alerta de ${severity} enviado para a gerência`,
        className: severity === 'critical' || severity === 'high' ? "bg-red-500 text-white" : "bg-orange-500 text-white",
      });

      // Recarregar logs
      await loadCommunicationLogs();
      
      return data;
    } catch (error) {
      console.error('Erro ao enviar alerta:', error);
      toast({
        title: "Erro",
        description: "Falha ao enviar alerta para gerência",
        variant: "destructive",
      });
      throw error;
    } finally {
      setSending(false);
    }
  }, [toast, loadCommunicationLogs]);

  // Notificar vendedor
  const notifyVendor = useCallback(async (
    vendorPhone: string,
    message: string,
    metadata: any = {}
  ) => {
    return await sendMessage(vendorPhone, message, 'notification', {
      type: 'vendor_notification',
      ...metadata
    });
  }, [sendMessage]);

  // Escalar problema
  const escalateProblem = useCallback(async (
    problemType: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    description: string,
    conversationId?: string,
    sellerId?: string
  ) => {
    return await sendManagementAlert(
      problemType,
      severity,
      conversationId,
      sellerId,
      description,
      { escalated: true, timestamp: new Date().toISOString() }
    );
  }, [sendManagementAlert]);

  // Atualizar regra de alerta
  const updateAlertRule = useCallback(async (
    ruleId: string,
    updates: Partial<AlertRule>
  ) => {
    try {
      const { data, error } = await supabase
        .from('alert_rules')
        .update(updates)
        .eq('id', ruleId)
        .select()
        .single();

      if (error) throw error;

      setAlertRules(prev => 
        prev.map(rule => rule.id === ruleId ? data : rule)
      );

      toast({
        title: "Sucesso",
        description: "Regra de alerta atualizada",
        className: "bg-green-500 text-white",
      });

      return data;
    } catch (error) {
      console.error('Erro ao atualizar regra:', error);
      toast({
        title: "Erro",
        description: "Falha ao atualizar regra de alerta",
        variant: "destructive",
      });
      throw error;
    }
  }, [toast]);

  // Filtrar logs por contexto
  const getLogsByContext = useCallback((contextType: CommunicationLog['context_type']) => {
    return communicationLogs.filter(log => log.context_type === contextType);
  }, [communicationLogs]);

  // Estatísticas de comunicação
  const getStats = useCallback(() => {
    const total = communicationLogs.length;
    const byContext = communicationLogs.reduce((acc, log) => {
      acc[log.context_type] = (acc[log.context_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byStatus = communicationLogs.reduce((acc, log) => {
      acc[log.status] = (acc[log.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      byContext,
      byStatus,
      todayCount: communicationLogs.filter(log => 
        new Date(log.created_at).toDateString() === new Date().toDateString()
      ).length
    };
  }, [communicationLogs]);

  return {
    // Data
    communicationLogs,
    alertRules,
    loading,
    sending,

    // Actions
    sendMessage,
    sendManagementAlert,
    notifyVendor,
    escalateProblem,
    updateAlertRule,

    // Utilities
    loadCommunicationLogs,
    loadAlertRules,
    getLogsByContext,
    getStats,

    // Quick access to specific log types
    notifications: getLogsByContext('notification'),
    alerts: getLogsByContext('alert'),
    escalations: getLogsByContext('escalation'),
    generalMessages: getLogsByContext('general')
  };
};