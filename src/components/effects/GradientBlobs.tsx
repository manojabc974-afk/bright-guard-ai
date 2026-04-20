/**
 * Animated neon gradient blobs — fixed background layer.
 * Pure CSS, GPU-friendly, mobile safe.
 */
export default function GradientBlobs() {
  return (
    <div className="blob-bg" aria-hidden="true">
      <div className="blob b1" />
      <div className="blob b2" />
      <div className="blob b3" />
    </div>
  );
}
