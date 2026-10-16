// Fetches the scenes of a plan from the server and turns them into small JPEG pictures that live inside the page (a data: address), so the finished
// site and its exports do not depend on any server. Browser only.
import { sceneUrl, type Scene, type ScenePlan } from '../imageAi'
import type { EditOp } from './edits'
import { readPicture } from './imageFile'

export type ImageAiResult = { ops?: EditOp[]; problem?: string }

async function one(scene: Scene): Promise<string> {
  const res = await fetch(sceneUrl(scene), { signal: AbortSignal.timeout(60_000) })
  // 502 / 503 / 504: nothing is listening behind the proxy or the engine is not running
  if (res.status >= 502) throw new Error('down')
  if (!res.ok) throw new Error(`the image engine answered ${res.status}`)
  const blob = await res.blob()
  if (!/^image\//.test(blob.type)) throw new Error('the image engine did not return a picture')
  return readPicture(new File([blob], 'scene.png', { type: blob.type }), Math.max(scene.width, scene.height))
}

/** the picture of every scene, two at a time; `onProgress(done, total)` tells how far it is */
export async function makePictures(plan: ScenePlan, onProgress: (done: number, total: number) => void): Promise<ImageAiResult> {
  const scenes = [plan.hero, plan.about, ...plan.gallery]
  const pictures: string[] = new Array(scenes.length)
  let next = 0
  let done = 0
  try {
    const worker = async () => {
      while (next < scenes.length) {
        const i = next++
        pictures[i] = await one(scenes[i])
        done += 1
        onProgress(done, scenes.length)
      }
    }
    await Promise.all([worker(), worker()])
  } catch (error) {
    const down = error instanceof TypeError || (error instanceof Error && error.message === 'down')
    return { problem: down ? 'The image engine is not running. Start it with: npm run images (and the server: npm run server).' : error instanceof Error ? error.message : 'Could not make the pictures.' }
  }
  return { ops: [{ op: 'photos', hero: pictures[0], about: pictures[1], gallery: pictures.slice(2) }] }
}
