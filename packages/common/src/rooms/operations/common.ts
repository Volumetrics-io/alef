import { z } from 'zod';
import { idShapes } from '../../ids.js';

export const baseRoomOperationShape = z.object({
	opId: idShapes.Operation,
	roomId: idShapes.Room,
});
