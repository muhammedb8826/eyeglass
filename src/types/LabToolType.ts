export interface LabToolType {
  id: string;
  code?: string;
  baseCurveMin: number;
  baseCurveMax: number;
  quantity: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface LabToolListResponse {
  labTools: LabToolType[];
  total: number;
}

export interface LabToolCheckResponse {
  missing: number[];
}
