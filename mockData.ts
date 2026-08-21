import { ReportItem, RecurringIssue, AnalyticsData } from '../types';

export const INITIAL_REPORTS: ReportItem[] = [
  {
    id: 'RPT-8832',
    trackingNumber: 'CW-2023-894',
    title: 'Water Main Break - Downtown Sector',
    description: 'Multiple citizen reports indicate a massive water main rupture at the intersection of 5th Ave and Main St. Flooding is currently affecting ground-level businesses and obstructing two lanes of northbound traffic. Significant drop in water pressure reported in the immediate three-block radius. Risk of foundation undermining if not isolated immediately.',
    issueType: 'water',
    issueTypeName: 'Water Main Break',
    iconName: 'water_drop',
    aiConfidence: 95,
    suggestedDept: 'Water & Sewer',
    actualDept: 'Water & Sewer',
    priority: 'urgent',
    status: 'In Progress',
    createdAt: '10 min ago',
    timestamp: 'Oct 24, 2023, 09:42 AM',
    location: {
      address: '4200 Block, Maple Avenue',
      crossStreet: 'Near intersection with 5th St.',
      sector: 'Sector 4',
      lat: 37.7749,
      lng: -122.4194
    },
    evidenceImages: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBn8P4FigJlJH3kp296j5JqL798p_xLk-jPZB6A8RPtViH4kuF9JiSwApo1w6aw5RPQcCKdmg2PIMWpiZgtdgPSxF2Va12Sf1qsUtgBarNk_ImWig3Ss8Ec-p9lWtP-XUhgrzQ556xOzI_zyd8QXpEGLtRAHtN90P9IfStMoscu6NNG4JxN_GjH7RwtNDvlMdfLC3OwVP2-ymtV02JSGXNo6zCrusgywkOwIQORNpja-3U_2W3l6ALMNA'
    ],
    aiGist: {
      summary: 'Multiple citizen reports indicate a massive water main rupture at the intersection of 5th Ave and Main St. Flooding is currently affecting ground-level businesses and obstructing two lanes of northbound traffic. Significant drop in water pressure reported in the immediate three-block radius. Risk of foundation undermining if not isolated immediately.',
      impact: 'High',
      riskScore: 94,
      infrastructureImpact: 'High',
      publicSafetyRisk: 'Moderate',
      keywords: ['pavement bubbling', 'continuous flow', 'water pressure drop', 'subsurface rupture'],
      explanation: 'Assigned to Water & Sewer due to detected keywords ("pavement bubbling", "continuous flow") and image analysis indicating a pressurized subsurface leak rather than surface runoff.'
    },
    coordination: {
      teamMembers: [
        {
          id: 'tm-1',
          name: 'S. Connor',
          role: 'Lead Engineer',
          status: 'En Route',
          avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB9kubrfCHrQ24_ieglts_WhP43-V-oUxNCE7S7v5iI2xTrK7jhaG25MCKHpszh_BMOyqV6TKcfvuc6pngRJTlffeZ1xR9_lC6jDqMS46FS2ervZAwRL8AcIG_HFKj2YKaz6ZZbVBIFUVXBy8AE0bC9npMtQCZOFCVu6D-4JFnEUPKbcyOMTSelENLo8xRM43EJIit5DjmzafVeN8wY1kfRpLqu2JLLjEDfpBeWoeNnPjJ1KAQzbN7kZQ'
        },
        {
          id: 'tm-2',
          name: 'J. Miller',
          role: 'Traffic Control',
          status: 'On Scene',
          avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDE-AW55jcZ5IlwbaCDBokR7x3l2jAIpSkzjMAw27F-tVjgGCjGvFpXreVJR0MjGqQ3SasJIhIVwQWubouALIU1peNPSPD4n7bSf64vSR66B6nYLQtjokymqhqxudzQOM6fht8OwIDqE-8IF8cYdjWeuYAfRzaAEr5ksMljxWETai8T4mPv46hnbWSKRH86N-iQBc91nmdlt6PZBtjFc5KywzYzbTGQzpGWvlJcLfASY40Y230FarAqiA'
        }
      ]
    },
    routingLog: [
      {
        time: '10:42 AM - Today',
        title: 'Assigned to Field Unit 4',
        detail: 'Manual assignment by Dispatcher K. Lin',
        type: 'assignment'
      },
      {
        time: '10:38 AM - Today',
        title: 'Department Hand-off',
        detail: 'Handed off to emergency dispatch queue',
        type: 'handoff',
        badge: 'Dept of Public Works'
      },
      {
        time: '10:35 AM - Today',
        title: 'AI Classification',
        detail: "Categorized as 'Water Utility Emergency' with 98% confidence.",
        type: 'ai'
      },
      {
        time: '10:32 AM - Today',
        title: 'Initial Intake',
        detail: 'Via Citizen Mobile App (Geo-tagged)',
        type: 'intake'
      }
    ],
    duplicateOf: 'CAS-402',
    similarityScore: 98
  },
  {
    id: 'RPT-8831',
    trackingNumber: 'CW-2023-893',
    title: 'Deep Pothole on 3rd & Washington Blvd',
    description: 'Hazardous deep pothole approx 8 inches deep in right-hand driving lane. Several vehicles swerving into oncoming traffic to avoid wheel rim damage.',
    issueType: 'pothole',
    issueTypeName: 'Deep Pothole',
    iconName: 'warning',
    aiConfidence: 82,
    suggestedDept: 'Transportation',
    priority: 'high',
    status: 'Pending Review',
    createdAt: '1 hr ago',
    timestamp: 'Oct 24, 2023, 08:30 AM',
    location: {
      address: '1400 Block, Maple St.',
      crossStreet: 'Washington Blvd',
      sector: 'Sector 2',
      lat: 37.7755,
      lng: -122.422
    },
    evidenceImages: [],
    aiGist: {
      summary: 'Deep roadway depression causing severe tire hazard in active transit corridor. Immediate cold-patch repair recommended.',
      impact: 'Moderate',
      riskScore: 78,
      infrastructureImpact: 'Moderate',
      publicSafetyRisk: 'High',
      keywords: ['deep pothole', 'rim damage', 'traffic disruption'],
      explanation: 'Routed to Transportation Road Maintenance based on image edge analysis and depth evaluation.'
    },
    routingLog: [
      {
        time: '08:32 AM - Today',
        title: 'AI Classification',
        detail: "Categorized as 'Road Hazard - Pothole' with 82% confidence.",
        type: 'ai'
      },
      {
        time: '08:30 AM - Today',
        title: 'Initial Intake',
        detail: 'Submitted via Web Citizen Portal',
        type: 'intake'
      }
    ]
  },
  {
    id: 'RPT-8830',
    trackingNumber: 'CW-2023-892',
    title: 'Fallen Tree Branch Obstructing Sidewalk',
    description: 'Large oak branch broken off during morning storm, blocking entire pedestrian pathway near school crosswalk.',
    issueType: 'tree',
    issueTypeName: 'Fallen Tree Branch',
    iconName: 'park',
    aiConfidence: 60,
    suggestedDept: 'Parks & Rec',
    priority: 'normal',
    status: 'Pending Review',
    createdAt: '2 hrs ago',
    timestamp: 'Oct 24, 2023, 07:15 AM',
    location: {
      address: 'Oak Park North Entrance',
      crossStreet: 'Parkway Ave',
      sector: 'Sector 1',
      lat: 37.771,
      lng: -122.415
    },
    evidenceImages: [],
    aiGist: {
      summary: 'Fallen vegetation obstructing ADA walkway. Requires chainsaw crew and organic waste removal.',
      impact: 'Low',
      riskScore: 45,
      infrastructureImpact: 'Low',
      publicSafetyRisk: 'Moderate',
      keywords: ['fallen branch', 'sidewalk blockage', 'tree debris'],
      explanation: 'Routed to Parks & Recreation Urban Forestry unit.'
    },
    routingLog: [
      {
        time: '07:18 AM - Today',
        title: 'AI Classification',
        detail: "Categorized as 'Tree Hazard' with 60% confidence.",
        type: 'ai'
      },
      {
        time: '07:15 AM - Today',
        title: 'Initial Intake',
        detail: 'Submitted via Citizen Mobile App',
        type: 'intake'
      }
    ]
  },
  {
    id: 'RPT-8829',
    trackingNumber: 'CW-2023-891',
    title: 'Broken Streetlight / Flickering Luminaire',
    description: 'High-pressure sodium fixture is dead, leaving pedestrian crossing pitch dark at night.',
    issueType: 'streetlight',
    issueTypeName: 'Street Light',
    iconName: 'lightbulb',
    aiConfidence: 91,
    suggestedDept: 'Electrical & Lighting',
    priority: 'normal',
    status: 'Dispatched',
    createdAt: '3 hrs ago',
    timestamp: 'Oct 24, 2023, 06:10 AM',
    location: {
      address: 'Main St & 5th Ave',
      crossStreet: '5th Ave',
      sector: 'Sector 4',
      lat: 37.7735,
      lng: -122.418
    },
    evidenceImages: [],
    aiGist: {
      summary: 'Luminaire ballast failure reported on pole #LP-4091. Standard electrical maintenance ticket.',
      impact: 'Low',
      riskScore: 38,
      infrastructureImpact: 'Low',
      publicSafetyRisk: 'Moderate',
      keywords: ['streetlight', 'dark intersection', 'bulb failure'],
      explanation: 'Categorized to Electrical Division for ballast replacement.'
    }
  },
  {
    id: 'RPT-8828',
    trackingNumber: 'CW-2023-890',
    title: 'Graffiti on Pedestrian Overpass Support',
    description: 'Fresh spray paint tags covering safety signage and municipal wall.',
    issueType: 'graffiti',
    issueTypeName: 'Graffiti',
    iconName: 'format_paint',
    aiConfidence: 89,
    suggestedDept: 'Public Works',
    priority: 'low',
    status: 'Pending Review',
    createdAt: '4 hrs ago',
    timestamp: 'Oct 24, 2023, 05:00 AM',
    location: {
      address: 'Riverwalk Path Sect. 3',
      crossStreet: 'River Rd',
      sector: 'Sector 3',
      lat: 37.778,
      lng: -122.425
    },
    evidenceImages: [],
    aiGist: {
      summary: 'Graffiti abatement required on concrete surface. Non-emergency cleanup.',
      impact: 'Low',
      riskScore: 22,
      infrastructureImpact: 'Low',
      publicSafetyRisk: 'Low',
      keywords: ['graffiti', 'spray paint', 'abatement'],
      explanation: 'Routed to Public Works Graffiti Abatement Team.'
    }
  },
  {
    id: 'RPT-8827',
    trackingNumber: 'CW-2023-889',
    title: 'Illegal Construction Dumping in Alleyway',
    description: 'Drywall, broken concrete tiles, and paint cans dumped in public right-of-way behind commercial plaza.',
    issueType: 'dumping',
    issueTypeName: 'Illegal Dumping',
    iconName: 'delete',
    aiConfidence: 93,
    suggestedDept: 'Sanitation',
    priority: 'high',
    status: 'Pending Review',
    createdAt: '5 hrs ago',
    timestamp: 'Oct 24, 2023, 04:15 AM',
    location: {
      address: 'Elm St. Transit Station',
      crossStreet: 'Station Way',
      sector: 'Sector 5',
      lat: 37.776,
      lng: -122.412
    },
    evidenceImages: [],
    aiGist: {
      summary: 'Commercial building refuse blocking dumpster access and stormwater drain entrance.',
      impact: 'Moderate',
      riskScore: 68,
      infrastructureImpact: 'Moderate',
      publicSafetyRisk: 'Moderate',
      keywords: ['illegal dumping', 'construction waste', 'hazardous paint'],
      explanation: 'Routed to Sanitation Enforcement & Heavy Cleanup crew.'
    }
  }
];

export const RECURRING_ISSUES: RecurringIssue[] = [
  {
    id: 'rec-1',
    location: '1400 Block, Maple St.',
    issueType: 'Potholes / Street Damage',
    reportCount: 42,
    urgency: 'urgent',
    lat: 37.7749,
    lng: -122.4194,
    dotColor: '#ba1a1a' // error red
  },
  {
    id: 'rec-2',
    location: 'Oak Park North Entrance',
    issueType: 'Broken Streetlight',
    reportCount: 28,
    urgency: 'high',
    lat: 37.771,
    lng: -122.415,
    dotColor: '#ba1a1a'
  },
  {
    id: 'rec-3',
    location: 'Main St & 5th Ave',
    issueType: 'Traffic Signal Malfunction',
    reportCount: 19,
    urgency: 'normal',
    lat: 37.7735,
    lng: -122.418,
    dotColor: '#006a61' // teal
  },
  {
    id: 'rec-4',
    location: 'Riverwalk Path Sect. 3',
    issueType: 'Graffiti / Vandalism',
    reportCount: 15,
    urgency: 'low',
    lat: 37.778,
    lng: -122.425,
    dotColor: '#bec6e0' // slate/purple
  },
  {
    id: 'rec-5',
    location: 'Elm St. Transit Station',
    issueType: 'Sanitation Issue',
    reportCount: 12,
    urgency: 'normal',
    lat: 37.776,
    lng: -122.412,
    dotColor: '#565e74'
  }
];

export const ANALYTICS_STATS: AnalyticsData = {
  autoRouteAccuracy: 94.8,
  autoRouteDiff: '+4.2% vs Last Mo',
  avgTriageTime: '2.4h',
  avgTriageDiff: '-1.5h vs Last Mo',
  avgResolutionTime: '72h',
  avgResolutionDiff: '+12h vs Last Mo',
  escalationRate: '3.2%',
  escalationStatus: 'Stable',
  totalReportsQ3: 1428,
  resolvedQ3: 1354
};
