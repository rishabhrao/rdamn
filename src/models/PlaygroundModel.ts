/* Copyright (c) rishabhrao (https://github.com/rishabhrao) */

import { Document, Model, Schema, model, models } from "mongoose"

export interface PlaygroundType {
	createdAt: number
	userId: string
	playgroundId: string
	playgroundName: string
}

const PlaygroundSchema: Schema = new Schema<PlaygroundType>({
	createdAt: { type: Number, required: true, index: true },
	userId: { type: String, required: true, index: true },
	playgroundId: { type: String, required: true, index: true, unique: true, dropDups: true },
	playgroundName: { type: String, required: true },
})

PlaygroundSchema.set("toJSON", {
	virtuals: true,
	transform: (_doc, ret: Document) => {
		delete ret.__v
		delete ret._id
	},
})

export const PlaygroundModel: Model<PlaygroundType> = (models.playground as Model<PlaygroundType>) || model<PlaygroundType>("playground", PlaygroundSchema)
