import { knexInstance as db } from '../config/db';

export const getReportsFromDB = async () => {
	const postReports = await db('reported_posts')
		.select(
			'reported_posts.id as reportId',
			'reported_posts.post_id as contentId',
			'reported_posts.user_id as reportedBy',
		)
		.then((rows) =>
			rows.map((row) => ({
				...row,
				contentType: 'post',
				status: 'pending',
			})),
		);

	const commentReports = await db('reported_comments')
		.select(
			'reported_comments.id as reportId',
			'reported_comments.comment_id as contentId',
			'reported_comments.user_id as reportedBy',
		)
		.then((rows) =>
			rows.map((row) => ({
				...row,
				contentType: 'comment',
				status: 'pending',
			})),
		);

	return [...postReports, ...commentReports];
};

export const markReportAsResolved = async (reportId: string) => {
	const updatedPost = await db('reported_posts')
		.where({ id: reportId })
		.update({ resolved: true });

	if (updatedPost > 0) return;

	const updatedComment = await db('reported_comments')
		.where({ id: reportId })
		.update({ resolved: true });

	if (updatedComment === 0) {
		throw new Error('No report found with the given ID');
	}
};
