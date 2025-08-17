export interface IdPort {
	uuid(): string;
}

export interface IdPort<T = number> {
	next(): T;
}
