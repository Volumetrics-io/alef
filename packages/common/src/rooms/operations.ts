import { z } from 'zod';
import { id } from '../ids.js';
import { DistributiveOmit } from '../utilTypes.js';
import { editorOperationShape } from './operations/editorOperations.js';
import { roomOperationShape } from './operations/roomOperations.js';

export const operationShape = z.union([roomOperationShape, editorOperationShape]);

export type Operation = z.infer<typeof operationShape>;
export type OperationType = Operation['type'];
export type OperationByType<T extends OperationType> = Extract<Operation, { type: T }>;

export function createOp(op: DistributiveOmit<Operation, 'opId'>): Operation {
	return operationShape.parse({ ...op, opId: id('op') });
}

export { roomOperationShape };
