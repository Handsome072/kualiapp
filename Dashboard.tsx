
import React from 'react';
import { WelcomeSection } from './WelcomeSection';
import { StatsOverview } from './StatsOverview';
import { CriteriaProgress } from './CriteriaProgress';
import { UpcomingTasks } from './UpcomingTasks';
import { QuickAccess } from './QuickAccess';
import { OrganismType, AuditState, NonConformity } from './types';

interface DashboardProps {
  organismType: OrganismType;
  auditStates: AuditState[];
  ncList: NonConformity[];
  alertsCount: number;
  docsCount: number;
  onNavigate: (page: any) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  organismType, 
  auditStates, 
  ncList, 
  alertsCount, 
  docsCount,
  onNavigate 
}) => {
  const readiness = auditStates.length > 0 
    ? Math.round((auditStates.filter(s => s.status === 'Ready').length / 32) * 100) 
    : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <WelcomeSection organismType={organismType} />
        <QuickAccess onAction={onNavigate} />
      </div>

      <StatsOverview 
        readiness={readiness} 
        ncCount={ncList.filter(n => n.status !== 'Closed').length} 
        alertsCount={alertsCount} 
        docsCount={docsCount} 
      />

      <div className="space-y-8">
        <CriteriaProgress auditStates={auditStates} />
        
        <UpcomingTasks 
          ncList={ncList} 
          onNavigateToNC={() => onNavigate('nc')} 
        />
      </div>
    </div>
  );
};
