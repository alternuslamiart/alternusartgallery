// Comprehensive AI Assistant for Alternus Gallery
// Handles both English and Albanian languages with extensive art knowledge

interface AIResponse {
  content: string;
  suggestedQuestions?: string[];
}

// Art Movement Knowledge Base
const ART_MOVEMENTS = {
  impressionism: {
    en: `**Impressionism** (1860s-1880s) is characterized by:

- **Light & Color**: Capturing fleeting effects of light and atmosphere
- **Brushwork**: Visible, loose brushstrokes that create texture
- **Everyday Scenes**: Focus on ordinary life, landscapes, and leisure
- **Outdoor Painting**: "En plein air" technique - painting outdoors
- **Key Artists**: Claude Monet, Pierre-Auguste Renoir, Edgar Degas, Camille Pissarro

The movement revolutionized art by prioritizing perception over precision. Monet's "Impression, Sunrise" gave the movement its name.

Browse our Impressionist collection: /gallery?category=Impressionism`,
    sq: `**Impresionizmi** (1860-1880) karakterizohet nga:

- **Drita & Ngjyra**: Kapja e efekteve kalimtare te drites
- **Peneli**: Goditje te dukshme qe krijojne teksture
- **Skena te Perditshme**: Fokus ne jeten normale dhe peizazhet
- **Piktura Jashte**: Teknika "En plein air" - piktura ne natyre
- **Artistet Kryesore**: Claude Monet, Pierre-Auguste Renoir, Edgar Degas

Shfleto koleksionin tone Impresionist: /gallery?category=Impressionism`
  },

  expressionism: {
    en: `**Expressionism** (1905-1920s) is an emotional, intense style:

- **Emotion Over Reality**: Distorted forms to express inner feelings
- **Bold Colors**: Vivid, often non-naturalistic color choices
- **Brushwork**: Aggressive, dynamic strokes
- **Psychological Depth**: Exploring anxiety, alienation, and human condition
- **Key Artists**: Edvard Munch, Wassily Kandinsky, Ernst Ludwig Kirchner

Famous works include Munch's "The Scream" - a powerful expression of existential anxiety.

Explore Expressionist works: /gallery?category=Expressionism`,
    sq: `**Ekspresionizmi** (1905-1920) eshte nje stil emocional dhe intensiv:

- **Emocioni Mbi Realitetin**: Forma te shtrembëruara per te shprehur ndjenjat
- **Ngjyra te Guximshme**: Zgjedhje te gjalla ngjyrash
- **Thellesie Psikologjike**: Eksplorimi i ankthit dhe gjendjes njerezore
- **Artistet Kryesore**: Edvard Munch, Wassily Kandinsky

Veprat e famshme perfshijne "Klithma" e Munch - shprehje e fuqishme e ankthit ekzistencial.

Eksploro veprat Ekspresioniste: /gallery?category=Expressionism`
  },

  abstract: {
    en: `**Abstract Art** breaks away from realistic representation:

- **Non-Representational**: No recognizable subjects
- **Pure Form**: Focus on color, shape, line, and texture
- **Emotional Expression**: Communicating through visual elements alone
- **Geometric vs Organic**: From precise shapes to fluid forms
- **Key Artists**: Wassily Kandinsky, Piet Mondrian, Kazimir Malevich, Jackson Pollock

Abstract art invites personal interpretation - each viewer finds their own meaning.

Discover Abstract masterpieces: /gallery?category=Abstract`,
    sq: `**Arti Abstrakt** largohet nga perfaqesimi realist:

- **Jo-Perfaqesues**: Nuk ka subjekte te njohura
- **Forma e Paster**: Fokus ne ngjyra, forma, vija dhe teksture
- **Shprehje Emocionale**: Komunikim permes elementeve vizuale
- **Artistet Kryesore**: Wassily Kandinsky, Piet Mondrian, Jackson Pollock

Arti abstrakt fton interpretim personal - cdo shikues gjen kuptimin e vet.

Zbulo kryeveprat Abstrakte: /gallery?category=Abstract`
  },

  baroque: {
    en: `**Baroque** (1600-1750) is dramatic and ornate:

- **Drama & Emotion**: Theatrical compositions with intense emotion
- **Light & Shadow**: Strong chiaroscuro (contrast between light and dark)
- **Rich Detail**: Elaborate ornamentation and textures
- **Movement**: Dynamic, flowing compositions
- **Key Artists**: Caravaggio, Rembrandt, Peter Paul Rubens, Vermeer

Baroque art was designed to inspire awe and convey power and grandeur.

View Baroque collection: /gallery?category=Baroque`,
    sq: `**Baroku** (1600-1750) eshte dramatik dhe i zbukuruar:

- **Drama & Emocioni**: Kompozime teatrale me emocione intense
- **Drita & Hija**: Kontrast i forte (chiaroscuro)
- **Detaje te Pasura**: Zbukurime te elaboruara dhe tekstura
- **Levizje**: Kompozime dinamike
- **Artistet Kryesore**: Caravaggio, Rembrandt, Peter Paul Rubens

Arti Barok u krijua per te frymezuar mahnitje dhe per te percjelle fuqi.

Shiko koleksionin Barok: /gallery?category=Baroque`
  },

  realism: {
    en: `**Realism** (1840s-1880s) depicts life as it truly is:

- **Truthful Depiction**: Accurate representation of everyday subjects
- **Social Commentary**: Often highlighted working-class life
- **Rejection of Idealization**: No romanticizing or dramatizing
- **Detailed Technique**: Precise, careful brushwork
- **Key Artists**: Gustave Courbet, Jean-François Millet, Honoré Daumier

Realism brought dignity to ordinary subjects and challenged academic traditions.

Browse Realistic works: /gallery?style=Realism`,
    sq: `**Realizmi** (1840-1880) paraqet jeten sic eshte vertet:

- **Paraqitje e Vertete**: Perfaqesim i sakte i subjekteve te perditshme
- **Koment Social**: Shpesh theksonte jeten e klases puntore
- **Refuzim i Idealizimit**: Pa romantizim apo dramatizim
- **Artistet Kryesore**: Gustave Courbet, Jean-François Millet

Realizmi solli dinjitet per subjektet e zakonshme.

Shfleto veprat Realiste: /gallery?style=Realism`
  },

  minimalism: {
    en: `**Minimalism** embraces simplicity:

- **Less is More**: Stripped down to essential elements
- **Clean Lines**: Precise, geometric forms
- **Limited Palette**: Often monochromatic or few colors
- **Space**: Emphasis on negative space
- **Key Artists**: Donald Judd, Frank Stella, Agnes Martin

Minimalist art focuses on the purity of form and the viewing experience itself.

Explore Minimalist pieces: /gallery?style=Minimalist`,
    sq: `**Minimalizmi** perqafon thjeshtesinë:

- **Me Pak Eshte Me Shume**: Reduktuar ne elemente esenciale
- **Vija te Pastra**: Forma precize, gjeometrike
- **Palete e Kufizuar**: Shpesh monokromatike
- **Hapesira**: Theksim ne hapesiren negative
- **Artistet Kryesore**: Donald Judd, Frank Stella, Agnes Martin

Eksploro pjeset Minimaliste: /gallery?style=Minimalist`
  }
};

// Comprehensive responses database
const KNOWLEDGE_BASE = {
  // Gallery & About
  about: {
    en: `**Welcome to Alternus Gallery!**

Alternus is a premium online art marketplace connecting passionate collectors with exceptional artists worldwide.

**What We Offer:**
- Original paintings and artworks
- Curated selection of diverse styles
- Direct connection with artists
- Certificate of authenticity for every piece
- Secure worldwide shipping
- 14-day satisfaction guarantee

**Our Mission:** Making fine art accessible while supporting independent artists.

Visit our Gallery to start exploring: /gallery`,
    sq: `**Miresevini ne Alternus Gallery!**

Alternus eshte nje treg premium online i artit qe lidh koleksionistet e pasionuar me artistet e jashtezakonshem ne mbare boten.

**Cfare Ofrojme:**
- Piktura dhe vepra origjinale
- Perzgjedhje e kuruar e stileve te ndryshme
- Lidhje e drejtperdrejte me artistet
- Certifikate autenticiteti per cdo pjese
- Dergese e sigurt ne mbare boten
- Garanci kenaqesie 14-ditore

**Misioni Yne:** Te bejme artin e mire te aksesueshme duke mbeshtetür artistet e pavarur.

Vizito Galerine tone: /gallery`
  },

  // Registration & Account
  registration: {
    en: `**Creating Your Alternus Account**

Joining Alternus is free and gives you access to:

**Benefits:**
- Save favorite artworks to your wishlist
- Track your orders easily
- Get personalized recommendations
- Receive exclusive offers and new arrivals
- Connect directly with artists

**How to Register:**
1. Click "Sign Up" in the top navigation
2. Enter your email, name, and create a password
3. Verify your email (check your inbox)
4. Start exploring and collecting!

**Already have an account?** Log in here: /login
**Ready to join?** Sign up now: /signup`,
    sq: `**Krijimi i Llogarise tuaj Alternus**

Bashkimi me Alternus eshte falas dhe ju jep akses ne:

**Perfitimet:**
- Ruani veprat e preferuara ne listen e deshirave
- Ndiqni porosite tuaja lehtesisht
- Merrni rekomandime te personalizuara
- Merrni oferta ekskluzive dhe arritje te reja
- Lidhuni drejtperdrejt me artistet

**Si te Regjistroheni:**
1. Klikoni "Sign Up" ne navigimin e siperme
2. Vendosni email-in, emrin dhe krijoni nje fjalekalim
3. Verifikoni email-in tuaj (kontrolloni inbox-in)
4. Filloni te eksploroni dhe koleksiononi!

**Keni nje llogari?** Hyni ketu: /login
**Gati per t'u bashkuar?** Regjistrohuni tani: /signup`
  },

  // Artists
  artists: {
    en: `**Our Artists**

Alternus features a curated community of talented artists from around the world. Each artist is carefully selected for:

- **Quality**: Exceptional skill and craftsmanship
- **Originality**: Unique artistic vision
- **Professionalism**: Reliable and dedicated to collectors

**Browse Artists:**
Visit individual artist profiles to see their:
- Complete portfolio
- Biography and artistic journey
- Available works and pricing
- Commission availability

**Want to Become an Artist?**
We're always seeking talented creators! Apply through: /signup
Requirements: Portfolio, professional experience, original work.

Explore our artists: /gallery`,
    sq: `**Artistet Tane**

Alternus paraqet nje komunitet te kuruar artistesh te talentuar nga e gjithe bota. Cdo artist zgjidhet me kujdes per:

- **Cilesine**: Aftesi dhe mjeshtri te jashtezakonshme
- **Origjinalitetin**: Vizion unik artistik
- **Profesionalizmin**: Te besueshëm dhe te perkushtuar

**Shfleto Artistet:**
Vizitoni profilet individuale te artisteve per te pare:
- Portfolion e plote
- Biografine dhe udhetimin artistik
- Veprat e disponueshme dhe cmimet

**Deshironi te Beheni Artist?**
Jemi gjithmone duke kerkuar krijues te talentuar! Aplikoni permes: /signup

Eksploro artistet tane: /gallery`
  },

  // Pricing & Value
  pricing: {
    en: `**Art Pricing at Alternus**

Our artworks range from accessible to investment-grade pieces:

**Price Ranges:**
- **Under €500**: Prints and smaller original works
- **€500 - €2,000**: Mid-size original paintings
- **€2,000 - €5,000**: Large original works
- **€5,000+**: Premium masterpieces

**What Determines Art Value?**
- **Artist reputation** and exhibition history
- **Size** of the artwork
- **Medium** (oil, acrylic, mixed media)
- **Complexity** and time invested
- **Originality** vs prints/reproductions
- **Provenance** and authenticity

**Investment Tips:**
- Buy what you love - art should bring joy
- Original works typically appreciate more than prints
- Emerging artists can be excellent investments
- Always get a certificate of authenticity

Browse by budget: /gallery`,
    sq: `**Cmimet e Artit ne Alternus**

Veprat tona variojne nga pjese te aksesueshme deri tek ato te nivelit te investimit:

**Gama e Cmimeve:**
- **Nen €500**: Printime dhe vepra te vogla origjinale
- **€500 - €2,000**: Piktura origjinale mesatare
- **€2,000 - €5,000**: Vepra te medha origjinale
- **€5,000+**: Kryevepra premium

**Cfare Percakton Vleren e Artit?**
- **Reputacioni i artistit** dhe historia e ekspozitave
- **Madhesia** e vepres
- **Mediumi** (vaj, akrilik, media te perziera)
- **Kompleksiteti** dhe koha e investuar
- **Origjinaliteti** kunder printimeve
- **Provenienca** dhe autenticiteti

Shfleto sipas buxhetit: /gallery`
  },

  // Buying Process
  buying: {
    en: `**How to Buy Art at Alternus**

**Step-by-Step Process:**

1. **Browse & Discover**
   - Explore our gallery by style, price, or artist
   - Use filters to find your perfect piece

2. **View Details**
   - Click on artwork for full details
   - See dimensions, medium, and artist info
   - View in room preview to visualize in your space

3. **Add to Cart**
   - Select any framing options if available
   - Add to cart when ready

4. **Secure Checkout**
   - Enter shipping information
   - Choose payment method (Card, PayPal, etc.)
   - All transactions are encrypted and secure

5. **Receive Your Art**
   - Track your order in your account
   - Artwork arrives carefully packaged
   - 14-day return policy if not satisfied

**Payment Methods:** Visa, Mastercard, PayPal, Apple Pay, Google Pay

Start shopping: /gallery`,
    sq: `**Si te Blini Art ne Alternus**

**Procesi Hap pas Hapi:**

1. **Shfleto & Zbulo**
   - Eksploro galerine tone sipas stilit, cmimit ose artistit
   - Perdor filtrat per te gjetur pjesen perfekte

2. **Shiko Detajet**
   - Kliko ne veper per detaje te plota
   - Shiko dimensionet, mediumin dhe info te artistit
   - Shiko parapamjen ne dhome

3. **Shto ne Shporte**
   - Zgjidh opsionet e kornizes nese disponohen
   - Shto ne shporte kur te jesh gati

4. **Pagese e Sigurt**
   - Vendos informacionin e dergeses
   - Zgjidh metoden e pageses (Karte, PayPal, etj.)

5. **Merr Artin Tend**
   - Ndiq porosine ne llogarine tende
   - Vepra vjen e paketuar me kujdes
   - Politike kthimi 14-ditore

Fillo blerjen: /gallery`
  },

  // Shipping
  shipping: {
    en: `**Shipping Information**

**Worldwide Delivery:**
We ship to most countries with careful packaging.

**Shipping Costs:**
- **Free shipping** on orders over €100
- Standard rates based on size and destination
- Express options available at checkout

**Packaging:**
- Professional art packaging
- Protective corners and wrap
- Insurance included for high-value pieces

**Delivery Times:**
- **Europe**: 5-10 business days
- **USA/Canada**: 7-14 business days
- **Rest of World**: 10-21 business days

**Tracking:**
Every order includes tracking. Check status in your account or use our order tracker on the homepage.

Track your order: Enter your order number on our homepage`,
    sq: `**Informacioni i Dergeses**

**Dergese ne Mbare Boten:**
Dergojme ne shumicen e vendeve me paketim te kujdesshem.

**Kostot e Dergeses:**
- **Dergese falas** per porosi mbi €100
- Tarifa standarde bazuar ne madhesi dhe destinacion
- Opsione ekspres te disponueshme

**Paketimi:**
- Paketim profesional arti
- Qoshe mbrojtese dhe mbeshtellje
- Sigurim i perfshire per pjese me vlere te larte

**Kohet e Dergeses:**
- **Evrope**: 5-10 dite pune
- **SHBA/Kanade**: 7-14 dite pune
- **Pjesa tjeter**: 10-21 dite pune

**Gjurmimi:**
Cdo porosi perfshine gjurmim. Kontrolloni statusin ne llogarine tuaj.`
  },

  // Returns
  returns: {
    en: `**Return Policy**

We want you to love your art! If you're not completely satisfied:

**14-Day Return Policy:**
- Return within 14 days of delivery
- Artwork must be in original condition
- Original packaging preferred

**How to Return:**
1. Contact us at info@alternusart.com
2. Describe the reason for return
3. We'll provide return instructions
4. Refund processed within 5-7 business days

**Exceptions:**
- Custom commissions are non-refundable
- Damaged items (contact us immediately with photos)

**Exchanges:**
We're happy to help you find a better match! Contact our support team.

Need help? Email: info@alternusart.com`,
    sq: `**Politika e Kthimit**

Duam te dashuroni artin tuaj! Nese nuk jeni plotesisht te kenaqur:

**Politika e Kthimit 14-Ditor:**
- Ktheni brenda 14 diteve nga dergesa
- Vepra duhet te jete ne gjendje origjinale
- Paketimi origjinal preferohet

**Si te Ktheni:**
1. Na kontaktoni ne info@alternusart.com
2. Pershkruani arsyen e kthimit
3. Do t'ju japim udhezime kthimi
4. Rimbursimi procesohet brenda 5-7 diteve pune

**Perjashttime:**
- Porosite me porosi nuk rimbursohen
- Artikujt e demtuar (na kontaktoni menjehere me foto)

Keni nevoje per ndihme? Email: info@alternusart.com`
  },

  // Contact
  contact: {
    en: `**Contact Us**

We're here to help with any questions!

**Response time:** Within 24 hours

**How to Reach Us:**
- **Support Form**: Submit a request at /support
- **Chat**: I'm here 24/7 for quick questions
- **Curator**: For artwork inquiries, visit /support

**What We Can Help With:**
- Order inquiries and tracking
- Artist questions
- Custom commissions
- Returns and refunds
- Technical support
- Art recommendations

Visit our support page: /support`,
    sq: `**Na Kontaktoni**

Jemi ketu per te ndihmuar me cdo pyetje!

**Koha e pergjigjes:** Brenda 24 oreve

**Si te na kontaktoni:**
- **Formulari i Mbeshtetjes**: Dergoni kerkese ne /support
- **Chat**: Jam ketu 24/7 per pyetje te shpejta
- **Kuratori**: Per pyetje rreth veprave, vizitoni /support

Vizitoni faqen e mbeshtetjes: /support`
  },

  // Commission
  commission: {
    en: `**Custom Art Commissions**

Many of our artists accept custom commissions for personalized artwork!

**How It Works:**
1. **Browse Artists**: Find an artist whose style you love
2. **Contact Artist**: Use the message feature on their profile
3. **Discuss Your Vision**: Share your ideas, size, colors, subject
4. **Get a Quote**: Artist provides pricing and timeline
5. **Approve & Pay**: Secure payment through our platform
6. **Progress Updates**: Artist shares work-in-progress photos
7. **Receive Your Art**: Your unique piece is delivered!

**Commission Ideas:**
- Portrait of loved ones or pets
- Landscape of a special place
- Abstract in your favorite colors
- Reproduction-style of classic works

**Tips:**
- Be specific about size and color preferences
- Share reference images if helpful
- Discuss timeline expectations upfront

Contact an artist to start your commission!`,
    sq: `**Porosi te Personalizuara Arti**

Shume nga artistet tane pranojne porosi te personalizuara!

**Si Funksionon:**
1. **Shfleto Artistet**: Gjeni nje artist stili i te cilit ju pelqen
2. **Kontaktoni Artistin**: Perdorni mesazhin ne profilin e tyre
3. **Diskutoni Vizionin Tuaj**: Ndani idet, madhesine, ngjyrat
4. **Merrni nje Kuotim**: Artisti jep cmimin dhe afatin kohor
5. **Aprovoni & Paguani**: Pagese e sigurt permes platformes
6. **Perditesime Progresi**: Artisti ndan foto gjate punes
7. **Merrni Artin Tuaj**: Pjesa juaj unike dergohet!

**Ide per Porosi:**
- Portret i te dashurve ose kafsheve
- Peizazh i nje vendi te vecante
- Abstrakt ne ngjyrat tuaja te preferuara

Kontaktoni nje artist per te filluar porosine tuaj!`
  },

  // Frames
  framing: {
    en: `**Framing Options**

Many artworks offer professional framing options:

**Available Frames:**
- **No Frame**: Canvas or paper only (ready to frame yourself)
- **Black Frame**: Classic, modern look - suits most interiors
- **White Frame**: Clean, gallery-style presentation
- **Natural Wood**: Warm, organic feel

**What's Included:**
- Museum-quality framing
- UV-protective glass/acrylic
- Professional mounting
- Ready to hang

**Pricing:**
Frame costs are added to the artwork price and vary by size.

**Can't Find the Right Frame?**
You can also purchase artwork unframed and use a local framing service for custom options.

Browse framed artworks: /gallery`,
    sq: `**Opsionet e Kornizave**

Shume vepra ofrojne opsione kornizash profesionale:

**Kornizat e Disponueshme:**
- **Pa Kornize**: Vetem canvas ose leter
- **Kornize e Zeze**: Pamje klasike, moderne
- **Kornize e Bardhe**: Prezantim stili galerie
- **Dru Natyral**: Ndjenje e ngrohte, organike

**Cfare Perfshihet:**
- Kornizim i cilesise se muzeut
- Xham/akrilik me mbrojtje UV
- Montim profesional
- Gati per t'u varur

Shfleto veprat me kornize: /gallery`
  },

  // Art techniques
  techniques: {
    en: `**Art Techniques & Mediums**

Understanding different techniques helps appreciate artwork:

**Oil Painting:**
- Rich, luminous colors
- Slow drying allows blending
- Traditional and highly valued

**Acrylic Painting:**
- Fast drying, versatile
- Vibrant colors
- Can mimic oil or watercolor

**Watercolor:**
- Transparent, flowing effects
- Delicate and luminous
- Traditionally on paper

**Mixed Media:**
- Combines multiple techniques
- Often includes collage elements
- Contemporary and innovative

**Digital Art:**
- Created using digital tools
- Printed on high-quality media
- Limitless creative possibilities

**Printmaking:**
- Lithographs, etchings, screen prints
- Often in limited editions
- Collectible and more accessible

Each technique creates unique textures and effects!`,
    sq: `**Teknikat dhe Mediumet e Artit**

Kuptimi i teknikave te ndryshme ndihmon vleresimin e vepres:

**Pikture me Vaj:**
- Ngjyra te pasura, te ndritshme
- Tharja e ngadalte lejon perzierjen
- Tradicionale dhe shume e vleresuar

**Pikture Akrilike:**
- Tharja e shpejte, e shume-anesore
- Ngjyra te gjalla
- Mund te imitoje vajin ose akuarelin

**Akuarel:**
- Efekte transparente, te rrjedhshme
- Delikate dhe te ndritshme

**Media te Perziera:**
- Kombinon teknika te shumta
- Shpesh perfshine elemente kolazhi

**Art Digjital:**
- Krijuar duke perdorur mjete digjitale
- Printuar ne media te cilesise se larte

Cdo teknike krijon tekstura dhe efekte unike!`
  }
};

// Greeting responses
const GREETINGS = {
  en: [
    "Hello! Welcome to Alternus Gallery. I'm your AI art assistant. How can I help you discover amazing art today?",
    "Hi there! I'm Alternus AI, ready to help you explore our collection. What kind of art interests you?",
    "Welcome! I'm here to help with anything from finding the perfect artwork to learning about art movements. What would you like to know?"
  ],
  sq: [
    "Pershendetje! Miresevini ne Alternus Gallery. Une jam asistenti juaj i artit AI. Si mund t'ju ndihmoj te zbuloni art te mahnitshëm sot?",
    "Tung! Jam Alternus AI, gati t'ju ndihmoj te eksploroni koleksionin tone. Cfare lloji arti ju intereson?",
    "Miresevini! Jam ketu per te ndihmuar me cdo gje nga gjetja e vepres perfekte deri tek mesimi per levizjet e artit. Cfare deshironi te dini?"
  ]
};

// Thank you responses
const THANKS = {
  en: [
    "You're welcome! Feel free to ask if you have any other questions. Happy art hunting!",
    "My pleasure! I'm here whenever you need help exploring our gallery.",
    "Glad I could help! Don't hesitate to reach out for more art recommendations."
  ],
  sq: [
    "Ju lutem! Mos hezitoni te pyesni nese keni pyetje te tjera. Gjetje te gezuar te artit!",
    "Me kenaqesi! Jam ketu sa here qe keni nevoje per ndihme.",
    "Gezohëm qe munda te ndihmoj! Mos hezitoni te kontaktoni per me shume rekomandime."
  ]
};

// Goodbye responses
const GOODBYES = {
  en: [
    "Goodbye! Thank you for visiting Alternus Gallery. Come back anytime to explore more beautiful artworks!",
    "See you soon! Remember, great art is waiting for you at Alternus.",
    "Take care! Feel free to return whenever you're ready to add to your collection."
  ],
  sq: [
    "Mirupafshim! Faleminderit qe vizituat Alternus Gallery. Kthehuni kurdo per te eksploruar me shume vepra te bukura!",
    "Shihemi se shpejti! Mbani mend, arti i madh po ju pret ne Alternus.",
    "Kujdesuni! Mos ngurroni te ktheheni sa here qe te jeni gati te shtoni ne koleksionin tuaj."
  ]
};

// Default/fallback responses
const DEFAULT_RESPONSES = {
  en: [
    "That's an interesting question! I'd be happy to help. Could you tell me more about what you're looking for? I can assist with:\n\n- Finding specific artworks or styles\n- Learning about art movements\n- Understanding pricing and value\n- Registration and account help\n- Shipping and returns\n\nWhat interests you most?",
    "I want to make sure I give you the best answer. Are you asking about:\n\n1. Our artwork collection?\n2. A specific art style or movement?\n3. How to buy or sell art?\n4. Account or order questions?\n\nLet me know and I'll guide you!",
    "Great question! To help you better, could you specify if you're interested in:\n\n- Browsing artworks\n- Learning about art history\n- Account/registration help\n- Pricing information\n- Shipping details"
  ],
  sq: [
    "Kjo eshte nje pyetje interesante! Do te isha i lumtur te ndihmoj. A mund te me tregoni me shume per ate qe po kerkoni? Mund te ndihmoj me:\n\n- Gjetjen e veprave ose stileve specifike\n- Mesimin per levizjet e artit\n- Kuptimin e cmimeve dhe vleres\n- Ndihme per regjistrim dhe llogari\n- Dergese dhe kthime\n\nCfare ju intereson me shume?",
    "Dua te sigurohem qe po ju jap pergjigjen me te mire. A po pyesni per:\n\n1. Koleksionin tone te veprave?\n2. Nje stil ose levizje specifike arti?\n3. Si te blini ose shisni art?\n4. Pyetje per llogarine ose porosine?\n\nMe tregoni dhe do t'ju drejtoj!"
  ]
};

// Detect language (Albanian or English)
function detectLanguage(message: string): 'en' | 'sq' {
  const albanianPatterns = [
    /\b(pershendetje|miredita|tung|miresevini|faleminderit)\b/i,
    /\b(cfare|kush|ku|si|pse|kur|sa)\b/i,
    /\b(eshte|jane|kam|keni|mund|duhet)\b/i,
    /\b(arti|piktura|galeria|artisti|cmimi)\b/i,
    /\b(regjistrim|llogari|dergese|kthim)\b/i,
    /\b(ngjyra|madhesia|stili|vlera)\b/i,
    /ë|ç/i
  ];

  for (const pattern of albanianPatterns) {
    if (pattern.test(message)) {
      return 'sq';
    }
  }
  return 'en';
}

// Get random item from array
function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Main AI response function
export function getAIResponse(message: string): AIResponse {
  const lowerMessage = message.toLowerCase().trim();
  const lang = detectLanguage(message);

  // Greetings
  if (lowerMessage.match(/^(hi|hello|hey|good\s*(morning|afternoon|evening)|greetings|pershendetje|miredita|tung|miresevini|tungjatjeta)/i)) {
    return {
      content: randomChoice(GREETINGS[lang]),
      suggestedQuestions: lang === 'sq'
        ? ["Cfare eshte Alternus?", "Si te blej art?", "Tregom per stilet e artit"]
        : ["What is Alternus?", "How do I buy art?", "Tell me about art styles"]
    };
  }

  // Thank you
  if (lowerMessage.match(/\b(thank|thanks|faleminderit|rrofsh|shume mire)\b/i)) {
    return { content: randomChoice(THANKS[lang]) };
  }

  // Goodbye
  if (lowerMessage.match(/\b(bye|goodbye|see you|mirupafshim|shihemi|ciao|tung)\b/i)) {
    return { content: randomChoice(GOODBYES[lang]) };
  }

  // About Alternus
  if (lowerMessage.match(/\b(about|what is alternus|tell me about alternus|cfare eshte alternus|per alternus|rreth alternus)\b/i)) {
    return { content: KNOWLEDGE_BASE.about[lang] };
  }

  // Registration / Account
  if (lowerMessage.match(/\b(register|sign\s*up|create account|join|regjistrim|regjistrohem|krijo llogari|hap llogari|anetaresohem)\b/i)) {
    return { content: KNOWLEDGE_BASE.registration[lang] };
  }

  if (lowerMessage.match(/\b(login|log\s*in|sign\s*in|llogari|kyqu|hyr|password|fjalkalim)\b/i)) {
    return {
      content: lang === 'sq'
        ? "Per te hyre ne llogarine tuaj, vizitoni faqen e hyrjes: /login\n\nNese keni harruar fjalekalimin, klikoni 'Forgot Password' per ta rivendosur.\n\nNuk keni llogari? Regjistrohuni ketu: /signup"
        : "To access your account, visit the login page: /login\n\nIf you've forgotten your password, click 'Forgot Password' to reset it.\n\nDon't have an account? Register here: /signup"
    };
  }

  // Artists
  if (lowerMessage.match(/\b(artist|artists|painter|creators|artiste|artistet|piktur|krijues)\b/i)) {
    return { content: KNOWLEDGE_BASE.artists[lang] };
  }

  // Art Movements
  if (lowerMessage.match(/\b(impressioni|monet|renoir|impresioni)\b/i)) {
    return { content: ART_MOVEMENTS.impressionism[lang] };
  }

  if (lowerMessage.match(/\b(expression|munch|ekspresioni)\b/i)) {
    return { content: ART_MOVEMENTS.expressionism[lang] };
  }

  if (lowerMessage.match(/\b(abstract|kandinsky|pollock|abstrakt)\b/i)) {
    return { content: ART_MOVEMENTS.abstract[lang] };
  }

  if (lowerMessage.match(/\b(baroque|caravaggio|rembrandt|barok)\b/i)) {
    return { content: ART_MOVEMENTS.baroque[lang] };
  }

  if (lowerMessage.match(/\b(realism|realistic|courbet|realizm|realist)\b/i)) {
    return { content: ART_MOVEMENTS.realism[lang] };
  }

  if (lowerMessage.match(/\b(minimal|minimalist|simple|minimal)\b/i)) {
    return { content: ART_MOVEMENTS.minimalism[lang] };
  }

  // Art styles general
  if (lowerMessage.match(/\b(style|styles|type of art|genre|stile|stilet|lloj arti|kategori)\b/i)) {
    return {
      content: lang === 'sq'
        ? `**Stilet e Artit ne Alternus**\n\nNe ofrojme nje game te gjere stilesh:\n\n- **Abstrakt** - Vepra ekspresive, jo-perfaqesuese\n- **Impresionizem** - Fokus ne drite dhe ngjyra\n- **Ekspresionizem** - Shprehje emocionale intense\n- **Barok** - Dramatik dhe i zbukuruar\n- **Realizem** - Perfaqesime te detajuara, realiste\n- **Minimalizem** - Kompozime te pastra, te thjeshta\n- **Fotografi** - Arte fotografike te bukura\n\nPerdor filtrat ne Galeri per te eksploruar cdo stil: /gallery`
        : `**Art Styles at Alternus**\n\nWe offer a wide range of styles:\n\n- **Abstract** - Expressive, non-representational works\n- **Impressionism** - Focus on light and color\n- **Expressionism** - Intense emotional expression\n- **Baroque** - Dramatic and ornate\n- **Realism** - Detailed, lifelike representations\n- **Minimalism** - Clean, simple compositions\n- **Photography** - Beautiful photographic art\n\nUse filters in the Gallery to explore each style: /gallery`
    };
  }

  // Pricing / Value
  if (lowerMessage.match(/\b(price|pricing|cost|value|worth|expensive|cheap|budget|affordable|cmim|vlera|kosto|shtrenj|lire|buxhet)\b/i)) {
    return { content: KNOWLEDGE_BASE.pricing[lang] };
  }

  // Buying
  if (lowerMessage.match(/\b(buy|purchase|order|how to get|blej|ble|porosi|marr)\b/i)) {
    return { content: KNOWLEDGE_BASE.buying[lang] };
  }

  // Commission / Custom
  if (lowerMessage.match(/\b(commission|custom|personalized|made for|porosi|personalizuar|bej per mua)\b/i)) {
    return { content: KNOWLEDGE_BASE.commission[lang] };
  }

  // Shipping / Delivery
  if (lowerMessage.match(/\b(ship|shipping|delivery|deliver|send|dergese|dergoj|transport)\b/i)) {
    return { content: KNOWLEDGE_BASE.shipping[lang] };
  }

  // Returns / Refund
  if (lowerMessage.match(/\b(return|refund|exchange|money back|kthim|rimburs|kthe|para mbrapsht)\b/i)) {
    return { content: KNOWLEDGE_BASE.returns[lang] };
  }

  // Contact
  if (lowerMessage.match(/\b(contact|support|help|email|phone|kontakt|ndihme|mbeshtet|email)\b/i)) {
    return { content: KNOWLEDGE_BASE.contact[lang] };
  }

  // Frame / Framing
  if (lowerMessage.match(/\b(frame|framing|korniz)\b/i)) {
    return { content: KNOWLEDGE_BASE.framing[lang] };
  }

  // Techniques / Mediums
  if (lowerMessage.match(/\b(technique|medium|oil|acrylic|watercolor|teknik|medium|vaj|akrilik|akuarel)\b/i)) {
    return { content: KNOWLEDGE_BASE.techniques[lang] };
  }

  // Original vs Print
  if (lowerMessage.match(/\b(original|print|authentic|reproduction|origjinal|printim|autentik|kopje)\b/i)) {
    return {
      content: lang === 'sq'
        ? `**Origjinale vs Printime**\n\n**Vepra Origjinale:**\n- Nje-e-vetme, e krijuar drejtperdrejt nga artisti\n- Vlere me e larte dhe potencial investimi\n- Certifikate autenticiteti e perfshire\n- Perfekte per koleksioniste serioze\n\n**Printime me Cilesi te Larte:**\n- Riprodhime te bukura ne leter ose canvas arkivor\n- Me te perballueshme\n- Shpesh ne botim te kufizuar\n- Mrekullueshme per dekor\n\nCdo listim tregon qarte nese eshte origjinal ose printim.\n\nShfleto koleksionin: /gallery`
        : `**Original vs Print Artworks**\n\n**Original Works:**\n- One-of-a-kind, created directly by the artist\n- Higher value and investment potential\n- Certificate of authenticity included\n- Perfect for serious collectors\n\n**High-Quality Prints:**\n- Beautiful reproductions on archival paper or canvas\n- More affordable price point\n- Often in limited editions\n- Great for decor\n\nEach listing clearly indicates whether it's an original or print.\n\nBrowse our collection: /gallery`
    };
  }

  // Recommendations
  if (lowerMessage.match(/\b(recommend|suggest|looking for|find me|help me find|rekomand|sugjero|kerkoj|me ndihmo te gjej)\b/i)) {
    return {
      content: lang === 'sq'
        ? `**Do te doja te ndihmoja te gjeni veprën perfekte!**\n\nPer te dhene rekomandime te mira, me tregoni:\n\n1. **Stili**: Cfare stili ju terheq? (abstrakt, realist, impresionist, etj.)\n2. **Ngjyrat**: Cfare ngjyrash do te pershtateshin ne hapesiren tuaj?\n3. **Madhesia**: A po kerkoni dicka te madhe apo te vogel?\n4. **Buxheti**: Sa jeni te gatshem te investoni?\n5. **Qellimi**: Eshte per nje dhome te caktuar apo rast?\n\nNdani keto detaje dhe do t'ju sugjeroj pjese nga koleksioni yne!\n\nOse filloni te shfletoni: /gallery`
        : `**I'd love to help you find the perfect artwork!**\n\nTo give great recommendations, tell me:\n\n1. **Style**: What style appeals to you? (abstract, realistic, impressionist, etc.)\n2. **Colors**: What colors would complement your space?\n3. **Size**: Are you looking for something large or small?\n4. **Budget**: How much are you willing to invest?\n5. **Purpose**: Is it for a specific room or occasion?\n\nShare these details and I'll suggest pieces from our collection!\n\nOr start browsing: /gallery`
    };
  }

  // Gallery browsing
  if (lowerMessage.match(/\b(gallery|browse|explore|see art|view|galeri|shfleto|eksploro|shiko)\b/i)) {
    return {
      content: lang === 'sq'
        ? `**Eksploroni Galerine Tone**\n\nGaleria jone ka qindra vepra te bukura!\n\n**Menyra per te Shfletuar:**\n- Sipas stilit (Abstrakt, Impresionizem, etj.)\n- Sipas gamës se cmimit\n- Sipas artistit\n- Te rejat (shto se fundmi)\n\n**Filtra te Disponueshëm:**\n- Stil\n- Cmim (min/max)\n- Madhesi\n- Medium\n\nFilloni te eksploroni tani: /gallery`
        : `**Explore Our Gallery**\n\nOur gallery features hundreds of beautiful artworks!\n\n**Ways to Browse:**\n- By style (Abstract, Impressionism, etc.)\n- By price range\n- By artist\n- New arrivals\n\n**Available Filters:**\n- Style\n- Price (min/max)\n- Size\n- Medium\n\nStart exploring now: /gallery`
    };
  }

  // Default response
  return {
    content: randomChoice(DEFAULT_RESPONSES[lang]),
    suggestedQuestions: lang === 'sq'
      ? ["Cfare stilesh keni?", "Si te regjistrohem?", "Tregom per cmimet"]
      : ["What styles do you have?", "How do I register?", "Tell me about pricing"]
  };
}

// Export welcome message
export const WELCOME_MESSAGE = {
  en: `Hello! I'm Alternus AI, your art assistant at Alternus Gallery.

I can help you with:
- Discovering artworks and artists
- Learning about art styles and movements
- Understanding pricing and art value
- Registration and account questions
- Shipping, returns, and orders
- Finding the perfect piece for your space

How can I assist you today?`,
  sq: `Pershendetje! Une jam Alternus AI, asistenti juaj i artit ne Alternus Gallery.

Mund t'ju ndihmoj me:
- Zbulimin e veprave dhe artisteve
- Mesimin per stilet dhe levizjet e artit
- Kuptimin e cmimeve dhe vleres se artit
- Pyetje per regjistrim dhe llogari
- Dergese, kthime dhe porosi
- Gjetjen e pjeses perfekte per hapesiren tuaj

Si mund t'ju ndihmoj sot?`
};

// Suggested questions for initial chat
export const SUGGESTED_QUESTIONS = {
  en: [
    "What is Alternus?",
    "How do I buy art?",
    "Tell me about Impressionism",
    "What are your prices?"
  ],
  sq: [
    "Cfare eshte Alternus?",
    "Si te blej art?",
    "Tregom per Impresionizmin",
    "Cilat jane cmimet?"
  ]
};
