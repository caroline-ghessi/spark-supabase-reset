import React, { useState } from 'react';
import { Download, Play, Pause, Volume2, FileText, Image as ImageIcon, Video, File, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface MediaMessageProps {
  messageType: string;
  fileUrl: string;
  fileName?: string;
  fileSize?: number;
  content?: string;
  metadata?: any;
}

export const MediaMessage: React.FC<MediaMessageProps> = ({
  messageType,
  fileUrl,
  fileName,
  fileSize,
  content,
  metadata
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB`;
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName || 'download';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Erro ao baixar arquivo:', error);
    }
  };

  const renderMediaContent = () => {
    switch (messageType) {
      case 'image':
        return (
          <div className="relative">
            <img
              src={fileUrl}
              alt="Imagem"
              className="max-w-full h-auto rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => setIsImageModalOpen(true)}
              style={{ maxHeight: '300px' }}
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 bg-black/50 text-white hover:bg-black/70"
              onClick={(e) => {
                e.stopPropagation();
                handleDownload();
              }}
            >
              <Download className="w-4 h-4" />
            </Button>
            {content && (
              <p className="mt-2 text-sm text-muted-foreground">{content}</p>
            )}
            
            {/* Modal para visualização ampliada */}
            {isImageModalOpen && (
              <div 
                className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
                onClick={() => setIsImageModalOpen(false)}
              >
                <div className="relative max-w-[90vw] max-h-[90vh]">
                  <img
                    src={fileUrl}
                    alt="Imagem ampliada"
                    className="max-w-full max-h-full object-contain"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 bg-black/50 text-white hover:bg-black/70"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsImageModalOpen(false);
                    }}
                  >
                    ✕
                  </Button>
                </div>
              </div>
            )}
          </div>
        );

      case 'video':
        return (
          <div className="relative">
            <video
              controls
              className="max-w-full h-auto rounded-lg"
              style={{ maxHeight: '300px' }}
              preload="metadata"
            >
              <source src={fileUrl} type={metadata?.media_mime_type || 'video/mp4'} />
              Seu navegador não suporta o elemento de vídeo.
            </video>
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 bg-black/50 text-white hover:bg-black/70"
              onClick={handleDownload}
            >
              <Download className="w-4 h-4" />
            </Button>
            {content && (
              <p className="mt-2 text-sm text-muted-foreground">{content}</p>
            )}
          </div>
        );

      case 'audio':
      case 'voice':
        return (
          <Card className="p-4 bg-muted/50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Volume2 className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <audio
                  controls
                  className="w-full"
                  preload="metadata"
                >
                  <source src={fileUrl} type={metadata?.media_mime_type || 'audio/ogg'} />
                  Seu navegador não suporta o elemento de áudio.
                </audio>
                {metadata?.media_duration && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Duração: {Math.floor(metadata.media_duration / 60)}:{(metadata.media_duration % 60).toString().padStart(2, '0')}
                  </p>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={handleDownload}>
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        );

      case 'document':
        return (
          <Card className="p-4 bg-muted/50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">{fileName || 'Documento'}</p>
                {fileSize && (
                  <p className="text-xs text-muted-foreground">{formatFileSize(fileSize)}</p>
                )}
              </div>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                Baixar
              </Button>
            </div>
          </Card>
        );

      case 'sticker':
        return (
          <div className="relative inline-block">
            <img
              src={fileUrl}
              alt="Sticker"
              className="max-w-32 h-auto rounded-lg"
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-1 right-1 bg-black/50 text-white hover:bg-black/70"
              onClick={handleDownload}
            >
              <Download className="w-3 h-3" />
            </Button>
          </div>
        );

      case 'link_preview':
        return (
          <Card className="p-4 bg-muted/50">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <ExternalLink className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm">{content}</p>
                {fileUrl && (
                  <a 
                    href={fileUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline mt-1 block"
                  >
                    Ver link
                  </a>
                )}
              </div>
            </div>
          </Card>
        );

      case 'contact':
        return (
          <Card className="p-4 bg-muted/50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">Contato Compartilhado</p>
                <p className="text-sm text-muted-foreground">{content || 'Informações de contato'}</p>
              </div>
            </div>
          </Card>
        );

      default:
        return (
          <Card className="p-4 bg-muted/50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <File className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">{fileName || 'Arquivo'}</p>
                <p className="text-xs text-muted-foreground">
                  Tipo: {messageType} {fileSize && `• ${formatFileSize(fileSize)}`}
                </p>
              </div>
              {fileUrl && (
                <Button variant="outline" size="sm" onClick={handleDownload}>
                  <Download className="w-4 h-4 mr-2" />
                  Baixar
                </Button>
              )}
            </div>
          </Card>
        );
    }
  };

  return (
    <div className="mt-2">
      {renderMediaContent()}
    </div>
  );
};