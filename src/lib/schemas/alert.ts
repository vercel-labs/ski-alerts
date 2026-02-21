import * as v from 'valibot';

export const AlertConditionSchema = v.variant('type', [
	v.object({
		type: v.literal('snowfall'),
		operator: v.picklist(['gt', 'gte', 'lt', 'lte']),
		value: v.number(),
		unit: v.literal('inches')
	}),
	v.object({
		type: v.literal('temperature'),
		operator: v.picklist(['gt', 'gte', 'lt', 'lte']),
		value: v.number(),
		unit: v.picklist(['fahrenheit', 'celsius'])
	}),
	v.object({
		type: v.literal('conditions'),
		match: v.picklist(['powder', 'clear', 'snowing', 'windy'])
	})
]);

export const AlertSchema = v.object({
	id: v.string(),
	resortId: v.string(),
	condition: AlertConditionSchema,
	originalQuery: v.string(),
	createdAt: v.string(),
	triggered: v.boolean(),
	triggeredAt: v.optional(v.string())
});

export const CreateAlertSchema = v.object({
	resortId: v.string(),
	condition: AlertConditionSchema,
	originalQuery: v.string()
});

export const CreateAlertToolInputSchema = v.object({
	resortId: v.pipe(
		v.string(),
		v.description('The resort ID (e.g., "mammoth", "grand-targhee", "steamboat")')
	),
	condition: AlertConditionSchema
});

export type AlertCondition = v.InferOutput<typeof AlertConditionSchema>;
export type Alert = v.InferOutput<typeof AlertSchema>;
export type CreateAlert = v.InferOutput<typeof CreateAlertSchema>;

export function describeCondition(condition: AlertCondition): string {
	switch (condition.type) {
		case 'snowfall': {
			const op = { gt: 'more than', gte: 'at least', lt: 'less than', lte: 'at most' }[
				condition.operator
			];
			return `${op} ${condition.value}" of snow`;
		}
		case 'temperature': {
			const op = { gt: 'above', gte: 'at or above', lt: 'below', lte: 'at or below' }[
				condition.operator
			];
			const unit = condition.unit === 'fahrenheit' ? '°F' : '°C';
			return `temperature ${op} ${condition.value}${unit}`;
		}
		case 'conditions':
			return `${condition.match} conditions`;
	}
}
