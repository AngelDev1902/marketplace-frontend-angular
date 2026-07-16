export interface MeasurementRangeRequest {
  min: number;
  max: number;
}

export interface SizeGuideRowRequest {
  sizeKey: string;
  values: { [key: string]: MeasurementRangeRequest };
}

export interface CustomSizeGuideRequest {
  columns: string[];
  rows: SizeGuideRowRequest[];
}

export interface ProductSizeGuideUpdateRequest {
  sizeGuideTemplateId?: string | null;
  customSizeGuide?: CustomSizeGuideRequest | null;
  urlSizeGuide?: string | null;
  sizeGuideUnitKey?: string | null;
  isCustom: boolean;
}
