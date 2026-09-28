// lib/words.ts
export const WORDS = [
  // animals
  "dog", "cat", "elephant", "monkey", "crocodile", "butterfly", "chicken", "shark",
  // more animals
  "tiger", "lion", "giraffe", "penguin", "dolphin", "kangaroo", "zebra", "panda",
  // food
  "banana", "pizza", "rice", "egg", "chocolate", "watermelon", "hamburger", "ice cream",
  // more food
  "sushi", "pasta", "salad", "sandwich", "steak", "popcorn", "noodles", "cheese",
  // household
  "chair", "bed", "refrigerator", "umbrella", "toothbrush", "mirror", "television", "pillow",
  // household more
  "table", "lamp", "sofa", "curtain", "carpet", "fan", "clock", "door",
  // clothing and personal items
  "shoes", "hat", "eyeglasses", "wallet", "watch", "backpack",
  // more clothing and personal items
  "jacket", "scarf", "belt", "ring", "bracelet", "necklace", "earrings",
  // transport
  "bicycle", "airplane", "jeepney", "boat", "motorcycle", "train",
  // more transport
  "bus", "subway", "helicopter", "scooter", "tram", "ferry",
  // places and nature
  "beach", "school", "hospital", "volcano", "rainbow", "moon", "mountain",
  // more places and nature
  "river", "forest", "desert", "waterfall", "island", "cave", "ocean",
  // tech and misc
  "cellphone", "computer", "guitar", "basketball", "camera", "balloon", "candle",
  // more tech and misc
  "headphones", "microphone", "drone", "robot", "telescope", "flashlight", "puzzle",
  // celebrity
  "elon musk", "taylor swift", "cristiano ronaldo", "beyonce", "lebron james", "oprah winfrey",
  // more celebrity
  "kim kardashian", "justin bieber", "rihanna", "brad pitt", "angelina jolie", "scarlett johansson",
] as const;

export type Word = (typeof WORDS)[number];

export function pickRandomWord(): Word {
  return WORDS[Math.floor(Math.random() * WORDS.length)];
}