import { AttributeKey, DeviceType, PrefixedId } from '@alef/common';
import { ColumnType, Insertable, Selectable, Updateable } from 'kysely';

export interface Database {
	User: UserTable;
	Account: AccountTable;
	VerificationCode: VerificationCodeTable;
	Furniture: FurnitureTable;
	Attribute: AttributeTable;
	FurnitureAttribute: FurnitureAttributeTable;
	Device: DeviceTable;
	DeviceAccess: DeviceAccessTable;
	Property: PropertyTable;
	Organization: OrganizationTable;
	Membership: MembershipTable;
}

// date serialization: Dates go in, strings come out.
type DateColumnRequired = ColumnType<string, Date, Date>;
type DateColumnOptional = ColumnType<string | null, Date | undefined, Date | null | undefined> | null;
type DateColumnGenerated = ColumnType<string, Date | undefined, Date | null | undefined>;

type CreatedAt = DateColumnGenerated;
type UpdatedAt = DateColumnOptional;

export interface UserTable {
	id: PrefixedId<'u'>;
	createdAt: CreatedAt;
	updatedAt: UpdatedAt;

	fullName: string | null;
	friendlyName: string | null;
	email: string;
	emailVerifiedAt: DateColumnOptional;
	imageUrl: string | null;

	isProductAdmin: ColumnType<boolean, boolean | undefined, boolean | undefined>;

	password: string | null;

	acceptedTosAt: DateColumnOptional;
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
	accessTokenExpiresAt: DateColumnOptional;
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
	expiresAt: DateColumnRequired;
}
export type VerificationCode = Selectable<VerificationCodeTable>;
export type NewVerificationCode = Insertable<VerificationCodeTable>;
export type VerificationCodeUpdate = Updateable<VerificationCodeTable>;

export interface FurnitureTable {
	id: PrefixedId<'f'>;
	createdAt: CreatedAt;
	updatedAt: UpdatedAt;

	name: string;

	modelUpdatedAt: DateColumnOptional;
	screenshotUpdatedAt: DateColumnOptional;
	originalFileName: string | null;
	measuredDimensionsX: number | null;
	measuredDimensionsY: number | null;
	measuredDimensionsZ: number | null;

	/** When we decide a furniture piece is ready to ship to users. */
	madePublicAt: DateColumnOptional;
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

	furnitureId: PrefixedId<'f'>;
	attributeId: PrefixedId<'at'>;
}
export type FurnitureAttribute = Selectable<FurnitureAttributeTable>;
export type NewFurnitureAttribute = Insertable<FurnitureAttributeTable>;
export type FurnitureAttributeUpdate = Updateable<FurnitureAttributeTable>;

export interface DeviceTable {
	id: PrefixedId<'d'>;
	createdAt: CreatedAt;
	updatedAt: UpdatedAt;

	name: string;
	displayMode: 'staging' | 'viewing';
	type: DeviceType;
}
export type Device = Selectable<DeviceTable>;
export type NewDevice = Insertable<DeviceTable>;
export type DeviceUpdate = Updateable<DeviceTable>;

export interface DeviceAccessTable {
	createdAt: CreatedAt;
	updatedAt: UpdatedAt;

	deviceId: PrefixedId<'d'>;
	userId: PrefixedId<'u'>;
}
export type DeviceAccess = Selectable<DeviceAccessTable>;
export type NewDeviceAccess = Insertable<DeviceAccessTable>;
export type DeviceAccessUpdate = Updateable<DeviceAccessTable>;

export interface PropertyTable {
	id: PrefixedId<'p'>;
	createdAt: CreatedAt;
	updatedAt: UpdatedAt;

	name: string;
	ownerId: PrefixedId<'u'>;
}
export type Property = Selectable<PropertyTable>;
export type NewProperty = Insertable<PropertyTable>;
export type PropertyUpdate = Updateable<PropertyTable>;

export interface OrganizationTable {
	id: PrefixedId<'or'>;
	createdAt: CreatedAt;
	updatedAt: UpdatedAt;

	name: string;
	hasExtendedAIAccess: boolean;
	stripeSubscriptionId: string | null;
	stripeCustomerId: string | null;
}
export type Organization = Selectable<OrganizationTable>;
export type NewOrganization = Insertable<OrganizationTable>;
export type OrganizationUpdate = Updateable<OrganizationTable>;

export interface MembershipTable {
	id: PrefixedId<'me'>;
	createdAt: CreatedAt;
	updatedAt: UpdatedAt;

	userId: PrefixedId<'u'>;
	organizationId: PrefixedId<'or'>;
	role: 'admin' | 'member';
}
export type Membership = Selectable<MembershipTable>;
export type NewMembership = Insertable<MembershipTable>;
export type MembershipUpdate = Updateable<MembershipTable>;
