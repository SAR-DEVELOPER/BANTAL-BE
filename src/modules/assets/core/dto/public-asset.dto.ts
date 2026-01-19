/**
 * Public Asset DTO
 * 
 * DTO for public asset viewing without authentication
 * Contains basic information: name, description, classification, company, location, status, and image availability
 */

export class PublicAssetDto {
  id: string;
  assetCode: string;
  name: string;
  description: string | null;
  isActive: boolean;
  currentCondition: string | null;
  
  // Classification
  assetGroup: {
    id: string;
    name: string;
    groupCode: string;
  } | null;
  assetType: {
    id: string;
    name: string;
    typeCode: string;
  } | null;
  
  // Company
  company: {
    id: string;
    name: string;
    companyCode: string;
  } | null;
  
  // Location
  office: {
    id: string;
    name: string;
    address?: string;
    officeCode: string;
  } | null;
  room: {
    id: string;
    name: string;
    roomCode: string;
  } | null;
  
  hasPhoto: boolean;
}
