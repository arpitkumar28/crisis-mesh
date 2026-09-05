import { IsOptional, IsUUID } from 'class-validator';

/**
 * assigned_to is required but nullable: a real UUID assigns/reassigns the
 * incident to that responder, `null` explicitly unassigns it. Omitting the
 * field entirely is rejected by the controller — an assignment call should
 * never be ambiguous about intent.
 */
export class AssignIncidentDto {
  @IsOptional()
  @IsUUID()
  assigned_to?: string | null;
}
