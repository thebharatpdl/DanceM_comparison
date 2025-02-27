// poseComparison.js

// Calculate Euclidean distance between two poses
export function calculateEuclideanDistance(pose1, pose2) {
  const pose1Keypoints = pose1.keypoints.map(k => [k.x, k.y]);
  const pose2Keypoints = pose2.keypoints.map(k => [k.x, k.y]);

  const distance = pose1Keypoints.reduce((acc, [x1, y1], index) => {
    const [x2, y2] = pose2Keypoints[index];
    const dist = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    return acc + dist;
  }, 0);

  return distance;
}

// Compare two poses and return a similarity score
export function comparePoses(pose1, pose2) {
  const distance = calculateEuclideanDistance(pose1, pose2);
  const similarity = Math.max(0, 100 - (distance / 50) * 100); // Normalize the score (e.g., max 100)
  return similarity;
}
