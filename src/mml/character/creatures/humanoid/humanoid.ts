import { HitPoints } from '../../bodies/hit_points';

export default abstract class Humanoid {
  static hit_points = [
    new HitPoints('Head', max, ),
    new HitPoints('Chest', max, ),
    new HitPoints('Abdomen', max, ),
    new HitPoints('Left Arm', max, ),
    new HitPoints('Right Arm', max, ),
    new HitPoints('Left Leg', max, ),
    new HitPoints('Right Leg', max, ),
  ];

  static hit_positions: {
    1: { name: 'Top of Head', body_part: 'Head', number: 1 },
    2: { name: 'Face', body_part: 'Head', number: 2 },
    3: { name: 'Rear of Head', body_part: 'Head', number: 3 },
    4: { name: 'Right Side of Head', body_part: 'Head', number: 4 },
    5: { name: 'Left Side of Head', body_part: 'Head', number: 5 },
    6: { name: 'Neck, Throat', body_part: 'Head', number: 6 },
    7: { name: 'Rear of Neck', body_part: 'Head', number: 7 },
    8: { name: 'Right Shoulder', body_part: 'Right Arm', number: 8 },
    9: { name: 'Right Upper Chest', body_part: 'Chest', number: 9 },
    10: { name: 'Right Upper Back', body_part: 'Chest', number: 10 },
    11: { name: 'Left Upper Chest', body_part: 'Chest', number: 11 },
    12: { name: 'Left Upper Back', body_part: 'Chest', number: 12 },
    13: { name: 'Left Shoulder', body_part: 'Left Arm', number: 13 },
    14: { name: 'Right Upper Arm', body_part: 'Right Arm', number: 14 },
    15: { name: 'Right Lower Chest', body_part: 'Chest', number: 15 },
    16: { name: 'Right Mid Back', body_part: 'Chest', number: 16 },
    17: { name: 'Left Lower Chest', body_part: 'Chest', number: 17 },
    18: { name: 'Left Mid Back', body_part: 'Chest', number: 18 },
    19: { name: 'Left Upper Arm', body_part: 'Left Arm', number: 19 },
    20: { name: 'Right Elbow', body_part: 'Right Arm', number: 20 },
    21: { name: 'Right Abdomen', body_part: 'Abdomen', number: 21 },
    22: { name: 'Right Lower Back', body_part: 'Abdomen', number: 22 },
    23: { name: 'Left Abdomen', body_part: 'Abdomen', number: 23 },
    24: { name: 'Left Lower Back', body_part: 'Abdomen', number: 24 },
    25: { name: 'Left Elbow', body_part: 'Left Arm', number: 25 },
    26: { name: 'Right Forearm', body_part: 'Right Arm', number: 26 },
    27: { name: 'Right Hip', body_part: 'Abdomen', number: 27 },
    28: { name: 'Right Buttock', body_part: 'Abdomen', number: 28 },
    29: { name: 'Left Hip', body_part: 'Abdomen', number: 29 },
    30: { name: 'Left Buttock', body_part: 'Abdomen', number: 30 },
    31: { name: 'Left Forearm', body_part: 'Left Arm', number: 31 },
    32: { name: 'Right Hand/Wrist', body_part: 'Right Arm', number: 32 },
    33: { name: 'Groin', body_part: 'Abdomen', number: 33 },
    34: { name: 'Left Hand/Wrist', body_part: 'Left Arm', number: 34 },
    35: { name: 'Right Upper Thigh', body_part: 'Right Leg', number: 35 },
    36: { name: 'Left Upper Thigh', body_part: 'Left Leg', number: 36 },
    37: { name: 'Right Lower Thigh', body_part: 'Right Leg', number: 37 },
    38: { name: 'Left Lower Thigh', body_part: 'Left Leg', number: 38 },
    39: { name: 'Right Knee', body_part: 'Right Leg', number: 39 },
    40: { name: 'Left Knee', body_part: 'Left Leg', number: 40 },
    41: { name: 'Right Upper Shin', body_part: 'Right Leg', number: 41 },
    42: { name: 'Left Upper Shin', body_part: 'Left Leg', number: 42 },
    43: { name: 'Right Lower Shin', body_part: 'Right Leg', number: 43 },
    44: { name: 'Left Lower Shin', body_part: 'Left Leg', number: 44 },
    45: { name: 'Right Foot/Ankle', body_part: 'Right Leg', number: 45 },
    46: { name: 'Left Foot/Ankle', body_part: 'Left Leg', number: 46 }
  };

  static hit_tables: {
    A: [1, 1, 2, 3, 3, 4, 4, 5, 5, 6, 7, 8, 8, 8, 8, 9, 9, 9, 9, 10, 10, 11, 11, 11, 11, 12, 12, 13, 13, 13, 13, 14, 14, 14, 15, 15, 16, 16, 17, 17, 17, 18, 18, 19, 19, 19, 19, 20, 20, 21, 21, 21, 22, 22, 23, 23, 23, 24, 24, 25, 25, 26, 26, 27, 27, 27, 28, 28, 29, 29, 29, 30, 30, 31, 31, 32, 32, 33, 34, 34, 35, 35, 35, 36, 36, 36, 37, 37, 38, 38, 39, 39, 40, 40, 41, 42, 43, 44, 45, 46],
    B: [1, 1, 2, 3, 3, 4, 4, 5, 5, 6, 7, 8, 8, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13, 13, 13, 14, 14, 14, 14, 15, 15, 16, 16, 17, 17, 18, 18, 19, 19, 19, 19, 20, 21, 21, 22, 22, 23, 23, 24, 24, 25, 26, 26, 26, 26, 27, 27, 28, 28, 29, 29, 30, 30, 31, 31, 31, 31, 32, 32, 32, 33, 34, 34, 34, 35, 35, 35, 35, 36, 36, 36, 36, 37, 37, 37, 38, 38, 38, 39, 39, 40, 40, 41, 42, 43, 44, 45, 46],
    C: [1, 1, 2, 3, 3, 4, 4, 5, 5, 6, 7, 8, 8, 8, 8, 8, 9, 9, 9, 9, 10, 10, 10, 11, 11, 12, 12, 12, 12, 13, 13, 13, 14, 14, 14, 14, 14, 15, 15, 16, 17, 18, 18, 19, 20, 20, 21, 21, 21, 21, 21, 22, 23, 23, 24, 24, 24, 25, 26, 26, 26, 26, 26, 27, 27, 27, 27, 27, 28, 29, 30, 30, 30, 30, 31, 32, 32, 32, 32, 33, 34, 35, 35, 35, 35, 36, 37, 37, 37, 37, 38, 39, 39, 40, 41, 42, 43, 44, 45, 46]
  };
}