export interface StorageOverview {
  total: number;
  used: number;
  remaining: number;
  usedPercentage: number;
}

export interface CategoryStats {
  count: number;
  totalSize: number;
}

export interface AnalyticsData {
  storage: StorageOverview;
  folders: {
    count: number;
    totalSize: number;
  };
  notes: CategoryStats;
  images: CategoryStats;
  pdfs: CategoryStats;
  recentUploads: {
    _id: string;
    name: string;
    type: string;
    size: number;
    createdAt: Date;
  }[];
}
