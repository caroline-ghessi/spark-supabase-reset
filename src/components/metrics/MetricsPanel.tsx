
import { ScrollArea } from '../ui/scroll-area';
import { AnalyticsLayout } from '../analytics/AnalyticsLayout';

export const MetricsPanel = () => {
  return (
    <div className="flex flex-col h-full bg-gray-50">
      <ScrollArea className="flex-1">
        <AnalyticsLayout />
      </ScrollArea>
    </div>
  );
};
