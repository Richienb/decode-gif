"use strict"

const { GifReader } = require("omggif")
// const ndarray = require("ndarray")

const TAG = "decodeGIF"

module.exports = data => {
  const reader = new GifReader(data)

  let currentTimeCode = 0
  let frames = []
  let lastUnspecifiedFrame = null

  console.log(TAG, "reader.numFrames()", reader.numFrames())

  for (let frameIndex = 0; frameIndex < reader.numFrames(); frameIndex++) {
    const { delay, disposal } = reader.frameInfo(frameIndex)

    const frameData = new Uint8ClampedArray(reader.width * reader.height * 4)
    reader.decodeAndBlitFrameRGBA(frameIndex, frameData)

    console.log(TAG, "disposal = ", disposal)

    switch (disposal) {
      case 1: // (Do Not Dispose) 未被当前帧覆盖的前一帧像素将继续显示
        if (frameIndex > 0) {
          const prevFrameData = frames[frameIndex - 1].data
          for (let i = 0; i < frameData.length; i += 4) {
            if (frameData[i] === 0 && frameData[i + 1] === 0 && frameData[i + 2] === 0) {
              frameData[i] = prevFrameData[i]
              frameData[i + 1] = prevFrameData[i + 1]
              frameData[i + 2] = prevFrameData[i + 2]
              frameData[i + 3] = prevFrameData[i + 3]
            }
          }
        }
        lastUnspecifiedFrame = frameData
        break;
      case 2: // (Restore to Background) 绘制当前帧之前，会先把前一帧的绘制区域恢复成背景色
        // TODO omggif没有输出background值
        break;
      case 3: // (Restore to Previous) 绘制当前帧时，会先恢复到最近一个设置为Unspecified或Do not Dispose的帧，然后再将当前帧叠加到上面
        if (lastUnspecifiedFrame) {
          for (let i = 0; i < frameData.length; i += 4) {
            if (frameData[i] === 0 && frameData[i + 1] === 0 && frameData[i + 2] === 0) {
              frameData[i] = lastUnspecifiedFrame[i]
              frameData[i + 1] = lastUnspecifiedFrame[i + 1]
              frameData[i + 2] = lastUnspecifiedFrame[i + 2]
              frameData[i + 3] = lastUnspecifiedFrame[i + 3]
            }
          }
        }
        break;
      default: // (Unspecified) : 绘制一个完整大小的、不透明的GIF帧来替换上一帧
        lastUnspecifiedFrame = frameData
        break;
    }

    // console.log(TAG, frameData)

    const data = {
      timeCode: currentTimeCode,
      data: frameData,
    }

    currentTimeCode += delay * 10

    frames.push(data)
  }


  return {
    width: reader.width,
    height: reader.height,
    frames,
  }
}