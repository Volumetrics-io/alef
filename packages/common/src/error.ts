export enum AlefErrorCode {
	BadRequest = 40000,
	Unauthorized = 40100,
	Forbidden = 40300,
	NotFound = 40400,
	Conflict = 40900,
	InternalServerError = 50000,
	Unknown = 0,
}

export class AlefError extends Error {
	static Code = AlefErrorCode;
	name = 'AlefError';

	static isInstance = (err: unknown): err is AlefError => err instanceof AlefError || (!!err && typeof err === 'object' && 'name' in err && err.name === 'AlefError');

	static fromResponse = (res: Response): AlefError | null => {
		if (res.ok) return null;
		const code = Number(res.headers.get('X-Alef-Error')) || AlefErrorCode.Unknown;
		const message = res.headers.get('X-Alef-Error-Message') || res.statusText;
		return new AlefError(code, message);
	};

	static throwIfFailed = (res: Response): void => {
		const error = AlefError.fromResponse(res);
		if (error) throw error;
	};

	static wrap = (err: unknown): AlefError => {
		if (this.isInstance(err)) return err;
		if (err instanceof Error) return new AlefError(AlefErrorCode.Unknown, err.message, err);
		return new AlefError(AlefErrorCode.Unknown, String(err), err);
	};

	private extraHeaders: HeadersInit = {};

	constructor(
		public code: AlefErrorCode,
		message: string = `AlefError ${code}`,
		public cause?: unknown,
		options?: { headers?: HeadersInit }
	) {
		super(message);
		this.extraHeaders = options?.headers || {};
	}

	get statusCode() {
		if (this.code < 30000) return 500;
		return Math.floor(this.code / 100);
	}

	get body() {
		return { code: this.code, message: this.message };
	}

	get headers() {
		return {
			'X-Alef-Error': String(this.code),
			'X-Alef-Error-Message': this.message,
			...this.extraHeaders,
		};
	}

	toResponse = (): Response =>
		new Response(JSON.stringify(this.body), {
			status: this.statusCode,
			headers: {
				'Content-Type': 'application/json',
				...this.headers,
			},
		});
}
