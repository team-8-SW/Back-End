import { UUID } from 'crypto';

export interface Profile {
	id: UUID;
	userId: UUID;
	headline?: string;
	bio?: string;
	location?: string;
	industry?: string;
	profilePictureUrl?: string;
	coverPhotoUrl?: string;
	resumeUrl?: string;
	lastUpdated: Date;
	numConnections: number;
}

export interface WorkExperience {
	id: UUID; // UUID
	userId: UUID; // UUID of the user
	companyName: string;
	position: string;
	startDate: Date;
	endDate?: Date | null; // Nullable for current jobs
	currentJob: boolean;
	description?: string | null;
	location?: string | null;
}

export interface UserEducation {
	id: UUID;
	userId: UUID;
	universityId: string;
	degree?: string;
	fieldOfStudy?: string;
	startDate: Date;
	endDate?: Date | null;
	currentEducation: boolean;
	description?: string;
	grade?: string;
}

export interface University {
	id: UUID;
	universityName: string;
}

export interface Certification {
	id: UUID;
	userId: UUID;
	name: string;
	issuingOrganization: string;
	issueDate: Date;
	expirationDate?: Date | null;
	credentialUrl?: string | null;
}
export interface UserPrivacySettings {
	id: UUID;
	userId: UUID;
	profileVisibility: 'public' | 'private' | 'connections-only';
	showEmail: boolean;
	allowConnectionRequests: boolean;
	allowMessagesFromNonConnections: boolean;
	showActiveStatus: boolean;
}
