import { CustomSizeGuideRequest } from '../requests/size-guide.request.model';

export interface MeasurementUnitResponse {
  key: string;
  name: string;
  abbreviation: string;
}

export interface SizeGuideTemplateOptionResponse {
  value: string; // UUID
  label: string;
}

export interface ProductSizeGuideResponse {
  sizeGuideTemplateId: string | null;
  sizeGuideTemplateName: string | null;
  customSizeGuide: CustomSizeGuideRequest | null;
  urlSizeGuide: string | null;
  sizeGuideUnitKey: string | null;
  sizeGuideUnitName: string | null;
  isCustom: boolean;
}

export interface SizeGuideTemplateResponse {
  id: string;
  name: string;
  description: string;
  measurementUnitKey: string;
  measurementUnitName: string;
  guideData: CustomSizeGuideRequest;
  urlGuide: string | null;
}
