
import React from 'react';
import { NavigableSidebar } from './NavigableSidebar';

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onPageChange }) => {
  return <NavigableSidebar currentPage={currentPage} onPageChange={onPageChange} />;
};
