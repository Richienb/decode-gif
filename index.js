"use strict"

const { GifReader } = require("omggif")
// const ndarray = require("ndarray")

const TAG = "decodeGIF"

module.exports = data => {
	const reader = new GifReader(data)

	let currentTimeCode = 0
	let frames = []

	console.log(TAG, "reader.numFrames()", reader.numFrames())

	for (let frameIndex = 0; frameIndex < reader.numFrames(); frameIndex++) {
		const { delay } = reader.frameInfo(frameIndex)

		const frameData = new Uint8ClampedArray(reader.width * reader.height * 4)
		reader.decodeAndBlitFrameRGBA(frameIndex, frameData)

		if (frameIndex > 0) {
			const prevFrameData = frames[frameIndex - 1].data
			// console.log(TAG, "prevFrameData", prevFrameData)
			for (let i = 0; i < frameData.length; i += 4) {
				if (frameData[i] === 0 && frameData[i + 1] === 0 && frameData[i + 2] === 0) {
					frameData[i] = prevFrameData[i]
					frameData[i + 1] = prevFrameData[i + 1]
					frameData[i + 2] = prevFrameData[i + 2]
					frameData[i + 3] = prevFrameData[i + 3]
				}
			}
		}

		// console.log(TAG, frameData)

		const data = {
			timeCode: currentTimeCode,
			data: frameData
		}

		currentTimeCode += delay * 10

		frames.push(data)
	}


	return {
		width: reader.width,
		height: reader.height,
		frames
	}
}