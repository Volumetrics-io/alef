export const tagKeys = ['type', 'category', 'style'] as const;

export type TagKey = (typeof tagKeys)[number];

export function isTagKey(key: string): key is TagKey {
	return tagKeys.includes(key as any);
}

export function assertTagKey(key: string): asserts key is TagKey {
	if (!isTagKey(key)) {
		throw new Error(`Invalid tag key: ${key}`);
	}
}

export function formatTag(key: TagKey, value: string) {
	return `${key}:${value}`;
}
