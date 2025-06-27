
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserManagement } from './UserManagement';
import { MaterialLibrary } from '../library/MaterialLibrary';
import { AuditSystem } from '../audit/AuditSystem';
import { PermissionGate } from './PermissionGate';
import { Users, BookOpen, Shield } from 'lucide-react';

export const UsersAndLibraryPanel = () => {
  return (
    <div className="p-6 space-y-6">
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users" className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>Usuários</span>
          </TabsTrigger>
          <TabsTrigger value="library" className="flex items-center space-x-2">
            <BookOpen className="w-4 h-4" />
            <span>Biblioteca</span>
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center space-x-2">
            <Shield className="w-4 h-4" />
            <span>Auditoria</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <PermissionGate permission="gerenciar_usuarios">
            <UserManagement />
          </PermissionGate>
        </TabsContent>

        <TabsContent value="library">
          <PermissionGate permission="visualizar_biblioteca_materiais">
            <MaterialLibrary />
          </PermissionGate>
        </TabsContent>

        <TabsContent value="audit">
          <PermissionGate permission="acessar_auditoria">
            <AuditSystem />
          </PermissionGate>
        </TabsContent>
      </Tabs>
    </div>
  );
};
