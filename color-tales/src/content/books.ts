import * as a from "./art";
import { Scene } from "./art";
import type { Book, Page } from "./types";

type PageDef = [text: string, draw: (s: Scene) => void];

/** Builds pages in order; each page's index is its position in the story. */
function pages(defs: PageDef[]): Page[] {
  return defs.map(([text, draw], index) => {
    const s = new Scene();
    draw(s);
    return { index, text, regions: s.regions, details: s.details };
  });
}

const WATER = "#48cae4";

const luna: Book = {
  id: "book-luna",
  slug: "luna-the-little-cloud",
  title: "Luna the Little Cloud",
  subtitle: "A Story & Coloring Book About Sharing",
  blurb:
    "Luna is a little cloud with a big dream: to make the brightest rainbow of all. The big clouds say she is far too small, but with a little help from the Sun and her friend Birdie Blue, she learns that sharing makes everyone shine. Read the gentle rhyming story, then color every page, one big friendly picture at a time.",
  drawPrompts: [
    "Draw the rainbow Luna will make next!",
    "Draw a friend for Luna to play with.",
    "Draw your favorite flower after the rain.",
    "What shape would YOUR cloud be? Draw it!",
  ],
  ageMin: 3,
  ageMax: 6,
  theme: "sharing",
  coverColor: "#bde0fe",
  coverPage: 8,
  pages: pages([
    ["Luna was a little cloud, so soft and white and small. She dreamed of making rainbows, the brightest ones of all.", (s) => {
      a.sky(s);
      a.hill(s, 200, 470, 320, 70);
      a.hill(s, 620, 470, 360, 60);
      a.ground(s, 470);
      a.flower(s, 110, 540, 90, "#f72585");
      a.sun(s, 680, 110, 50, true);
      a.luna(s, 340, 250, 280);
    }],
    ["The big clouds rumbled, “You're much too small! A rainbow needs a cloud that's tall.” Luna sighed and drifted along, humming a hopeful little song.", (s) => {
      a.sky(s);
      a.ground(s, 500);
      a.cloud(s, 190, 220, 340, "Big cloud", "#dee2e6");
      a.cloud(s, 600, 190, 360, "Big cloud", "#dee2e6");
      a.face(s, 180, 160, 1.4);
      a.face(s, 590, 125, 1.5);
      a.luna(s, 420, 400, 170);
    }],
    ["“How do I make a rainbow?” Luna asked the Sun one day. “Share your rain,” the Sun said, “and I will light the way!”", (s) => {
      a.sky(s);
      a.ground(s, 500);
      a.sun(s, 610, 170, 72, true);
      a.bird(s, 420, 110, 0.8);
      a.luna(s, 250, 290, 260);
    }],
    ["Along the way she met Birdie Blue. “I'll fly beside you! I'll help you too!” Together they sailed on the gentle breeze, over the hills and over the trees.", (s) => {
      a.sky(s);
      a.hill(s, 560, 480, 420, 60);
      a.ground(s, 480);
      a.tree(s, 140, 500, 1);
      a.bird(s, 560, 170, 1.1);
      a.luna(s, 360, 230, 250);
    }],
    ["Luna floated over fields that were dusty, dry and brown. The thirsty flowers drooped their heads and looked a little down.", (s) => {
      a.sky(s);
      a.ground(s, 440, "Dry field", "#dda15e");
      a.flower(s, 160, 560, 120, "#f72585", true);
      a.flower(s, 360, 570, 110, "#9d4edd", true);
      a.flower(s, 560, 560, 120, "#fb8500", true);
      a.luna(s, 580, 190, 240);
    }],
    ["“If I share my rain, I'll shrink,” she said. “But the flowers need a drink!” So Luna took a great big breath, and puffed up proud to do her best.", (s) => {
      a.sky(s);
      a.ground(s, 450, "Dry field", "#dda15e");
      a.sun(s, 110, 100, 45);
      a.flower(s, 620, 570, 120, "#4895ef", true);
      a.bird(s, 180, 300, 0.8);
      a.luna(s, 420, 250, 340);
    }],
    ["Pitter, patter, drip and drop! Luna rained and rained. The flowers lifted up their heads. “Hooray!” they all exclaimed.", (s) => {
      a.sky(s, "#a8dadc");
      a.ground(s, 480);
      a.flower(s, 220, 570, 120, "#f72585");
      a.flower(s, 560, 570, 120, "#4895ef");
      a.luna(s, 400, 180, 320);
      a.raindrops(s, [
        [280, 250], [360, 290], [440, 250], [520, 290], [320, 350], [480, 350], [400, 400],
      ]);
    }],
    ["Splish and splash! The puddles grew, and Birdie splashed in one or two. The grass turned green, the trees drank deep. The whole wide meadow woke from sleep!", (s) => {
      a.sky(s, "#a8dadc");
      a.ground(s, 420);
      a.puddle(s, 200, 520, 130);
      a.puddle(s, 560, 480, 110);
      a.bird(s, 210, 470, 0.9);
      a.luna(s, 520, 170, 260);
      a.raindrops(s, [[440, 250], [520, 280], [600, 250], [560, 330]]);
    }],
    ["The Sun peeked out and smiled so wide, with a warm and golden glow. And look what Luna made at last: a beautiful RAINBOW!", (s) => {
      a.sky(s);
      a.rainbow(s, 400, 470, 330, 38);
      a.ground(s, 470);
      a.sun(s, 110, 110, 45);
      a.luna(s, 650, 170, 210);
    }],
    ["The big clouds gasped, “Oh my, oh my! The littlest cloud made a rainbow sky!” Luna smiled a shy, sweet smile. “Let's all share together for a while.”", (s) => {
      a.sky(s);
      a.ground(s, 500);
      a.cloud(s, 170, 200, 300, "Big cloud", "#dee2e6");
      a.cloud(s, 640, 210, 300, "Big cloud", "#dee2e6");
      a.face(s, 160, 150, 1.3);
      a.face(s, 630, 160, 1.3);
      a.heart(s, 400, 110, 1.1);
      a.luna(s, 400, 340, 230);
    }],
    ["So all the clouds rained, big and small, and flowers bloomed for one and all. A garden grew where the dust had been, the brightest garden you've ever seen!", (s) => {
      a.sky(s, "#a8dadc");
      a.ground(s, 450);
      a.flower(s, 110, 570, 130, "#f72585");
      a.flower(s, 300, 580, 120, "#ffd166");
      a.flower(s, 500, 575, 125, "#9d4edd");
      a.flower(s, 690, 570, 130, "#fb8500");
      a.luna(s, 400, 200, 240);
    }],
    ["Now every time the flowers need a drink, Luna comes to play. Sharing makes you shine inside, a little more each day.", (s) => {
      a.sky(s);
      a.ground(s, 470);
      a.flower(s, 150, 570, 120, "#f72585");
      a.flower(s, 400, 580, 110, "#ffd166");
      a.flower(s, 640, 570, 120, "#9d4edd");
      a.sun(s, 90, 90, 40, true);
      a.heart(s, 670, 120, 1.3);
      a.luna(s, 400, 250, 300);
    }],
  ]),
};

const dino: Book = {
  id: "book-dino",
  slug: "dinos-big-day",
  title: "Dino's Big Day",
  subtitle: "A Story & Coloring Book About Friendship",
  blurb:
    "Good morning, Dino! Today is the best day yet: a trip to the park with Birdie Blue and Turtle Dave. Kick the big red ball, play hide and seek, zoom down the slide, splash in the rain and share a picnic under the oak tree before waving goodnight to the stars. A cheerful rhyming story with big, easy pictures to color.",
  drawPrompts: [
    "Draw what Dino packs for tomorrow!",
    "Draw a new friend for Dino at the park.",
    "Draw Dino's favorite snack.",
    "Draw the playground of your dreams!",
  ],
  ageMin: 4,
  ageMax: 7,
  theme: "friendship",
  coverColor: "#caffbf",
  coverPage: 2,
  pages: pages([
    ["Good morning, Dino! Up you get! Stretch your tail and wiggle your toes. Today will be the best day yet, and everybody knows!", (s) => {
      a.sky(s);
      a.hill(s, 250, 440, 420, 60);
      a.ground(s, 440);
      a.sun(s, 680, 100, 50, true);
      a.dino(s, 360, 340, 1);
    }],
    ["Munch, munch, munch! What's for breakfast? Crunchy apples, round and red, picked right from the apple tree beside his cozy bed.", (s) => {
      a.sky(s);
      a.ground(s, 470);
      a.tree(s, 620, 490, 1.2);
      a.apple(s, 560, 290, 22);
      a.apple(s, 660, 320, 22);
      a.dino(s, 280, 370, 1);
    }],
    ["Dino packs a bright red ball, a crunchy apple snack, and a party hat so pointy and tall. Then off he goes, clickety-clack!", (s) => {
      a.sky(s);
      a.ground(s, 470);
      a.dino(s, 290, 370, 1);
      a.partyHat(s, 400, 276, 0.8);
      a.ball(s, 620, 430, 42);
      a.apple(s, 690, 250, 34);
    }],
    ["Stomp, stomp, stomp! Down the path he goes, past the flowers in pretty rows. The sun is warm, the sky is blue, and Dino hums a song for you!", (s) => {
      a.sky(s);
      a.ground(s, 470);
      a.sun(s, 90, 90, 42);
      a.flower(s, 80, 580, 110, "#f72585");
      a.flower(s, 720, 580, 110, "#9d4edd");
      a.dino(s, 400, 380, 0.9);
      a.musicNote(s, 600, 180);
      a.musicNote(s, 660, 130, 0.8);
    }],
    ["At the park his friends all wave, as happy as can be. There's Birdie Blue and Turtle Dave beside the big oak tree!", (s) => {
      a.sky(s);
      a.ground(s, 460);
      a.tree(s, 150, 480, 1);
      a.turtle(s, 520, 490, 1);
      a.bird(s, 320, 150, 1);
    }],
    ["Dino kicks the bright red ball. Up it flies, so high and tall! Turtle Dave calls, “Pass to me!” and rolls it back, one, two, three!", (s) => {
      a.sky(s);
      a.ground(s, 470);
      a.ball(s, 400, 150, 48);
      a.bird(s, 610, 110, 0.8);
      a.turtle(s, 560, 500, 1.1);
      s.line(`M 180 440 Q 280 250 350 180`);
      a.stars(s, [[140, 420, 18]], "Sparkle");
    }],
    ["Now hide and seek! Dino counts to ten. Where is Turtle? Where is Birdie then? A little tail peeks out behind the tree. “I found you, Dave! You can't hide from me!”", (s) => {
      a.sky(s);
      a.ground(s, 460);
      a.tree(s, 360, 490, 1.3);
      a.turtle(s, 530, 480, 0.9);
      a.bird(s, 330, 230, 0.7);
      a.stars(s, [[680, 120, 20], [620, 200, 14]], "Stars");
    }],
    ["Whoosh! Down the slide goes Dino, faster than the breeze. “Wheee!” he laughs, and lands so softly in the grass with ease.", (s) => {
      a.sky(s);
      a.ground(s, 520);
      a.sun(s, 100, 100, 45);
      a.slide(s, 120, 520);
      a.dino(s, 640, 420, 0.7);
    }],
    ["Then along came Luna with a pitter and a pat! Dino splashed in every puddle, and that was that. They laughed and they jumped, and they didn't mind at all, for rain is fun for big and small!", (s) => {
      a.sky(s, "#a8dadc");
      a.ground(s, 460);
      a.puddle(s, 420, 530, 170);
      a.luna(s, 620, 150, 220);
      a.raindrops(s, [[560, 230], [640, 260], [700, 220], [600, 310]]);
      a.dino(s, 260, 380, 0.8);
    }],
    ["They share their snacks beneath the tree: an apple each for one, two, three. Crunch and munch and giggle, “Whee! Friends are the best, you see!”", (s) => {
      a.sky(s);
      a.ground(s, 420);
      a.tree(s, 660, 450, 1.1);
      a.blanket(s, 90, 430, 440, 120);
      a.apple(s, 200, 480, 28);
      a.apple(s, 310, 490, 28);
      a.apple(s, 420, 480, 28);
    }],
    ["The sun sinks low, all orange and red. “Goodbye, friends! It's nearly bed.” Dino waves and calls out then, “Let's play tomorrow! Let's play again!”", (s) => {
      a.sky(s, "#ffb4a2", "Sunset sky");
      a.sun(s, 640, 290, 70);
      a.hill(s, 600, 470, 500, 30);
      a.ground(s, 470);
      a.dino(s, 300, 370, 1);
    }],
    ["The stars come out, the moon is bright, the park is calm and deep. Goodnight, Dino! Sleep tight! It's time to go to sleep.", (s) => {
      a.sky(s, "#1d3557", "Night sky");
      a.moon(s, 650, 130, 60);
      a.stars(s, [
        [120, 90, 22], [260, 160, 16], [420, 80, 20], [520, 200, 14], [80, 240, 14],
      ]);
      a.ground(s, 480, "Hill", "#2d6a4f");
      a.dino(s, 360, 380, 1, true);
    }],
  ]),
};

const sea: Book = {
  id: "book-sea",
  slug: "under-the-sea-party",
  title: "Under the Sea Party",
  subtitle: "A Story & Coloring Book About Celebrating Friends",
  blurb:
    "Deep in the ocean blue, Finn the fish is planning a surprise birthday party for Olly the octopus! Invitations swim off, Crab brings shells, Turtle brings party hats and everyone hides for the big SURPRISE. Read the bubbly rhyming story, then color the balloons, the presents, the kelp cake and all the party guests.",
  drawPrompts: [
    "Draw a present for Olly!",
    "Draw a new sea creature coming to the party.",
    "Decorate your own birthday cake!",
    "Draw what YOU would find under the sea.",
  ],
  ageMin: 3,
  ageMax: 8,
  theme: "celebration",
  coverColor: "#90e0ef",
  coverPage: 11,
  pages: pages([
    ["Deep down in the ocean blue, where the bubbles love to play, Finn the fish had a great big plan, a plan for a special day.", (s) => {
      a.sky(s, WATER, "Water");
      a.sand(s, 500);
      a.rock(s, 660, 510, 100, 55);
      a.seaweed(s, 110, 530, 170);
      a.seaweed(s, 200, 540, 120);
      a.fish(s, 430, 280, 1);
      a.bubbles(s, [[560, 200, 16], [590, 150, 11], [575, 110, 8], [300, 120, 12]]);
    }],
    ["“It's Olly's birthday!” Finn said. “Let's make it big and grand! We'll throw a surprise party right here on the sand!”", (s) => {
      a.sky(s, WATER, "Water");
      a.sand(s, 510);
      a.starfish(s, 130, 520, 48);
      a.octopus(s, 580, 330, 1);
      a.fish(s, 240, 230, 0.9);
    }],
    ["Finn wrote invitations, one, two, three, and sent them swimming through the sea. “Come to the party! But shh, don't tell! It's a surprise, so hide it well!”", (s) => {
      a.sky(s, WATER, "Water");
      a.sand(s, 520);
      a.fish(s, 200, 380, 0.9);
      a.envelope(s, 420, 300, 1, "#ffc8dd");
      a.envelope(s, 560, 200, 0.9, "#bde0fe");
      a.envelope(s, 680, 330, 0.8, "#caffbf");
      a.bubbles(s, [[330, 220, 12], [360, 170, 8]]);
    }],
    ["Crab brought shells, and Starfish brought light. The seaweed swayed to the left and the right.", (s) => {
      a.sky(s, WATER, "Water");
      a.sand(s, 480);
      a.seaweed(s, 90, 500, 200);
      a.seaweed(s, 720, 500, 180);
      a.shells(s, [[140, 575], [430, 570], [690, 580]]);
      a.starfish(s, 280, 470, 55);
      a.crab(s, 540, 440, 1);
    }],
    ["Turtle came paddling, steady and slow, with a stack of party hats all in a row. “One for you and one for me! The best dressed party in the sea!”", (s) => {
      a.sky(s, WATER, "Water");
      a.sand(s, 520);
      a.turtle(s, 380, 540, 1.4);
      a.partyHat(s, 505, 452, 0.7);
      a.partyHat(s, 650, 470, 0.7);
      a.bubbles(s, [[160, 200, 14], [190, 150, 10], [650, 150, 12]]);
    }],
    ["Balloons made of bubbles, all shiny, big and round, floated up and up and up without a single sound.", (s) => {
      a.sky(s, WATER, "Water");
      a.sand(s, 520);
      a.balloon(s, 200, 200, "#f72585");
      a.balloon(s, 330, 150, "#4895ef");
      a.balloon(s, 460, 210, "#ffd166");
      a.fish(s, 610, 420, 0.8, true);
    }],
    ["“Shh! Here comes Olly! Everyone hide!” Behind the big rock they tucked inside. Crab put his claws right over his eyes, all ready to shout the big SURPRISE!", (s) => {
      a.sky(s, WATER, "Water");
      a.sand(s, 500);
      a.octopus(s, 150, 240, 0.55);
      a.rock(s, 420, 480, 190, 95);
      a.seaweed(s, 760, 530, 170);
      a.crab(s, 630, 460, 0.8);
    }],
    ["A cake of kelp with candles bright. “SURPRISE, Olly!” What a sight! Olly giggled with delight and hugged his friends so tight.", (s) => {
      a.sky(s, WATER, "Water");
      a.sand(s, 520);
      a.cake(s, 280, 545);
      a.octopus(s, 610, 320, 0.85);
    }],
    ["Olly opened presents, one by one: a sparkly shell and a ball for fun! “Thank you, friends, you're oh so sweet! This party is a special treat!”", (s) => {
      a.sky(s, WATER, "Water");
      a.sand(s, 520);
      a.octopus(s, 560, 300, 0.9);
      a.present(s, 160, 560, 150, 120, "#f72585");
      a.present(s, 330, 560, 110, 90, "#4895ef");
      a.ball(s, 720, 530, 38);
    }],
    ["They played a game of seaweed tag, with swishing tails and zig and zag. Finn was fast, but Olly, you see, with eight long arms, won one, two, three!", (s) => {
      a.sky(s, WATER, "Water");
      a.sand(s, 520);
      a.seaweed(s, 90, 540, 190);
      a.seaweed(s, 720, 540, 190);
      a.fish(s, 250, 200, 0.8);
      a.octopus(s, 480, 330, 0.9);
      a.bubbles(s, [[330, 380, 12], [360, 430, 9]]);
    }],
    ["Then everyone sang it loud and clear: “Happy birthday, Olly dear!” The bubbles danced, the seashells rang, and even the shy little starfish sang.", (s) => {
      a.sky(s, WATER, "Water");
      a.sand(s, 520);
      a.shells(s, [[110, 575], [690, 580]]);
      a.starfish(s, 180, 470, 50);
      a.octopus(s, 480, 320, 0.95);
      a.musicNote(s, 230, 250);
      a.musicNote(s, 300, 180, 0.8);
      a.musicNote(s, 690, 200);
      a.bubbles(s, [[680, 330, 12], [710, 380, 8]]);
    }],
    ["They danced and laughed the whole day through, from morning until night. Happy birthday, Olly! We love you! Everything felt just right.", (s) => {
      a.sky(s, WATER, "Water");
      a.sand(s, 520);
      a.starfish(s, 690, 520, 40);
      a.bubbles(s, [[80, 380, 14], [110, 330, 10], [720, 300, 12], [700, 250, 8]]);
      a.fish(s, 170, 190, 0.7);
      a.heart(s, 640, 140, 1.3);
      a.octopus(s, 400, 320, 1);
    }],
  ]),
};

export const BOOKS: Book[] = [luna, dino, sea];

export function findBook(slug: string | undefined): Book | undefined {
  return BOOKS.find((b) => b.slug === slug);
}
