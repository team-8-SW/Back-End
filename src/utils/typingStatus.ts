const typingMap = new Map<string, NodeJS.Timeout>();

// Generate a consistent key for sender → receiver
const typingKey = (from: string, to: string) => `${from}_${to}`;

export const setUserTyping = (fromUserId: string, toUserId: string, timeout = 45000) => {
	const key = typingKey(fromUserId, toUserId);

	// Clear previous timeout if it exists
	if (typingMap.has(key)) clearTimeout(typingMap.get(key)!);

	// Set the flag with a timeout
	typingMap.set(
		key,
		setTimeout(() => {
			typingMap.delete(key);
		}, timeout),
	);
};

export const isUserTypingTo = (fromUserId: string, toUserId: string): boolean => {
	const key = typingKey(fromUserId, toUserId);
	return typingMap.has(key);
};
