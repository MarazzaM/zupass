export interface User {
  /** Public UUID */
  uuid: string;

  /** Semaphore public commitment */
  commitment: string;

  /** Email address they used to register */
  email: string;

  /** Salt used to secure user's password */
  salt: string | null;

  /** PCDpass-specific user metadata */
  superuserEventConfigIds?: string[];

  /** Zuzalu-specific user metadata */
  name?: string;
  role?: ZuzaluUserRole | undefined;
  visitor_date_ranges?: DateRange[] | null;
}

export interface DateRange {
  date_from?: string | null;
  date_to?: string | null;
}

export interface FullDateRange {
  date_from: string;
  date_to: string;
}

export const enum ZuzaluUserRole {
  Visitor = "visitor",
  Resident = "resident",
  Organizer = "organizer"
}
