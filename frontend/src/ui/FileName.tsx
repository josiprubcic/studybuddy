import { prettyName } from './prettyName'

/** A material's display name; the original file name stays available as a tooltip. */
export default function FileName({ name }: { name: string }) {
  return <span title={name}>{prettyName(name)}</span>
}
