// Function words dropped from the word cloud. Lowercase, apostrophes removed (tokens are stored that way).

const ENGLISH = `
a about above after again against all also am an and any are as at be because been before being below
between both but by can cant could did didnt do does doesnt doing done dont down during each even ever
every few for from further get gets got had has have having he her here hers herself hes him himself his
how i id if ill im in into is isnt it its itself ive just let lets me more most much must my myself no nor
not now of off oh ok on once only or other our ours ourselves out over own really same she should so some
still such than that thats the their theirs them themselves then there these they theyre this those
through to too under until up upon us very was we were what when where which while who whom whose why will
with wont would yet you youre your yours yourself yourselves
`;

const TAGALOG = `
ako ikaw ka siya sya kami tayo kayo sila ko mo niya nya namin natin ninyo nyo nila akin iyo kanya kaniya
amin atin inyo kanila aking iyong kanyang kaniyang aming ating inyong kanilang ang ng nang mga sa si sina
ni nina kay kina na at ay ito iyan iyon yan yun yon dito rito diyan dyan doon roon dun nito niyan niyon noon
ganito ganyan ganoon ba po ho opo oo din rin lang lamang naman pa nga kasi pero ngunit subalit kung kapag
pag para dahil upang sapagkat may mayroon meron wala hindi di huwag wag ung yung ano sino saan kailan bakit
paano alin lahat bawat ngayon man kahit tulad gaya kaya sana
`;

const toSet = (list: string) => list.split(/\s+/).filter((word) => word.length > 0);

export const STOP_WORDS: ReadonlySet<string> = new Set([...toSet(ENGLISH), ...toSet(TAGALOG)]);
