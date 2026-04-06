/**
 * Validates a .nomos contract JSON object.
 * The full NomosContract type is complex — this checks the fields the matching
 * engine actually reads so upload/import errors surface immediately.
 */
export function validateNomosContract(data: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Contract must be a JSON object'] };
  }

  const contract = data as Record<string, unknown>;

  // nomos_version
  if (!contract.nomos_version) {
    errors.push('Missing required field: nomos_version');
  }

  // service.category
  const service = contract.service as Record<string, unknown> | undefined;
  if (!service) {
    errors.push('Missing required field: service');
  } else if (typeof service.category !== 'string' || !service.category) {
    errors.push('service.category must be a non-empty string (e.g. "home_services.plumbing.repair")');
  }

  // service_area.zones
  const serviceArea = contract.service_area as Record<string, unknown> | undefined;
  if (!serviceArea) {
    errors.push('Missing required field: service_area');
  } else if (!Array.isArray(serviceArea.zones) || serviceArea.zones.length === 0) {
    errors.push('service_area.zones must be a non-empty array of zone strings');
  }

  // availability.lead_time_hours
  const availability = contract.availability as Record<string, unknown> | undefined;
  if (!availability) {
    errors.push('Missing required field: availability');
  } else if (typeof availability.lead_time_hours !== 'number') {
    errors.push('availability.lead_time_hours must be a number');
  }

  // pricing.model
  const pricing = contract.pricing as Record<string, unknown> | undefined;
  if (!pricing) {
    errors.push('Missing required field: pricing');
  } else if (!['fixed', 'tiered', 'hourly', 'quote'].includes(pricing.model as string)) {
    errors.push('pricing.model must be one of: fixed, tiered, hourly, quote');
  }

  return { valid: errors.length === 0, errors };
}
