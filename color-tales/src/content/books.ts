import * as a from "./art";
import { Scene } from "./art";
import type { Book, Page } from "./types";

function page(index: number, text: string, draw: (s: Scene) => void): Page {
  const s = new Scene();
  draw(s);
  return { index, text, regions: s.regions, details: s.details };
}

const WATER = "#48cae4";

const luna: Book = {
  id: "book-luna",
  slug: "luna-the-little-cloud",
  title: "Luna the Little Cloud",
  ageMin: 3,
  ageMax: 6,
  theme: "sharing",
  coverColor: "#bde0fe",
  coverPage: 4,
  pages: [
    page(0, "Luna was a little cloud, so soft and white and small. She dreamed of making rainbows, the brightest ones of all.", (s) => {
      a.sky(s);
      a.hill(s, 200, 470, 320, 70);
      a.hill(s, 620, 470, 360, 60);
      a.ground(s, 470);
      a.flower(s, 110, 540, 90, "#f72585");
      a.sun(s, 680, 110, 50, true);
      a.luna(s, 340, 250, 280);
    }),
    page(1, "“How do I make a rainbow?” Luna asked the Sun one day. “Share your rain,” the Sun said, “and I will light the way!”", (s) => {
      a.sky(s);
      a.ground(s, 500);
      a.sun(s, 610, 170, 72, true);
      a.bird(s, 420, 110, 0.8);
      a.luna(s, 250, 290, 260);
    }),
    page(2, "Luna floated over fields that were dusty, dry and brown. The thirsty flowers drooped their heads and looked a little down.", (s) => {
      a.sky(s);
      a.ground(s, 440, "Dry field", "#dda15e");
      a.flower(s, 160, 560, 120, "#f72585", true);
      a.flower(s, 360, 570, 110, "#9d4edd", true);
      a.flower(s, 560, 560, 120, "#fb8500", true);
      a.luna(s, 580, 190, 240);
    }),
    page(3, "Pitter, patter, drip and drop! Luna rained and rained. The flowers lifted up their heads. “Hooray!” they all exclaimed.", (s) => {
      a.sky(s, "#a8dadc");
      a.ground(s, 480);
      a.flower(s, 220, 570, 120, "#f72585");
      a.flower(s, 560, 570, 120, "#4895ef");
      a.luna(s, 400, 180, 320);
      a.raindrops(s, [
        [280, 250], [360, 290], [440, 250], [520, 290], [320, 350], [480, 350], [400, 400],
      ]);
    }),
    page(4, "The Sun peeked out and smiled so wide, with a warm and golden glow. And look what Luna made at last: a beautiful RAINBOW!", (s) => {
      a.sky(s);
      a.rainbow(s, 400, 470, 330, 38);
      a.ground(s, 470);
      a.sun(s, 110, 110, 45);
      a.luna(s, 650, 170, 210);
    }),
    page(5, "Now every time the flowers need a drink, Luna comes to play. Sharing makes you shine inside, a little more each day.", (s) => {
      a.sky(s);
      a.ground(s, 470);
      a.flower(s, 150, 570, 120, "#f72585");
      a.flower(s, 400, 580, 110, "#ffd166");
      a.flower(s, 640, 570, 120, "#9d4edd");
      a.sun(s, 90, 90, 40, true);
      a.heart(s, 670, 120, 1.3);
      a.luna(s, 400, 250, 300);
    }),
  ],
};

const dino: Book = {
  id: "book-dino",
  slug: "dinos-big-day",
  title: "Dino's Big Day",
  ageMin: 4,
  ageMax: 7,
  theme: "friendship",
  coverColor: "#caffbf",
  coverPage: 1,
  pages: [
    page(0, "Good morning, Dino! Up you get! Stretch your tail and wiggle your toes. Today will be the best day yet, and everybody knows!", (s) => {
      a.sky(s);
      a.hill(s, 250, 440, 420, 60);
      a.ground(s, 440);
      a.sun(s, 680, 100, 50, true);
      a.dino(s, 360, 340, 1);
    }),
    page(1, "Dino packs a bright red ball, a crunchy apple snack, and a party hat so pointy and tall. Then off he goes, clickety-clack!", (s) => {
      a.sky(s);
      a.ground(s, 470);
      a.dino(s, 290, 370, 1);
      a.partyHat(s, 400, 276, 0.8);
      a.ball(s, 620, 430, 42);
      a.apple(s, 690, 250, 34);
    }),
    page(2, "At the park his friends all wave, as happy as can be. There's Birdie Blue and Turtle Dave beside the big oak tree!", (s) => {
      a.sky(s);
      a.ground(s, 460);
      a.tree(s, 150, 480, 1);
      a.turtle(s, 520, 490, 1);
      a.bird(s, 320, 150, 1);
    }),
    page(3, "Whoosh! Down the slide goes Dino, faster than the breeze. “Wheee!” he laughs, and lands so softly in the grass with ease.", (s) => {
      a.sky(s);
      a.ground(s, 520);
      a.sun(s, 100, 100, 45);
      a.slide(s, 120, 520);
      a.dino(s, 640, 420, 0.7);
    }),
    page(4, "They share their snacks beneath the tree: an apple each for one, two, three. Crunch and munch and giggle, “Whee! Friends are the best, you see!”", (s) => {
      a.sky(s);
      a.ground(s, 420);
      a.tree(s, 660, 450, 1.1);
      a.blanket(s, 90, 430, 440, 120);
      a.apple(s, 200, 480, 28);
      a.apple(s, 310, 490, 28);
      a.apple(s, 420, 480, 28);
    }),
    page(5, "The stars come out, the moon is bright, the park is calm and deep. Goodnight, Dino! Sleep tight! It's time to go to sleep.", (s) => {
      a.sky(s, "#1d3557", "Night sky");
      a.moon(s, 650, 130, 60);
      a.stars(s, [
        [120, 90, 22], [260, 160, 16], [420, 80, 20], [520, 200, 14], [80, 240, 14],
      ]);
      a.ground(s, 480, "Hill", "#2d6a4f");
      a.dino(s, 360, 380, 1, true);
    }),
  ],
};

const sea: Book = {
  id: "book-sea",
  slug: "under-the-sea-party",
  title: "Under the Sea Party",
  ageMin: 3,
  ageMax: 8,
  theme: "celebration",
  coverColor: "#90e0ef",
  coverPage: 5,
  pages: [
    page(0, "Deep down in the ocean blue, where the bubbles love to play, Finn the fish had a great big plan, a plan for a special day.", (s) => {
      a.sky(s, WATER, "Water");
      a.sand(s, 500);
      a.rock(s, 660, 510, 100, 55);
      a.seaweed(s, 110, 530, 170);
      a.seaweed(s, 200, 540, 120);
      a.fish(s, 430, 280, 1);
      a.bubbles(s, [[560, 200, 16], [590, 150, 11], [575, 110, 8], [300, 120, 12]]);
    }),
    page(1, "“It's Olly's birthday!” Finn said. “Let's make it big and grand! We'll throw a surprise party right here on the sand!”", (s) => {
      a.sky(s, WATER, "Water");
      a.sand(s, 510);
      a.starfish(s, 130, 520, 48);
      a.octopus(s, 580, 330, 1);
      a.fish(s, 240, 230, 0.9);
    }),
    page(2, "Crab brought shells, and Starfish brought light. The seaweed swayed to the left and the right.", (s) => {
      a.sky(s, WATER, "Water");
      a.sand(s, 480);
      a.seaweed(s, 90, 500, 200);
      a.seaweed(s, 720, 500, 180);
      a.shells(s, [[140, 575], [430, 570], [690, 580]]);
      a.starfish(s, 280, 470, 55);
      a.crab(s, 540, 440, 1);
    }),
    page(3, "Balloons made of bubbles, all shiny, big and round, floated up and up and up without a single sound.", (s) => {
      a.sky(s, WATER, "Water");
      a.sand(s, 520);
      a.balloon(s, 200, 200, "#f72585");
      a.balloon(s, 330, 150, "#4895ef");
      a.balloon(s, 460, 210, "#ffd166");
      a.fish(s, 610, 420, 0.8, true);
    }),
    page(4, "A cake of kelp with candles bright. “SURPRISE, Olly!” What a sight! Olly giggled with delight and hugged his friends so tight.", (s) => {
      a.sky(s, WATER, "Water");
      a.sand(s, 520);
      a.cake(s, 280, 545);
      a.octopus(s, 610, 320, 0.85);
    }),
    page(5, "They danced and laughed the whole day through, from morning until night. Happy birthday, Olly! We love you! Everything felt just right.", (s) => {
      a.sky(s, WATER, "Water");
      a.sand(s, 520);
      a.starfish(s, 690, 520, 40);
      a.bubbles(s, [[80, 380, 14], [110, 330, 10], [720, 300, 12], [700, 250, 8]]);
      a.fish(s, 170, 190, 0.7);
      a.heart(s, 640, 140, 1.3);
      a.octopus(s, 400, 320, 1);
    }),
  ],
};

export const BOOKS: Book[] = [luna, dino, sea];

export function findBook(slug: string | undefined): Book | undefined {
  return BOOKS.find((b) => b.slug === slug);
}
