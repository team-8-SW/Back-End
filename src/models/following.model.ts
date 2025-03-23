import { UUID } from 'crypto';

export interface Following {
	id: UUID;
	followerId: UUID;
	followedId: string;
	createdAt: Date;
}
