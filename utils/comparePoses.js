import * as tf from '@tensorflow/tfjs';
import * as poseDetection from '@tensorflow-models/pose-detection';

// Load Pose Detection model
async function loadPoseModel() {
  const model = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet);
  return model;
}

// Extract pose from a video element (or image)
async function extractPoseFromVideo(videoElement, detector) {
  const poses = await detector.estimatePoses(videoElement);
  if (poses.length > 0) {
    return poses[0]; // Return the first detected pose
  }
  return null;
}

// Compare two poses using Euclidean distance and return a similarity percentage
function comparePoses(pose1, pose2) {
  const pose1Keypoints = pose1.keypoints.map(k => [k.x, k.y]); // Extract x, y coordinates
  const pose2Keypoints = pose2.keypoints.map(k => [k.x, k.y]);

  // Calculate Euclidean distance between two poses
  const distance = pose1Keypoints.reduce((acc, [x1, y1], index) => {
    const [x2, y2] = pose2Keypoints[index];
    const dist = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    return acc + dist;
  }, 0);

  // Normalize to a percentage similarity (lower distance means more similar)
  const maxPossibleDistance = pose1Keypoints.length * 2; // Max distance is roughly 2 pixels per keypoint
  const similarity = Math.max(0, 100 - (distance / maxPossibleDistance) * 100); // Closer to 100 is better

  return similarity; // The higher the value, the more similar the poses
}

// Export functions for use in other parts of the app
export { loadPoseModel, extractPoseFromVideo, comparePoses };
