import Jimp, { read } from 'jimp'
import { mergeImages } from './imageUtils'

const diffToken = '.diff'
export const mkDiffPath = (path: string): string => {
  const dotIndex = path.lastIndexOf('.')
  return dotIndex === -1
    ? path + diffToken
    : path.substring(0, dotIndex) + diffToken + path.substring(dotIndex)
}

/** The options type for {@link compareImages}. */
export type CompareImagesOpts = {
  tolerance?: number
}

const defaultOpts: Required<CompareImagesOpts> = {
  tolerance: 0,
}

type CompareOK = {
  equal: true
}

type CompareKO = {
  equal: false
  diffs: ReadonlyArray<{
    page: number
    diff: Jimp
  }>
}

type CompareImagesResult = CompareOK | CompareKO

export const compareImages = async (
  expectedImagePath: string,
  images: ReadonlyArray<Jimp>,
  options?: CompareImagesOpts,
): Promise<CompareImagesResult> => {
  const { tolerance } = {
    ...defaultOpts,
    ...options,
  }
  const expectedImg = await read(expectedImagePath)
  // Multi image comparison not implemented!
  const img = mergeImages(images)
  const diff = Jimp.diff(expectedImg, img, tolerance)
  if (diff.percent > 0) {
    return {
      equal: false,
      diffs: [{ page: 1, diff: diff.image }],
    }
  }

  return { equal: true }
}
