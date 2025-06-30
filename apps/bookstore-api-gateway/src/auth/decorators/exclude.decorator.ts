import { SetMetadata } from '@nestjs/common';

export const EXCLUDE_ENDPOINTS = 'exclude_endpoints';
export const ExcludeEndPoints = (...endpoints: { method: string, url: string }[]) => SetMetadata(EXCLUDE_ENDPOINTS, endpoints);
