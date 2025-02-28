export const attributeKeys = ['type', 'category', 'style', 'package'] as const;

export type AttributeKey = (typeof attributeKeys)[number];
export type Attribute = { key: AttributeKey; value: string };

export function isAttributeKey(key: string): key is AttributeKey {
	return attributeKeys.includes(key as any);
}

export function assertAttributeKey(key: string): asserts key is AttributeKey {
	if (!isAttributeKey(key)) {
		throw new Error(`Invalid attribute key: ${key}`);
	}
}

export function assertAttributeKeyValues(map: Record<string, string>): map is Record<AttributeKey, string> {
	for (const key of Object.keys(map)) {
		assertAttributeKey(key);
	}
	return true;
}

export function formatAttribute(attribute: { key: string; value: string }) {
	return `${attribute.key}:${attribute.value}`;
}

/** Officially supported room types */
export const ROOM_TYPES = ['bedroom', 'living-room', 'nursery', 'office'] as const;
export type RoomType = (typeof ROOM_TYPES)[number];
