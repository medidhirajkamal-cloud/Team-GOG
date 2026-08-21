export type AppView = 'intake' | 'triage' | 'cases' | 'case-detail' | 'tracking' | 'analytics' | 'archive' | 'support';

export type UserRole = 'citizen' | 'staff';

export type PriorityLevel = 'urgent' | 'high' | 'normal' | 'low';

export type DepartmentType = 'Water & Sewer' | 'Transportation' | 'Parks & Rec' | 'Sanitation' | 'Public Works' | 'Electrical & Lighting';

export interface ReportItem {
  id: string;
  trackingNumber: string;
  title: string;
  description: string;
  issueType: 'pothole' | 'streetlight' | 'graffiti' | 'dumping' | 'tree' | 'water' | 'other';
  issueTypeName: string;
  iconName: string;
  aiConfidence: number;
  suggestedDept: DepartmentType;
  actualDept?: DepartmentType;
  priority: PriorityLevel;
  status: 'Pending Review' | 'In Progress' | 'Dispatched' | 'Resolved' | 'Merged';
  createdAt: string;
  timestamp: string;
  location: {
    address: string;
    crossStreet?: string;
    sector?: string;
    lat: number;
    lng: number;
  };
  evidenceImages: string[];
  aiGist?: {
    summary: string;
    impact: 'High' | 'Moderate' | 'Low';
    riskScore: number;
    infrastructureImpact: 'High' | 'Moderate' | 'Low';
    publicSafetyRisk: 'High' | 'Moderate' | 'Low';
    keywords: string[];
    explanation: string;
  };
  coordination?: {
    teamMembers: {
      id: string;
      name: string;
      role: string;
      status: 'En Route' | 'On Scene' | 'Standby' | 'Completed';
      avatar: string;
    }[];
  };
  routingLog?: {
    time: string;
    title: string;
    detail: string;
    type: 'intake' | 'ai' | 'handoff' | 'assignment' | 'dispatch' | 'resolution';
    badge?: string;
  }[];
  duplicateOf?: string;
  similarityScore?: number;
}

export interface RecurringIssue {
  id: string;
  location: string;
  issueType: string;
  reportCount: number;
  urgency: PriorityLevel;
  lat: number;
  lng: number;
  dotColor: string;
}

export interface AnalyticsData {
  autoRouteAccuracy: number;
  autoRouteDiff: string;
  avgTriageTime: string;
  avgTriageDiff: string;
  avgResolutionTime: string;
  avgResolutionDiff: string;
  escalationRate: string;
  escalationStatus: string;
  totalReportsQ3: number;
  resolvedQ3: number;
}
