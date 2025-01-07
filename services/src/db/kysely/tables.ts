import { AttributeKey, PrefixedId } from '@alef/common';
import { ColumnType, Generated, Insertable, Selectable, Updateable } from 'kysely';

export interface Database {
	User: UserTable;
	Account: AccountTable;
	VerificationCode: VerificationCodeTable;
	Furniture: FurnitureTable;
	Attribute: AttributeTable;
	FurnitureAttribute: FurnitureAttributeTable;
}

type CreatedAt = Generated<Date>;
type UpdatedAt = Generated<Date>;

export interface UserTable {
	id: PrefixedId<'u'>;
	createdAt: CreatedAt;
	updatedAt: UpdatedAt;

	fullName: string | null;
	friendlyName: string | null;
	email: string;
	emailVerifiedAt: Date | null;
	imageUrl: string | null;

	password: string | null;

	acceptedTosAt: ColumnType<Date, Date | undefined, Date | undefined> | null;
}
export type User = Selectable<UserTable>;
export type NewUser = Insertable<UserTable>;
export type UserUpdate = Updateable<UserTable>;

export interface AccountTable {
	id: PrefixedId<'a'>;
	createdAt: CreatedAt;
	updatedAt: UpdatedAt;

	userId: string;

	type: string;
	provider: string;
	providerAccountId: string;
	accessToken: string | null;
	refreshToken: string | null;
	accessTokenExpiresAt: ColumnType<Date, Date | undefined, Date> | null;
	tokenType: string | null;
	scope: string | null;
	idToken: string | null;
}
export type Account = Selectable<AccountTable>;
export type NewAccount = Insertable<AccountTable>;
export type AccountUpdate = Updateable<AccountTable>;

export interface VerificationCodeTable {
	id: PrefixedId<'vc'>;
	createdAt: CreatedAt;
	updatedAt: UpdatedAt;

	email: string;
	code: string;
	name: string;
	expiresAt: ColumnType<Date, Date | undefined, Date>;
}
export type VerificationCode = Selectable<VerificationCodeTable>;
export type NewVerificationCode = Insertable<VerificationCodeTable>;
export type VerificationCodeUpdate = Updateable<VerificationCodeTable>;

export interface FurnitureTable {
	id: PrefixedId<'f'>;
	createdAt: CreatedAt;
	updatedAt: UpdatedAt;

	name: string;
}
export type Furniture = Selectable<FurnitureTable>;
export type NewFurniture = Insertable<FurnitureTable>;
export type FurnitureUpdate = Updateable<FurnitureTable>;

export interface AttributeTable {
	id: PrefixedId<'at'>;
	createdAt: CreatedAt;
	updatedAt: UpdatedAt;

	key: AttributeKey;
	value: string;
}
export type Attribute = Selectable<AttributeTable>;
export type NewAttribute = Insertable<AttributeTable>;
export type AttributeUpdate = Updateable<AttributeTable>;

export interface FurnitureAttributeTable {
	createdAt: CreatedAt;
	updatedAt: UpdatedAt;

	furnitureId: string;
	attributeId: string;
}
