export const comparePoses = (pose1, pose2, videoSize) => {
    if (!pose1 || !pose2) return 0;
    
    // Normalize coordinates based on video size
    const normalize = (value, max) => value / max;
    
    let totalDistance = 0;
    let validPoints = 0;
    
    pose1.keypoints.forEach((kp1, index) => {
        const kp2 = pose2.keypoints[index];
        if (kp1.score > 0.3 && kp2.score > 0.3) { // Only compare confident points
            const x1 = normalize(kp1.x, videoSize.width);
            const y1 = normalize(kp1.y, videoSize.height);
            const x2 = normalize(kp2.x, videoSize.width);
            const y2 = normalize(kp2.y, videoSize.height);
            
            totalDistance += Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
            validPoints++;
        }
    });
    
    if (validPoints === 0) return 0;
    
    const avgDistance = totalDistance / validPoints;
    // Convert distance to score (0-100 scale)
    const score = Math.max(0, 100 - (avgDistance * 1000));
    return score;
};