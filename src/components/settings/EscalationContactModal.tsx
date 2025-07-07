import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { EscalationContact } from '../../hooks/useAlertsSystem';

const escalationContactSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  role: z.string().min(2, 'Cargo é obrigatório'),
  escalation_level: z.number().min(1).max(5),
  whatsapp_number: z.string().min(10, 'Número de WhatsApp inválido'),
  email: z.string().email('Email inválido'),
  work_schedule: z.object({
    start: z.string().default('08:00'),
    end: z.string().default('18:00'),
    days: z.array(z.string()).default(['mon', 'tue', 'wed', 'thu', 'fri'])
  }).default({
    start: '08:00',
    end: '18:00',
    days: ['mon', 'tue', 'wed', 'thu', 'fri']
  })
});

type EscalationContactFormData = z.infer<typeof escalationContactSchema>;

interface EscalationContactModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact?: EscalationContact | null;
  onSave: (data: Omit<EscalationContact, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
}

export const EscalationContactModal = ({
  open,
  onOpenChange,
  contact,
  onSave
}: EscalationContactModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<EscalationContactFormData>({
    resolver: zodResolver(escalationContactSchema),
    defaultValues: {
      name: contact?.name || '',
      role: contact?.role || '',
      escalation_level: contact?.escalation_level || 1,
      whatsapp_number: contact?.whatsapp_number || '',
      email: contact?.email || '',
      work_schedule: contact?.work_schedule || {
        start: '08:00',
        end: '18:00',
        days: ['mon', 'tue', 'wed', 'thu', 'fri']
      }
    }
  });

  const handleSubmit = async (data: EscalationContactFormData) => {
    setIsSubmitting(true);
    try {
      await onSave({
        name: data.name,
        role: data.role,
        escalation_level: data.escalation_level,
        whatsapp_number: data.whatsapp_number,
        email: data.email,
        work_schedule: data.work_schedule,
        is_active: true
      });
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error('Erro ao salvar contato:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {contact ? 'Editar Contato' : 'Adicionar Novo Contato'}
          </DialogTitle>
          <DialogDescription>
            {contact 
              ? 'Edite as informações do contato de escalação.'
              : 'Adicione um novo contato para escalação de alertas.'
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome completo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cargo</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Gerente de Vendas" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="escalation_level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nível de Escalação</FormLabel>
                  <Select 
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    defaultValue={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o nível" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">Nível 1 - Supervisão</SelectItem>
                      <SelectItem value="2">Nível 2 - Gerência</SelectItem>
                      <SelectItem value="3">Nível 3 - Diretoria</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="whatsapp_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>WhatsApp</FormLabel>
                    <FormControl>
                      <Input placeholder="51999887766" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="email@empresa.com" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="work_schedule.start"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hora Início</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="work_schedule.end"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hora Fim</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Salvando...' : contact ? 'Atualizar' : 'Adicionar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};