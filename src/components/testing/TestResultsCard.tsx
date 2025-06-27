
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TestResult } from './types';
import { TestItem } from './TestStatusUtils';

interface TestResultsCardProps {
  tests: TestResult[];
}

export const TestResultsCard: React.FC<TestResultsCardProps> = ({ tests }) => (
  <Card>
    <CardHeader>
      <CardTitle>Resultados dos Testes</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        {tests.map((test, index) => (
          <TestItem key={index} test={test} index={index} />
        ))}
      </div>
    </CardContent>
  </Card>
);
